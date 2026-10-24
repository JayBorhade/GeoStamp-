import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import {
  MapPin, Tag, FilePenLine, Stamp, Layers3, Trash2, Download, Upload,
  HelpCircle, Settings, Crown, CheckCircle2, Image as ImageIcon, Search, X,
  Plus, Minus, Maximize, RotateCcw, ChevronDown, ChevronLeft, ChevronRight,
  Crosshair, CalendarDays, ShieldCheck, Menu, Check,
  SlidersHorizontal, AlertCircle, Info, LoaderCircle
} from 'lucide-react';
import JSZip from 'jszip';
import type { PhotoItem, EditorTab, StampSettings } from './types';
import { readMetadata, writeGpsToJpeg, removeGpsFromJpeg, preserveExifOnJpeg, type ReadMetadata } from './lib/metadata';
import { renderStampedPhoto, convertPhotoToJpeg } from './lib/stamp';
import { safeFileStem } from './lib/helpers';

const MAX_FILE_MB = 40;
const MAX_PHOTOS = 50;
const MAX_IMAGE_PIXELS = 60_000_000;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const initialStamp: StampSettings = {
  enabled: true, showLocation: true, showDate: true, showCoordinates: false,
  customText: '', position: 'bottom-left', style: 'classic', opacity: 88,
  color: '#ffffff', background: '#102a23'
};

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function id() { return `photo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`; }
function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function outputName(name: string, suffix: string) {
  return `${safeFileStem(name)}-${suffix}.jpg`;
}
export default function App() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tab, setTab] = useState<EditorTab>('Location');
  const [stamp, setStamp] = useState<StampSettings>(initialStamp);
  const [zoom, setZoom] = useState(70);
  const [showStamped, setShowStamped] = useState(true);
  const [keepExif, setKeepExif] = useState(true);
  const [outputFormat, setOutputFormat] = useState('jpg');
  const [quality, setQuality] = useState('90');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [notice, setNotice] = useState<{ kind: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchTag, setSearchTag] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const objectUrls = useRef<Set<string>>(new Set());
  const active = photos.find(photo => photo.id === activeId) ?? photos[0] ?? null;
  const selectedPhotos = photos.filter(photo => selectedIds.includes(photo.id));
  const totalSize = selectedPhotos.reduce((sum, photo) => sum + photo.size, 0);

  const updatePhoto = useCallback((photoId: string, patch: Partial<PhotoItem>) => {
    setPhotos(current => current.map(photo => photo.id === photoId ? { ...photo, ...patch } : photo));
  }, []);

  useEffect(() => () => { objectUrls.current.forEach(url => URL.revokeObjectURL(url)); objectUrls.current.clear(); }, []);

  const addFiles = useCallback(async (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    const remainingSlots = Math.max(0, MAX_PHOTOS - photos.length);
    const files = incoming.slice(0, remainingSlots);
    const next: PhotoItem[] = [];
    const errors: string[] = [];
    if (incoming.length > files.length) errors.push(`Only ${MAX_PHOTOS} photos can be kept in the workspace at once; ${incoming.length - files.length} file(s) skipped.`);
    for (const file of files) {
      const isSupported = ACCEPTED.includes(file.type) || /\.(jpe?g|png|webp|avif)$/i.test(file.name);
      if (!isSupported) { errors.push(`${file.name}: unsupported format`); continue; }
      if (file.size > MAX_FILE_MB * 1024 * 1024) { errors.push(`${file.name}: exceeds ${MAX_FILE_MB} MB`); continue; }
      if (file.size === 0) { errors.push(`${file.name}: empty file`); continue; }
      const url = URL.createObjectURL(file);
      objectUrls.current.add(url);
      try {
        const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
          image.onerror = () => reject(new Error('Could not decode image'));
          image.src = url;
        });
        if (!Number.isFinite(dimensions.width) || !Number.isFinite(dimensions.height) || dimensions.width < 1 || dimensions.height < 1) throw new Error('Invalid image dimensions');
        if (dimensions.width * dimensions.height > MAX_IMAGE_PIXELS) throw new Error('Image dimensions are too large to process safely (maximum 60 megapixels)');
        const metadata = await readMetadata(file).catch((): ReadMetadata => ({}));
        next.push({
          id: id(), file, url, name: file.name, size: file.size,
          width: dimensions.width, height: dimensions.height,
          latitude: metadata.latitude, longitude: metadata.longitude, altitude: metadata.altitude,
          locationName: '', dateTime: metadata.dateTime ?? '', tags: [], status: 'ready', removeGps: false
        });
      } catch {
        URL.revokeObjectURL(url);
        objectUrls.current.delete(url);
        errors.push(`${file.name}: could not read image`);
      }
    }
    if (next.length) {
      setPhotos(current => [...current, ...next]);
      setSelectedIds(current => [...new Set([...current, ...next.map(photo => photo.id)])]);
      setActiveId(current => current ?? next[0].id);
      setNotice({ kind: errors.length ? 'info' : 'success', text: `${next.length} photo${next.length === 1 ? '' : 's'} added${errors.length ? `. ${errors.length} skipped — check format or file size.` : '.'}` });
    } else if (errors.length) setNotice({ kind: 'error', text: errors.slice(0, 2).join(' • ') });
  }, [photos.length]);

  const removePhoto = (photoId: string) => {
    const target = photos.find(photo => photo.id === photoId);
    if (target) { URL.revokeObjectURL(target.url); objectUrls.current.delete(target.url); }
    const remaining = photos.filter(photo => photo.id !== photoId);
    setPhotos(remaining);
    setSelectedIds(current => current.filter(value => value !== photoId));
    if (activeId === photoId) setActiveId(remaining[0]?.id ?? null);
  };
  const clearAll = () => {
    photos.forEach(photo => { URL.revokeObjectURL(photo.url); objectUrls.current.delete(photo.url); });
    setPhotos([]); setActiveId(null); setSelectedIds([]);
    if (fileInput.current) fileInput.current.value = '';
    setNotice({ kind: 'info', text: 'Gallery cleared. Your original files were not changed.' });
  };
  const toggleSelected = (photoId: string) => setSelectedIds(current => current.includes(photoId) ? current.filter(value => value !== photoId) : [...current, photoId]);
  const chooseActive = (photo: PhotoItem) => { setActiveId(photo.id); if (!selectedIds.includes(photo.id)) setSelectedIds(current => [...current, photo.id]); };

  const captureLocation = () => {
    if (!active) { setNotice({ kind: 'info', text: 'Add a photo first, then capture its location.' }); return; }
    if (!navigator.geolocation) { setNotice({ kind: 'error', text: 'Location capture is not supported by this browser.' }); return; }
    setBusy(true); setProgress('Requesting location permission…');
    navigator.geolocation.getCurrentPosition(position => {
      updatePhoto(active.id, { latitude: position.coords.latitude, longitude: position.coords.longitude, altitude: position.coords.altitude ?? undefined, removeGps: false });
      setBusy(false); setProgress('');
      setNotice({ kind: 'success', text: 'Current coordinates captured. Apply to selected photos or export this photo.' });
      setTab('Location');
    }, error => {
      setBusy(false); setProgress('');
      const message = error.code === error.PERMISSION_DENIED ? 'Location permission was denied. Allow location access in your browser settings to use this feature.' : error.code === error.TIMEOUT ? 'Location request timed out. Try again in a place with a clearer signal.' : 'Current location is unavailable. You can enter coordinates manually.';
      setNotice({ kind: 'error', text: message });
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 });
  };

  const applyLocationToSelected = () => {
    if (!active || typeof active.latitude !== 'number' || typeof active.longitude !== 'number' || !Number.isFinite(active.latitude) || !Number.isFinite(active.longitude) || active.latitude < -90 || active.latitude > 90 || active.longitude < -180 || active.longitude > 180) {
      setNotice({ kind: 'error', text: 'Enter valid coordinates: latitude −90 to 90 and longitude −180 to 180.' }); return;
    }
    const ids = selectedIds.length ? selectedIds : [active.id];
    setPhotos(current => current.map(photo => ids.includes(photo.id) ? {
      ...photo, latitude: active.latitude, longitude: active.longitude, altitude: active.altitude, locationName: active.locationName, removeGps: false
    } : photo));
    setNotice({ kind: 'success', text: `Location applied to ${ids.length} photo${ids.length === 1 ? '' : 's'}.` });
  };

  const removeLocationFromSelected = () => {
    const ids = selectedIds.length ? selectedIds : active ? [active.id] : [];
    if (!ids.length) return;
    setPhotos(current => current.map(photo => ids.includes(photo.id) ? { ...photo, latitude: undefined, longitude: undefined, altitude: undefined, locationName: '', removeGps: true } : photo));
    setNotice({ kind: 'success', text: `GPS values cleared from ${ids.length} photo${ids.length === 1 ? '' : 's'} in the workspace. Export to write the change to copies.` });
  };

  const applyTag = () => {
    if (!tagInput.trim()) return;
    const ids = selectedIds.length ? selectedIds : active ? [active.id] : [];
    setPhotos(current => current.map(photo => ids.includes(photo.id) && !photo.tags.includes(tagInput.trim()) ? { ...photo, tags: [...photo.tags, tagInput.trim()] } : photo));
    setTagInput('');
    setNotice({ kind: 'success', text: `Tag applied to ${ids.length} selected photo${ids.length === 1 ? '' : 's'}.` });
  };

  const exportPhotos = async (removeGps = false) => {
    const targets = selectedPhotos.length ? selectedPhotos : active ? [active] : [];
    if (!targets.length) { setNotice({ kind: 'info', text: 'Upload and select at least one photo to export.' }); return; }
    setBusy(true); setNotice(null);
    const zip = new JSZip();
    const usedNames = new Set<string>();
    let success = 0;
    const failures: string[] = [];
    try {
      for (let index = 0; index < targets.length; index++) {
        const photo = targets[index];
        setProgress(`Processing ${index + 1} of ${targets.length}: ${photo.name}`);
        updatePhoto(photo.id, { status: 'processing', error: undefined });
        try {
          let blob: Blob = photo.file;
          let name = photo.name;
          const isJpeg = photo.file.type === 'image/jpeg' || /\.jpe?g$/i.test(photo.name);
          const hasStamp = stamp.enabled && showStamped && outputFormat !== 'original';
          if (hasStamp) {
            blob = await renderStampedPhoto(photo, stamp, Number(quality) / 100);
            if (keepExif && isJpeg) blob = await preserveExifOnJpeg(photo.file, blob);
            name = outputName(photo.name, 'stamped');
          } else if (outputFormat === 'jpg' && !isJpeg) {
            blob = await convertPhotoToJpeg(photo, Number(quality) / 100);
            name = outputName(photo.name, 'converted');
          }
          if (typeof photo.latitude === 'number' && (photo.latitude < -90 || photo.latitude > 90 || !Number.isFinite(photo.latitude))) throw new Error('Latitude must be between −90 and 90 degrees.');
          if (typeof photo.longitude === 'number' && (photo.longitude < -180 || photo.longitude > 180 || !Number.isFinite(photo.longitude))) throw new Error('Longitude must be between −180 and 180 degrees.');
          if ((typeof photo.latitude === 'number') !== (typeof photo.longitude === 'number')) throw new Error('Enter both latitude and longitude, or clear both coordinates before exporting.');
          if (photo.altitude !== undefined && !Number.isFinite(photo.altitude)) throw new Error('Altitude must be a finite number.');
          if ((removeGps || photo.removeGps) && !isJpeg) throw new Error('GPS metadata removal is supported for JPEG files only. This file was not changed.');
          if ((removeGps || photo.removeGps) && isJpeg) {
            blob = await removeGpsFromJpeg(new File([blob], name, { type: 'image/jpeg' }));
            name = outputName(photo.name, 'no-gps');
          } else if (!removeGps && !photo.removeGps && isJpeg && typeof photo.latitude === 'number' && typeof photo.longitude === 'number') {
            blob = await writeGpsToJpeg(new File([blob], name, { type: 'image/jpeg' }), photo.latitude, photo.longitude, photo.altitude);
            if (hasStamp) name = outputName(photo.name, 'stamped-geotagged');
            else name = outputName(photo.name, 'geotagged');
          } else if (!removeGps && (typeof photo.latitude === 'number' || typeof photo.longitude === 'number') && !isJpeg) {
            throw new Error('GPS writing is currently supported for JPEG only. This file can be previewed, but its GPS metadata was not written.');
          }
          if (hasStamp && !keepExif && isJpeg && !removeGps) {
            // Canvas output is a new image and does not retain EXIF by default; this is expected when Keep EXIF is off.
          }
          let finalName = name;
          let suffix = 2;
          while (usedNames.has(finalName.toLowerCase())) {
            finalName = finalName.replace(/\.jpg$/i, `-${suffix++}.jpg`);
          }
          usedNames.add(finalName.toLowerCase());
          if (targets.length === 1) downloadBlob(blob, finalName);
          else zip.file(finalName, blob);
          success++;
          updatePhoto(photo.id, { status: 'done' });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unexpected export error';
          failures.push(`${photo.name}: ${message}`);
          updatePhoto(photo.id, { status: 'error', error: message });
        }
      }
      if (targets.length > 1 && success > 0) {
        setProgress('Preparing ZIP download…');
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadBlob(zipBlob, `geostamp-export-${new Date().toISOString().slice(0, 10)}.zip`);
      }
      setNotice({
        kind: failures.length ? 'error' : 'success',
        text: `${success} photo${success === 1 ? '' : 's'} exported${failures.length ? `; ${failures.length} failed. ${failures[0]}` : ''}. Original files were not modified.`
      });
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'Export failed.' });
    } finally { setBusy(false); setProgress(''); }
  };

  const activePreview = useMemo(() => active?.url, [active?.url]);
  const onDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); if (event.dataTransfer.files.length) void addFiles(event.dataTransfer.files); };

  const toolButtons = [
    { label: 'Upload Photos', icon: Upload, action: () => fileInput.current?.click(), primary: true },
    { label: 'Capture Location', icon: Crosshair, action: captureLocation },
    { label: 'Set Location', icon: MapPin, action: () => setTab('Location') },
    { label: 'Add Tag', icon: Tag, action: () => setTab('Tags') },
    { label: 'Edit EXIF', icon: FilePenLine, action: () => setTab('EXIF') },
    { label: 'Add Stamp', icon: Stamp, action: () => setTab('Stamp'), active: tab === 'Stamp' },
    { label: 'Batch Edit', icon: Layers3, action: () => setNotice({ kind: 'info', text: selectedIds.length > 1 ? `${selectedIds.length} photos selected. Choose a tool, then use Apply to Selected.` : 'Select multiple photos from the gallery to use batch editing.' }) },
    { label: 'Remove Location', icon: Trash2, action: removeLocationFromSelected, danger: true },
  ];

  return (
    <div className="app-shell" onDrop={onDrop} onDragOver={event => event.preventDefault()}>
      <input ref={fileInput} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif" multiple onChange={event => { if (event.target.files) void addFiles(event.target.files); event.currentTarget.value = ''; }} />
      <header className="topbar">
        <a className="brand" href="#" aria-label="GeoStamp home" onClick={event => { event.preventDefault(); setTab('Location'); }}>
          <span className="brand-mark"><MapPin size={26} fill="currentColor" strokeWidth={2.5} /></span>
          <span><strong>GeoStamp</strong><small>Edit. Tag. Stamp. Share with Location.</small></span>
        </a>
        <div className="ad-slot top-ad"><span className="ad-eyebrow">ADVERTISEMENT</span><strong>Top Banner Ad Space</strong><small>728 × 90 · Reserved placement</small></div>
        <div className="top-actions">
          <button className="icon-text subtle-button" onClick={() => setNotice({ kind: 'info', text: 'Tip: select photos, choose a tool, then export new copies. Files are processed in your browser.' })}><HelpCircle size={17} /> <span>Help</span></button>
          <button className="icon-text subtle-button" onClick={() => setShowSettings(value => !value)}><Settings size={17} /><span>Settings</span></button>
          <button className="upgrade-button" onClick={() => setNotice({ kind: 'info', text: 'Pro plans are not enabled yet. Core editing is available in this build.' })}><Crown size={16} fill="currentColor" /><span>Upgrade</span></button>
          <button className="mobile-menu-button" aria-label="Open tools" onClick={() => setMobileMenu(value => !value)}><Menu size={21} /></button>
        </div>
      </header>

      <nav className={`toolbar ${mobileMenu ? 'toolbar-open' : ''}`} aria-label="Photo tools">
        {toolButtons.map((tool, index) => {
          const Icon = tool.icon;
          return <button key={tool.label} className={`tool-button ${tool.primary ? 'tool-primary' : ''} ${tool.active ? 'tool-active' : ''} ${tool.danger ? 'tool-danger' : ''}`} onClick={() => { tool.action(); setMobileMenu(false); }}>
            <Icon size={18} strokeWidth={2.2} /><span>{tool.label}</span>{index === 0 && <span className="mobile-only">＋</span>}
          </button>;
        })}
        <button className="tool-button export-tool" onClick={() => void exportPhotos()}><Download size={18} /><span>Export</span><ChevronDown size={15} /></button>
      </nav>

      {notice && <div className={`notice notice-${notice.kind}`} role="status">
        {notice.kind === 'success' ? <CheckCircle2 size={17} /> : notice.kind === 'error' ? <AlertCircle size={17} /> : <Info size={17} />}
        <span>{notice.text}</span><button aria-label="Dismiss message" onClick={() => setNotice(null)}><X size={16} /></button>
      </div>}

      {showSettings && <section className="settings-strip"><div><ShieldCheck size={18} /><strong>Privacy-first mode</strong><span>Photos stay in this browser; originals are never overwritten.</span></div><button className="close-settings" onClick={() => setShowSettings(false)}><X size={16} /></button></section>}

      <main className="workspace">
        <aside className="gallery-panel panel">
          <div className="panel-heading"><div><h2>Photos <span className="count-pill">{photos.length}</span></h2><p>Select one or more to edit</p></div><button className="text-button" onClick={clearAll} disabled={!photos.length}>Clear all</button></div>
          <div className="gallery-tabs"><button className="gallery-tab active"><ImageIcon size={15} /> Gallery</button><button className="gallery-tab" onClick={() => setPhotos(current => [...current].sort((a, b) => b.file.lastModified - a.file.lastModified))}>Recent</button></div>
          <div className="gallery-filter"><Search size={15} /><input aria-label="Filter photos" placeholder="Find a photo…" value={searchTag} onChange={event => setSearchTag(event.target.value)} /><ChevronDown size={14} /></div>
          {photos.length === 0 ? <button className="upload-dropzone" onClick={() => fileInput.current?.click()}>
            <span className="upload-icon"><Upload size={22} /></span><strong>Drop photos here</strong><span>or click to browse</span><small>JPG, PNG, WebP, AVIF · Max 40 MB each</small>
          </button> : <>
            <div className="gallery-list">
              {photos.filter(photo => photo.name.toLowerCase().includes(searchTag.toLowerCase())).map(photo => <div key={photo.id} className={`gallery-item ${active?.id === photo.id ? 'gallery-item-active' : ''}`}>
                <button className={`select-check ${selectedIds.includes(photo.id) ? 'checked' : ''}`} aria-label={`Select ${photo.name}`} onClick={() => toggleSelected(photo.id)}>{selectedIds.includes(photo.id) && <Check size={13} />}</button>
                <button className="thumb-button" onClick={() => chooseActive(photo)} aria-label={`Preview ${photo.name}`}><img src={photo.url} alt="" /></button>
                <button className="photo-meta" onClick={() => chooseActive(photo)}><strong title={photo.name}>{photo.name}</strong><span>{formatSize(photo.size)} · {photo.width}×{photo.height}</span>{photo.status === 'error' && <small className="error-text">{photo.error}</small>}</button>
                <button className="remove-one" aria-label={`Remove ${photo.name}`} onClick={() => removePhoto(photo.id)}><X size={14} /></button>
              </div>)}
            </div>
            <div className="gallery-footer"><span>{selectedIds.length} selected</span><button className="text-button" onClick={() => setSelectedIds(photos.map(photo => photo.id))}>Select all</button></div>
          </>}
          <button className="add-more-button" onClick={() => fileInput.current?.click()}><Plus size={16} /> Add photos</button>
          <div className="privacy-note"><ShieldCheck size={15} /><span>Private by design. Files stay on your device.</span></div>
        </aside>

        <section className="preview-column">
          <div className="preview-card panel">
            <div className="preview-toolbar">
              <div className="zoom-controls"><button aria-label="Zoom out" onClick={() => setZoom(value => Math.max(25, value - 10))}><Minus size={15} /></button><span>{zoom}%</span><button aria-label="Zoom in" onClick={() => setZoom(value => Math.min(150, value + 10))}><Plus size={15} /></button></div>
              <button className="square-control" onClick={() => setZoom(70)} title="Fit to view"><Maximize size={16} /></button>
              <button className="square-control" onClick={() => setShowStamped(value => !value)} title="Toggle stamp preview"><RotateCcw size={16} /></button>
              <div className="preview-mode"><button className={!showStamped ? 'selected' : ''} onClick={() => setShowStamped(false)}>Original</button><button className={showStamped ? 'selected' : ''} onClick={() => setShowStamped(true)}>Preview</button></div>
            </div>
            <div className="image-stage">
              {active && activePreview ? <div className="image-frame">
                <img src={activePreview} alt={active.name} style={{ transform: `scale(${zoom / 70})` }} />
                {showStamped && stamp.enabled && <div className={`stamp-preview stamp-${stamp.position} stamp-${stamp.style}`} style={{ opacity: stamp.opacity / 100, color: stamp.color, backgroundColor: stamp.style === 'minimal' ? 'transparent' : stamp.background }}>
                  {stamp.showLocation && active.locationName && <strong><MapPin size={15} fill="currentColor" />{active.locationName}</strong>}
                  {stamp.showDate && active.dateTime && <span><CalendarDays size={13} />{new Date(active.dateTime).toLocaleString()}</span>}
                  {stamp.showCoordinates && typeof active.latitude === 'number' && typeof active.longitude === 'number' && <span>{active.latitude.toFixed(5)}°, {active.longitude.toFixed(5)}°</span>}
                  {stamp.customText && <span>{stamp.customText}</span>}
                </div>}
                <span className="preview-chip"><CheckCircle2 size={13} /> Preview</span>
              </div> : <button className="empty-preview" onClick={() => fileInput.current?.click()}><ImageIcon size={38} /><strong>Your photo will appear here</strong><span>Upload a photo to start editing</span><span className="empty-upload-cta"><Upload size={15} /> Upload photos</span></button>}
            </div>
            <div className="preview-bottom">
              <div className="photo-position"><button disabled={photos.length < 2} aria-label="Previous photo" onClick={() => { const index = photos.findIndex(photo => photo.id === active?.id); setActiveId(photos[(index - 1 + photos.length) % photos.length]?.id ?? null); }}><ChevronLeft size={18} /></button><span>{active ? photos.findIndex(photo => photo.id === active.id) + 1 : 0} / {photos.length}</span><button disabled={photos.length < 2} aria-label="Next photo" onClick={() => { const index = photos.findIndex(photo => photo.id === active?.id); setActiveId(photos[(index + 1) % photos.length]?.id ?? null); }}><ChevronRight size={18} /></button></div>
              <span className="dimensions-label">{active ? `${active.width} × ${active.height} px` : 'No photo selected'}</span>
              <button className="subtle-button" onClick={() => setTab('Stamp')}><Stamp size={15} /> Edit stamp</button>
            </div>
          </div>
          <div className="in-content-ad ad-slot"><span className="ad-eyebrow">ADVERTISEMENT</span><ImageIcon size={22} /><strong>In-content ad space</strong><span>970 × 180 · Below the editing workspace</span></div>
          <div className="workflow-tip"><Info size={16} /><span><strong>Quick tip:</strong> Select several photos in the gallery to apply the same location or stamp in one go.</span></div>
        </section>

        <aside className="editor-column panel">
          <div className="editor-tabs" role="tablist" aria-label="Editing panels">
            {(['Location', 'Stamp', 'EXIF', 'Tags'] as EditorTab[]).map(value => <button key={value} role="tab" aria-selected={tab === value} className={tab === value ? 'active' : ''} onClick={() => setTab(value)}>{value === 'Location' ? <MapPin size={15} /> : value === 'Stamp' ? <Stamp size={15} /> : value === 'EXIF' ? <FilePenLine size={15} /> : <Tag size={15} />}{value}</button>)}
          </div>
          {!active ? <div className="editor-empty"><SlidersHorizontal size={26} /><strong>Editing tools</strong><span>Upload a photo to unlock location, stamp, EXIF and tag settings.</span><button className="primary-button" onClick={() => fileInput.current?.click()}><Upload size={16} /> Upload Photos</button></div> :
            <>
              {tab === 'Location' && <div className="editor-content">
                <div className="section-title"><div><MapPin size={17} /><strong>GPS location</strong></div><button className="small-green-button" onClick={captureLocation} disabled={busy}><Crosshair size={14} /> Capture</button></div>
                <p className="field-help">Enter coordinates manually or capture your current position. No map needed.</p>
                <div className="field-grid two">
                  <label>Latitude<input type="number" min="-90" max="90" step="any" placeholder="e.g. 19.0760" value={active.latitude ?? ''} onChange={event => updatePhoto(active.id, { latitude: event.target.value === '' ? undefined : Number(event.target.value), removeGps: false })} /></label>
                  <label>Longitude<input type="number" min="-180" max="180" step="any" placeholder="e.g. 72.8777" value={active.longitude ?? ''} onChange={event => updatePhoto(active.id, { longitude: event.target.value === '' ? undefined : Number(event.target.value), removeGps: false })} /></label>
                </div>
                <label className="field-label">Altitude (metres)<input type="number" step="any" placeholder="Optional" value={active.altitude ?? ''} onChange={event => updatePhoto(active.id, { altitude: event.target.value === '' ? undefined : Number(event.target.value) })} /></label>
                <label className="field-label">Location name <span>Optional</span><input placeholder="e.g. Marine Drive, Mumbai" value={active.locationName} onChange={event => updatePhoto(active.id, { locationName: event.target.value })} /></label>
                <label className="field-label">Date/time for stamp <span>Optional · not written to EXIF</span><input type="datetime-local" value={active.dateTime} onChange={event => updatePhoto(active.id, { dateTime: event.target.value })} /></label>
                <div className="location-summary"><MapPin size={16} /><div><strong>{active.locationName || 'Location not named'}</strong><span>{typeof active.latitude === 'number' && typeof active.longitude === 'number' ? `${active.latitude.toFixed(5)}, ${active.longitude.toFixed(5)}` : 'No GPS coordinates set'}</span></div><span className={typeof active.latitude === 'number' && typeof active.longitude === 'number' ? 'status-good' : 'status-muted'}>{typeof active.latitude === 'number' && typeof active.longitude === 'number' ? 'Set' : 'Missing'}</span></div>
                <div className="button-row"><button className="primary-button" onClick={applyLocationToSelected}><Check size={16} /> Apply to selected</button><button className="secondary-button" onClick={removeLocationFromSelected}><Trash2 size={15} /> Remove GPS</button></div>
              </div>}
              {tab === 'Stamp' && <div className="editor-content">
                <div className="section-title"><div><Stamp size={17} /><strong>Photo stamp</strong></div><label className="switch"><input type="checkbox" checked={stamp.enabled} onChange={event => setStamp(current => ({ ...current, enabled: event.target.checked }))} /><span /></label></div>
                <p className="field-help">Add a visible overlay to the exported image. This changes the photo pixels.</p>
                <div className="stamp-toggles">
                  <label><input type="checkbox" checked={stamp.showLocation} onChange={event => setStamp(current => ({ ...current, showLocation: event.target.checked }))} /> Location name</label>
                  <label><input type="checkbox" checked={stamp.showDate} onChange={event => setStamp(current => ({ ...current, showDate: event.target.checked }))} /> Date & time</label>
                  <label><input type="checkbox" checked={stamp.showCoordinates} onChange={event => setStamp(current => ({ ...current, showCoordinates: event.target.checked }))} /> GPS coordinates</label>
                </div>
                <label className="field-label">Custom text <span>Optional</span><input placeholder="e.g. Summer trip 2026" value={stamp.customText} onChange={event => setStamp(current => ({ ...current, customText: event.target.value }))} /></label>
                <label className="field-label">Template<select value={stamp.style} onChange={event => setStamp(current => ({ ...current, style: event.target.value as StampSettings['style'] }))}><option value="classic">Classic · dark translucent</option><option value="minimal">Minimal · text only</option><option value="travel">Travel · bold label</option></select></label>
                <label className="field-label">Position<select value={stamp.position} onChange={event => setStamp(current => ({ ...current, position: event.target.value as StampSettings['position'] }))}><option value="bottom-left">Bottom left</option><option value="bottom-right">Bottom right</option><option value="top-left">Top left</option><option value="top-right">Top right</option></select></label>
                <div className="field-grid two">
                  <label>Text color<input type="color" value={stamp.color} onChange={event => setStamp(current => ({ ...current, color: event.target.value }))} /></label>
                  <label>Background<input type="color" value={stamp.background} onChange={event => setStamp(current => ({ ...current, background: event.target.value }))} /></label>
                </div>
                <label className="field-label">Opacity <span>{stamp.opacity}%</span><input type="range" min="20" max="100" value={stamp.opacity} onChange={event => setStamp(current => ({ ...current, opacity: Number(event.target.value) }))} /></label>
                <button className="primary-button full-button" onClick={() => { setShowStamped(true); setNotice({ kind: 'success', text: 'Stamp preview updated. Export to apply it to a new photo copy.' }); }}><Stamp size={16} /> Update preview</button>
              </div>}
              {tab === 'EXIF' && <div className="editor-content">
                <div className="section-title"><div><FilePenLine size={17} /><strong>Photo metadata</strong></div><span className="read-only-badge">Inspector</span></div>
                <p className="field-help">Metadata is read from the selected file. GPS can be edited in Location. Writing GPS is currently supported for JPEG.</p>
                <div className="metadata-list">
                  <div><span>File name</span><strong title={active.name}>{active.name}</strong></div>
                  <div><span>File size</span><strong>{formatSize(active.size)}</strong></div>
                  <div><span>Dimensions</span><strong>{active.width} × {active.height}</strong></div>
                  <div><span>File type</span><strong>{active.file.type || 'Unknown'}</strong></div>
                  <div><span>GPS latitude</span><strong>{active.latitude ?? 'Not present'}</strong></div>
                  <div><span>GPS longitude</span><strong>{active.longitude ?? 'Not present'}</strong></div>
                  <div><span>Capture date</span><strong>{active.dateTime ? new Date(active.dateTime).toLocaleString() : 'Not present'}</strong></div>
                  <div><span>Workspace status</span><strong className={`status-${active.status}`}>{active.status}</strong></div>
                </div>
                <div className="warning-note"><AlertCircle size={16} /><span>Canvas stamping re-encodes pixels and may remove existing metadata. Keep EXIF is applied only where this build can safely preserve or write supported fields.</span></div>
                <label className="check-row"><input type="checkbox" checked={keepExif} onChange={event => setKeepExif(event.target.checked)} /> Keep supported EXIF data</label>
                <button className="secondary-button full-button" onClick={() => setNotice({ kind: 'info', text: 'The metadata inspector shows fields this build can read. Only GPS writing/removal for JPEG is implemented; other EXIF fields remain read-only.' })}><Info size={15} /> Metadata support details</button>
              </div>}
              {tab === 'Tags' && <div className="editor-content">
                <div className="section-title"><div><Tag size={17} /><strong>Photo tags</strong></div><span className="count-pill">{active.tags.length}</span></div>
                <p className="field-help">Organize photos with labels in this workspace. Tags are app-side labels and are not written into EXIF yet.</p>
                <div className="tag-entry"><input placeholder="Add a tag…" value={tagInput} onChange={event => setTagInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') applyTag(); }} /><button aria-label="Apply tag" onClick={applyTag} disabled={!tagInput.trim()}><Plus size={17} /></button></div>
                {active.tags.length ? <div className="tag-list">{active.tags.map(tag => <span key={tag} className="tag-chip">{tag}<button aria-label={`Remove tag ${tag}`} onClick={() => updatePhoto(active.id, { tags: active.tags.filter(value => value !== tag) })}><X size={12} /></button></span>)}</div> : <div className="tags-empty"><Tag size={23} /><strong>No tags yet</strong><span>Add tags to organize your selected photos.</span></div>}
                <button className="secondary-button full-button" onClick={() => { setTagInput(''); setNotice({ kind: 'info', text: 'Tags currently stay in the GeoStamp workspace and are not embedded into exported file metadata.' }); }}>About tags</button>
              </div>}
            </>
          }
          <div className="side-ad ad-slot"><span className="ad-eyebrow">ADVERTISEMENT</span><ImageIcon size={24} /><strong>Side ad space</strong><span>300 × 600</span><small>Reserved for an ad provider</small></div>
        </aside>
      </main>

      <footer className="export-bar">
        <div className="selection-status"><CheckCircle2 size={19} /><div><strong>{selectedIds.length} selected</strong><span>{selectedIds.length ? formatSize(totalSize) + ' total' : 'Choose photos to export'}</span></div></div>
        <div className="export-options">
          <label>Format<select value={outputFormat} onChange={event => setOutputFormat(event.target.value)}><option value="jpg">JPEG</option><option value="original">Keep original (no stamp)</option></select></label>
          <label className="quality-control">JPEG quality<select value={quality} onChange={event => setQuality(event.target.value)}><option value="75">75%</option><option value="85">85%</option><option value="90">90%</option><option value="95">95%</option></select></label>
          <label className="check-row keep-exif"><input type="checkbox" checked={keepExif} onChange={event => setKeepExif(event.target.checked)} /> Keep EXIF</label>
          <label className="check-row stamp-toggle"><input type="checkbox" checked={stamp.enabled && showStamped} onChange={event => { setStamp(current => ({ ...current, enabled: event.target.checked })); setShowStamped(event.target.checked); }} /> Add stamp</label>
        </div>
        <button className="download-button" disabled={!photos.length || busy} onClick={() => void exportPhotos()}>{busy ? <LoaderCircle className="spin" size={18} /> : <Download size={19} />}<span>{busy ? progress || 'Working…' : `Download ${selectedPhotos.length || (active ? 1 : 0)} photo${(selectedPhotos.length || (active ? 1 : 0)) === 1 ? '' : 's'}`}</span></button>
      </footer>
      {busy && <div className="busy-progress" role="status"><LoaderCircle size={16} className="spin" />{progress || 'Processing photos locally…'}</div>}
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <button className="active" onClick={() => fileInput.current?.click()}><ImageIcon size={18} /><span>Photos</span></button>
        <button onClick={() => setTab('Location')}><MapPin size={18} /><span>Location</span></button>
        <button className="mobile-download" disabled={!photos.length || busy} onClick={() => void exportPhotos()}><Download size={19} /></button>
        <button onClick={() => setTab('Stamp')}><Stamp size={18} /><span>Stamp</span></button>
        <button onClick={() => setTab('EXIF')}><Settings size={18} /><span>Details</span></button>
      </nav>
      <div className="footer-note"><span><ShieldCheck size={14} /> Your photos stay on your device</span><span>GeoStamp · Built for privacy</span><button onClick={() => setNotice({ kind: 'info', text: 'This build has no photo upload backend. Geolocation is requested only when you click Capture Location.' })}>Privacy & support</button></div>
    </div>
  );
}
