declare module 'piexifjs' {
  const piexif: {
    GPSIFD: Record<string, number>;
    ImageIFD: Record<string, number>;
    load(data: string): Record<string, unknown>;
    dump(data: never): string;
    insert(exifBytes: string, jpegData: string): string;
  };
  export default piexif;
}
