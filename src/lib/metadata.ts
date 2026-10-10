import * as exifr from 'exifr';
import piexif from 'piexifjs';

const EMPTY_JPEG_DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/AT//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/AT//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/AT//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/AT//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/AT//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwD/2Q==';

export interface ReadMetadata {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  dateTime?: string;
  make?: string;
  model?: string;
  orientation?: number;
}

export async function readMetadata(file: File): Promise<ReadMetadata> {
  const parsed = await exifr.parse(file, { gps: true, exif: true, tiff: true }).catch(() => null);
  if (!parsed) return {};
  const date = parsed.DateTimeOriginal ?? parsed.CreateDate ?? parsed.ModifyDate;
  let dateTime = '';
  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    dateTime = local.toISOString().slice(0, 16);
  }
  return {
    latitude: finite(parsed.latitude) ? parsed.latitude : undefined,
    longitude: finite(parsed.longitude) ? parsed.longitude : undefined,
    altitude: finite(parsed.GPSAltitude) ? parsed.GPSAltitude : undefined,
    dateTime,
    make: typeof parsed.Make === 'string' ? parsed.Make.trim() : undefined,
    model: typeof parsed.Model === 'string' ? parsed.Model.trim() : undefined,
    orientation: finite(parsed.Orientation) ? parsed.Orientation : undefined
  };
}

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Convert decimal degrees to EXIF DMS rationals without invalid 60-second/minute values. */
export function toDms(value: number): [[number, number], [number, number], [number, number]] {
  if (!Number.isFinite(value)) throw new Error('Coordinate must be a finite number.');

  // Round once at 1/10,000-second precision, then split the integer units.
  // This naturally carries a rounded 60 seconds/minutes into the next unit.
  const unitsPerSecond = 10_000;
  const unitsPerDegree = 3_600 * unitsPerSecond;
  let remaining = Math.round(Math.abs(value) * unitsPerDegree);
  const degrees = Math.floor(remaining / unitsPerDegree);
  remaining -= degrees * unitsPerDegree;
  const unitsPerMinute = 60 * unitsPerSecond;
  const minutes = Math.floor(remaining / unitsPerMinute);
  const secondsUnits = remaining - minutes * unitsPerMinute;

  return [[degrees, 1], [minutes, 1], [secondsUnits, unitsPerSecond]];
}

export async function preserveExifOnJpeg(original: File, rendered: Blob): Promise<Blob> {
  if (!original.name.toLowerCase().match(/\.jpe?g$/i) && !original.type.toLowerCase().includes('jpeg')) {
    throw new Error('Preserving EXIF is currently supported for JPEG originals only.');
  }
  const originalData = await fileToDataUrl(original);
  const renderedData = await blobToDataUrl(rendered);
  const exif = loadExifOrEmpty(originalData);
  const ifd0 = (exif['0th'] ?? {}) as Record<string | number, unknown>;
  // The rendered pixels are already oriented by the browser; reset EXIF orientation to avoid a second rotation.
  ifd0[274] = 1;
  exif['0th'] = ifd0;
  return dataUrlToBlob(piexif.insert(piexif.dump(exif as never), renderedData));
}

export async function writeGpsToJpeg(file: File, latitude: number, longitude: number, altitude?: number): Promise<Blob> {
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) throw new Error('Latitude must be between −90 and 90 degrees.');
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw new Error('Longitude must be between −180 and 180 degrees.');
  if (!file.type.toLowerCase().includes('jpeg') && !file.name.toLowerCase().match(/\.jpe?g$/)) {
    throw new Error('GPS metadata writing currently supports JPEG files only. Export a JPEG to continue.');
  }
  const dataUrl = await fileToDataUrl(file);
  const exif = loadExifOrEmpty(dataUrl);
  const gps = (exif.GPS ?? {}) as Record<string, unknown>;
  gps[piexif.GPSIFD.GPSLatitudeRef] = latitude < 0 ? 'S' : 'N';
  gps[piexif.GPSIFD.GPSLatitude] = toDms(latitude);
  gps[piexif.GPSIFD.GPSLongitudeRef] = longitude < 0 ? 'W' : 'E';
  gps[piexif.GPSIFD.GPSLongitude] = toDms(longitude);
  if (typeof altitude === 'number' && Number.isFinite(altitude)) {
    gps[piexif.GPSIFD.GPSAltitudeRef] = altitude < 0 ? 1 : 0;
    gps[piexif.GPSIFD.GPSAltitude] = [Math.round(Math.abs(altitude) * 100), 100];
  }
  exif.GPS = gps;
  const output = piexif.insert(piexif.dump(exif as never), dataUrl);
  return dataUrlToBlob(output);
}

export async function removeGpsFromJpeg(file: File): Promise<Blob> {
  if (!file.type.toLowerCase().includes('jpeg') && !file.name.toLowerCase().match(/\.jpe?g$/)) {
    throw new Error('GPS removal currently supports JPEG files only.');
  }
  const dataUrl = await fileToDataUrl(file);
  const exif = loadExifOrEmpty(dataUrl);
  exif.GPS = {};
  return dataUrlToBlob(piexif.insert(piexif.dump(exif as never), dataUrl));
}

function loadExifOrEmpty(dataUrl: string): Record<string, unknown> {
  try {
    return piexif.load(dataUrl) as unknown as Record<string, unknown>;
  } catch (error) {
    // A valid JPEG without an EXIF segment is normal. Only use an empty EXIF
    // template when the source truly has no EXIF marker; malformed EXIF should
    // remain an actionable error instead of silently discarding metadata.
    const encoded = dataUrl.slice(dataUrl.indexOf(',') + 1);
    const binary = atob(encoded);
    if (binary.includes('Exif\u0000\u0000')) {
      throw new Error('This JPEG contains unreadable EXIF metadata. Try exporting without Keep EXIF.');
    }
    try {
      return piexif.load(EMPTY_JPEG_DATA_URL) as unknown as Record<string, unknown>;
    } catch {
      throw error;
    }
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read photo.'));
    reader.onerror = () => reject(new Error('Could not read photo.'));
    reader.readAsDataURL(file);
  });
}
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read rendered image.'));
    reader.onerror = () => reject(new Error('Could not read rendered image.'));
    reader.readAsDataURL(blob);
  });
}
function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, content] = dataUrl.split(',');
  const bytes = atob(content);
  const array = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) array[i] = bytes.charCodeAt(i);
  return new Blob([array], { type: meta.match(/data:([^;]+)/)?.[1] ?? 'image/jpeg' });
}