import { describe, expect, it } from 'vitest';
import * as exifr from 'exifr';
import {
  preserveExifOnJpeg,
  readMetadata,
  removeGpsFromJpeg,
  writeGpsToJpeg,
} from './metadata';

// A small valid 1×1 JPEG fixture. These tests exercise real EXIF bytes rather
// than mocking piexifjs or the metadata parser.
const JPEG_BASE64 = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/AT//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/AT//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/AT//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/AT//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/AT//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwD/2Q==';

function fixture(name = 'fixture.jpg'): File {
  const binary = atob(JPEG_BASE64);
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  return new File([bytes], name, { type: 'image/jpeg' });
}

async function parseGps(blob: Blob) {
  return exifr.parse(new File([blob], 'output.jpg', { type: 'image/jpeg' }), { gps: true });
}

describe('JPEG EXIF round-trip', () => {
  it('writes signed GPS coordinates and altitude to real JPEG bytes', async () => {
    const output = await writeGpsToJpeg(fixture(), -33.8688, 151.2093, -12.5);
    const parsed = await parseGps(output);

    expect(parsed?.latitude).toBeCloseTo(-33.8688, 4);
    expect(parsed?.longitude).toBeCloseTo(151.2093, 4);
    expect(parsed?.GPSAltitude).toBeCloseTo(12.5, 1);
    expect(parsed?.GPSAltitudeRef).toBe(1);
  });

  it('removes GPS metadata from a JPEG copy', async () => {
    const tagged = await writeGpsToJpeg(fixture(), 19.076, 72.8777, 15);
    const output = await removeGpsFromJpeg(new File([tagged], 'tagged.jpg', { type: 'image/jpeg' }));
    const parsed = await parseGps(output);

    expect(parsed?.latitude).toBeUndefined();
    expect(parsed?.longitude).toBeUndefined();
    expect(parsed?.GPSAltitude).toBeUndefined();
  });

  it('clears stale altitude when coordinates are rewritten without altitude', async () => {
    const tagged = await writeGpsToJpeg(fixture(), 19.076, 72.8777, 420);
    const rewritten = await writeGpsToJpeg(new File([tagged], 'tagged.jpg', { type: 'image/jpeg' }), 19.076, 72.8777);
    const parsed = await parseGps(rewritten);

    expect(parsed?.latitude).toBeCloseTo(19.076, 4);
    expect(parsed?.longitude).toBeCloseTo(72.8777, 4);
    expect(parsed?.GPSAltitude).toBeUndefined();
    expect(parsed?.GPSAltitudeRef).toBeUndefined();
  });

  it('preserves GPS EXIF when stamping a JPEG copy and resets orientation', async () => {
    const tagged = await writeGpsToJpeg(fixture(), 19.076, 72.8777);
    const output = await preserveExifOnJpeg(
      new File([tagged], 'tagged.jpg', { type: 'image/jpeg' }),
      new Blob([Uint8Array.from(atob(JPEG_BASE64), character => character.charCodeAt(0))], { type: 'image/jpeg' }),
    );
    const parsed = await parseGps(output);

    expect(parsed?.latitude).toBeCloseTo(19.076, 4);
    expect(parsed?.longitude).toBeCloseTo(72.8777, 4);
    expect(parsed?.Orientation).toBe(1);
  });

  it('rejects invalid GPS coordinates before modifying the file', async () => {
    await expect(writeGpsToJpeg(fixture(), 91, 10)).rejects.toThrow(/latitude/i);
    await expect(writeGpsToJpeg(fixture(), 10, 181)).rejects.toThrow(/longitude/i);
    await expect(writeGpsToJpeg(fixture(), Number.NaN, 10)).rejects.toThrow(/latitude/i);
  });

  it('returns empty metadata for an unreadable image instead of crashing', async () => {
    const invalid = new File(['not an image'], 'invalid.jpg', { type: 'image/jpeg' });
    await expect(readMetadata(invalid)).resolves.toEqual({});
  });
});
