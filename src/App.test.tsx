import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as exifr from 'exifr';
import App from './App';
import { writeGpsToJpeg } from './lib/metadata';
import { jpegFile } from './test/jpeg-fixture';

const originalCreateObjectURL = Object.getOwnPropertyDescriptor(URL, 'createObjectURL');
const originalRevokeObjectURL = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL');
const exportedBlobs = new Map<string, Blob>();
let downloadHref = '';

class DecodableImage {
  naturalWidth = 1;
  naturalHeight = 1;
  onload?: () => void;
  onerror?: () => void;
  set src(_value: string) { queueMicrotask(() => this.onload?.()); }
}

beforeEach(() => {
  exportedBlobs.clear();
  downloadHref = '';
  vi.stubGlobal('Image', DecodableImage);
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: (blob: Blob) => {
      const url = `blob:geostamp-${exportedBlobs.size + 1}`;
      exportedBlobs.set(url, blob);
      return url;
    }
  });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    downloadHref = this.href;
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  if (originalCreateObjectURL) Object.defineProperty(URL, 'createObjectURL', originalCreateObjectURL);
  else delete (URL as Partial<typeof URL>).createObjectURL;
  if (originalRevokeObjectURL) Object.defineProperty(URL, 'revokeObjectURL', originalRevokeObjectURL);
  else delete (URL as Partial<typeof URL>).revokeObjectURL;
});

describe('GeoStamp app shell', () => {
  it('renders the main photo workflow and ad placeholders', () => {
    render(<App />);
    expect(screen.getByText('GeoStamp')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /upload photos/i }).length).toBeGreaterThan(0);
    expect(screen.getByText(/top banner ad space/i)).toBeInTheDocument();
  });

  it('strips imported EXIF unless the user edits GPS while Keep EXIF is off', async () => {
    const gpsTagged = await writeGpsToJpeg(jpegFile('photo.jpg'), 19.076, 72.8777, 15);
    render(<App />);
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (!fileInput) throw new Error('Photo input was not rendered');

    fireEvent.change(fileInput, { target: { files: [new File([gpsTagged], 'photo.jpg', { type: 'image/jpeg' })] } });
    await screen.findAllByText('1 selected');
    fireEvent.click(screen.getAllByLabelText('Keep EXIF')[0]);
    fireEvent.change(screen.getAllByLabelText('Format')[0], { target: { value: 'original' } });
    fireEvent.click(screen.getByRole('button', { name: /download 1 photo/i }));

    await screen.findByText('1 photo exported. Original files were not modified.');
    const exported = exportedBlobs.get(downloadHref);
    expect(exported).toBeDefined();
    const metadata = await exifr.parse(new File([exported!], 'export.jpg', { type: 'image/jpeg' }), { gps: true, exif: true });
    expect(metadata).toBeUndefined();

    const firstDownload = downloadHref;
    fireEvent.change(screen.getByLabelText('Latitude'), { target: { value: '40' } });
    fireEvent.change(screen.getByLabelText('Longitude'), { target: { value: '20' } });
    fireEvent.click(screen.getByRole('button', { name: /download 1 photo/i }));
    await waitFor(() => expect(downloadHref).not.toBe(firstDownload));
    const geotagged = exportedBlobs.get(downloadHref);
    expect(geotagged).toBeDefined();
    const updatedMetadata = await exifr.parse(new File([geotagged!], 'updated.jpg', { type: 'image/jpeg' }), { gps: true });
    expect(updatedMetadata?.latitude).toBeCloseTo(40, 4);
    expect(updatedMetadata?.longitude).toBeCloseTo(20, 4);
  });
});
