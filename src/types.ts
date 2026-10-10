export interface Metadata {latitude?:number;longitude?:number;altitude?:number;dateTime?:string;make?:string;model?:string;width?:number;height?:number;hasGps:boolean}
export interface Photo {id:string;file:File;url:string;latitude:string;longitude:string;altitude:string;location:string;dateTime:string;tag:string;stamp:boolean;meta:Metadata}
export type Tab='Location'|'Stamp'|'EXIF'|'Tags';