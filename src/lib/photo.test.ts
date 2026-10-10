import {describe,expect,it} from 'vitest';
const outputName=(s:string,stamp:boolean)=>s.replace(/\\.[^.]+$/,'')+`-geostamp${stamp?'-stamped':''}.jpg`;
const bytes=(n:number)=>n<1024?n+' B':(n/1024).toFixed(1)+' KB';
const localDate=(s:string)=>{const d=new Date(s);if(Number.isNaN(+d))return '';const p=(n:number)=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;};
describe('photo helpers',()=>{it('creates clear output names',()=>{expect(outputName('trip.photo.jpeg',true)).toBe('trip.photo-geostamp-stamped.jpg');expect(outputName('image.png',false)).toBe('image-geostamp.jpg');});it('formats sizes',()=>{expect(bytes(0)).toBe('0 B');expect(bytes(1024)).toBe('1.0 KB');});it('rejects invalid dates',()=>{expect(localDate('not a date')).toBe('');});});
