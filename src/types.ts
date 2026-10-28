export type PhotoStatus = 'ready' | 'processing' | 'done' | 'error';
export interface PhotoItem {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
  width: number;
  height: number;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  gpsDirty: boolean;
  locationName: string;
  dateTime: string;
  tags: string[];
  status: PhotoStatus;
  removeGps: boolean;
  error?: string;
}
export type EditorTab = 'Location' | 'Stamp' | 'EXIF' | 'Tags';
export interface StampSettings {
  enabled: boolean;
  showLocation: boolean;
  showDate: boolean;
  showCoordinates: boolean;
  customText: string;
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  style: 'classic' | 'minimal' | 'travel';
  opacity: number;
  color: string;
  background: string;
}
