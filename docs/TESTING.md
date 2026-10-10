# GeoStamp Testing Strategy

## Commands
- `npm run typecheck`
- `npm test`
- `npm run build`

## Required automated coverage
- Main app shell and toolbar.
- File type/size validation and multi-select state.
- Coordinate validation and browser geolocation permission/error handling.
- EXIF read behavior for files with GPS, without GPS, partial metadata and malformed metadata.
- JPEG GPS write/remove round trip: export, read exported metadata, verify expected values.
- Stamp rendering output and missing-image error paths.
- Batch progress and partial failures.
- Ad-blocked/empty ad slot layout does not block editing.
- Mobile viewport and keyboard navigation.

## Manual release matrix
- Chrome and Edge desktop; Firefox where supported.
- Mobile Chrome and Safari.
- JPEGs from at least two camera/phone sources; JPEG without EXIF; PNG and WebP preview/stamp.
- GPS permission allowed, denied and unavailable.
- Small files, large files, corrupted files and mixed-format batches.
- Verify GPS with an independent metadata reader after export.
- Confirm originals remain unchanged.
