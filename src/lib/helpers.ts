const BYTE_UNITS = ['B', 'KB', 'MB', 'GB'] as const;

/** Format non-negative finite byte counts without leaking NaN/Infinity into the UI. */
export function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0 B';
  const unitIndex = Math.min(Math.floor(Math.log(value) / Math.log(1024)), BYTE_UNITS.length - 1);
  const formatted = (value / 1024 ** unitIndex).toFixed(unitIndex === 0 ? 0 : 1);
  return `${formatted} ${BYTE_UNITS[unitIndex]}`;
}

/** Build a predictable export filename from a user-controlled source filename. */
export function outputName(name: string, stamped: boolean): string {
  // File.name is normally a basename, but imported/constructed Files can contain separators.
  const basename = name.replace(/[\\/\\u0000-\\u001f\\u007f]/g, '_').trim() || 'photo';
  const dot = basename.lastIndexOf('.');
  const base = dot > 0 ? basename.slice(0, dot) : basename;
  const extension = dot > 0 ? basename.slice(dot).toLowerCase() : '.img';
  const safeBase = base.replace(/^[. ]+|[. ]+$/g, '') || 'photo';
  const jpegOutput = stamped || ['.jpg', '.jpeg'].includes(extension);
  return `${safeBase}-geostamp${stamped ? '-stamped' : ''}${jpegOutput ? '.jpg' : extension}`;
}

/** Convert a parseable date to the local datetime-local input representation. */
export function localDateTime(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
