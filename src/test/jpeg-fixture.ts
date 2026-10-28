export const JPEG_BASE64 = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/AT//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/AT//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/AT//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/AT//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/AT//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwD/2Q==';

export function jpegFile(name = 'fixture.jpg'): File {
  const binary = atob(JPEG_BASE64);
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  return new File([bytes], name, { type: 'image/jpeg' });
}