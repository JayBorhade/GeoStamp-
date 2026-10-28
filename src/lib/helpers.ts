const BYTE_UNITS = ['B', 'KB', 'MB', 'GB'] as const;

export function safeFileStem(name: string): string {
  const flattened = name.split(String.fromCharCode(92)).join('_').split('/').join('_');
  const sanitized = Array.from(flattened, character => {
    const code = character.charCodeAt(0);
    return code < 32 || code === 127 ? '_' : character;
  }).join('').trim();
  const dot = sanitized.lastIndexOf('.');
  const stem = dot > 0 ? sanitized.slice(0, dot) : sanitized;
  return stem.replace(/^[._ ]+|[. ]+$/g, '') || 'photo';
}

export function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0 B';
  const unitIndex = Math.min(Math.floor(Math.log(value) / Math.log(1024)), BYTE_UNITS.length - 1);
  return `${(value / 1024 ** unitIndex).toFixed(unitIndex === 0 ? 0 : 1)} ${BYTE_UNITS[unitIndex]}`;
}

export function outputName(name: string, stamped: boolean): string {
  const sanitized = name.split(String.fromCharCode(92)).join('_').split('/').join('_');
  const dot = sanitized.lastIndexOf('.');
  const extension = dot > 0 ? sanitized.slice(dot).toLowerCase() : '.img';
  const jpegOutput = stamped || ['.jpg', '.jpeg'].includes(extension);
  return `${safeFileStem(name)}-geostamp${stamped ? '-stamped' : ''}${jpegOutput ? '.jpg' : extension}`;
}

export function localDateTime(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
