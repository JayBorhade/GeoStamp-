import {describe,expect,it} from 'vitest';
import {formatBytes,localDateTime,outputName} from './helpers';
describe('photo helpers',()=>{
 it('formats byte sizes',()=>{expect(formatBytes(0)).toBe('0 B');expect(formatBytes(1024)).toBe('1.0 KB');expect(formatBytes(1024**2)).toBe('1.0 MB');});
 it('preserves untouched image extensions and labels JPEG stamps',()=>{expect(outputName('trip.photo.jpeg',true)).toBe('trip.photo-geostamp-stamped.jpg');expect(outputName('image.png',false)).toBe('image-geostamp.png');expect(outputName('image.jpg',false)).toBe('image-geostamp.jpg');});
 it('formats valid local datetime values and rejects invalid ones',()=>{expect(localDateTime('not a date')).toBe('');expect(localDateTime('2024-07-26T10:12:00.000Z')).toMatch(/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}$/);});
});
