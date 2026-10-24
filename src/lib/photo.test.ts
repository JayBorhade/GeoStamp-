import { describe, expect, it } from 'vitest';
import { formatBytes, localDateTime, outputName, safeFileStem } from './helpers';
import { toDms } from './metadata';

describe('photo helpers', () => {
  it('formats byte sizes safely', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(1024 ** 2)).toBe('1.0 MB');
    expect(formatBytes(-1)).toBe('0 B');
    expect(formatBytes(Number.NaN)).toBe('0 B');
    expect(formatBytes(Number.POSITIVE_INFINITY)).toBe('0 B');
  });

  it('preserves supported extensions and labels JPEG stamps', () => {
    expect(outputName('trip.photo.jpeg', true)).toBe('trip.photo-geostamp-stamped.jpg');
    expect(outputName('image.png', false)).toBe('image-geostamp.png');
    expect(outputName('image.jpg', false)).toBe('image-geostamp.jpg');
    expect(outputName('../folder\\photo.png', false)).toBe('folder_photo-geostamp.png');
    expect(safeFileStem('../folder\\photo.png')).toBe('folder_photo');
    expect(safeFileStem('')).toBe('photo');
  });

  it('formats valid local datetime values and rejects invalid ones', () => {
    expect(localDateTime('not a date')).toBe('');
    expect(localDateTime('')).toBe('');
    expect(localDateTime('2024-07-26T10:12:00.000Z')).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });
});

describe('EXIF decimal-degree conversion', () => {
  it('converts ordinary coordinates to DMS rationals', () => {
    expect(toDms(19.076)).toEqual([[19, 1], [4, 1], [336000, 10000]]);
    expect(toDms(-72.8777)).toEqual([[72, 1], [52, 1], [397200, 10000]]);
  });

  it('carries rounding across degree and minute boundaries', () => {
    expect(toDms(12 + 59 / 60 + 59.99999999 / 3600)).toEqual([[13, 1], [0, 1], [0, 10000]]);
    expect(toDms(89.999999999)).toEqual([[90, 1], [0, 1], [0, 10000]]);
  });

  it('rejects non-finite coordinates', () => {
    expect(() => toDms(Number.NaN)).toThrow(/finite number/i);
    expect(() => toDms(Number.POSITIVE_INFINITY)).toThrow(/finite number/i);
  });
});
