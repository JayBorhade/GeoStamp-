declare module 'piexifjs' {
  const piexif: {
    GPSIFD: Record<string, number>;
    ExifIFD: Record<string, number>;
    load(data: string): unknown;
    dump(data: unknown): string;
    insert(exifBytes: string, jpegDataUrl: string): string;
  };
  export default piexif;
}
