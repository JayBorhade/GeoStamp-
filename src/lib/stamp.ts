import type { StampSettings, PhotoItem } from '../types';

export async function convertPhotoToJpeg(photo: PhotoItem, quality = 0.92): Promise<Blob> {
  const image = await loadImage(photo.url);
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth || photo.width;
  canvas.height = image.naturalHeight || photo.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Your browser could not create an image canvas.');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not convert photo to JPEG.')), 'image/jpeg', Math.min(1, Math.max(0.5, quality))));
}

export async function renderStampedPhoto(photo: PhotoItem, settings: StampSettings, quality = 0.92): Promise<Blob> {
  const image = await loadImage(photo.url);
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth || photo.width;
  canvas.height = image.naturalHeight || photo.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Your browser could not create an image canvas.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const scale = Math.max(canvas.width / 1400, 0.65);
  const padding = 18 * scale;
  const fontSize = Math.max(16, canvas.width * 0.022);
  const lines: string[] = [];
  if (settings.showLocation && photo.locationName.trim()) lines.push(photo.locationName.trim());
  if (settings.showDate && photo.dateTime) lines.push(new Date(photo.dateTime).toLocaleString());
  if (settings.showCoordinates && typeof photo.latitude === 'number' && typeof photo.longitude === 'number') {
    lines.push(`${photo.latitude.toFixed(5)}°, ${photo.longitude.toFixed(5)}°`);
  }
  if (settings.customText.trim()) lines.push(settings.customText.trim());
  if (!lines.length) lines.push('GeoStamp');
  context.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
  const textWidth = Math.max(...lines.map(line => context.measureText(line).width));
  const lineHeight = fontSize * 1.45;
  const boxWidth = textWidth + padding * 2;
  const boxHeight = lines.length * lineHeight + padding * 2;
  const margin = Math.max(16, canvas.width * 0.025);
  const left = settings.position.endsWith('left') ? margin : canvas.width - boxWidth - margin;
  const top = settings.position.startsWith('top') ? margin : canvas.height - boxHeight - margin;
  context.save();
  context.globalAlpha = settings.opacity / 100;
  if (settings.style !== 'minimal') {
    context.fillStyle = settings.background;
    context.beginPath();
    context.roundRect(left, top, boxWidth, boxHeight, 10 * scale);
    context.fill();
  }
  context.fillStyle = settings.color;
  context.textBaseline = 'top';
  lines.forEach((line, index) => context.fillText(line, left + padding, top + padding + index * lineHeight));
  context.restore();
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not render stamped photo.')), 'image/jpeg', Math.min(1, Math.max(0.5, quality))));
}
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not load the selected photo.'));
    image.src = src;
  });
}