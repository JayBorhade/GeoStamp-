# GeoStamp Architecture

## Runtime

GeoStamp is a React + TypeScript single-page application built with Vite. Photos are selected explicitly and processed in browser memory; this initial release has no backend, accounts, database or cloud storage.

## Boundaries

- `src/App.tsx`: responsive workspace, staged edit state and user workflows.
- `src/types.ts`: shared photo and metadata types.
- `src/styles.css`: responsive design system, ad placeholders and mobile breakpoints.
- `exifr`: reads available EXIF metadata.
- `piexifjs`: writes supported GPS/date metadata to JPEG exports.
- Canvas: visible stamp rendering; re-encoding may strip existing metadata.
- JSZip: bundles successful batch exports and reports per-file failures.

## Processing pipeline

1. Validate file type and 50 MB limit.
2. Create local object URL and parse metadata without mutating the source.
3. Stage edits in UI state.
4. Optionally render a visible stamp to image pixels.
5. Write supported GPS/date fields to JPEG EXIF where enabled.
6. Download a new output file or ZIP. Never intentionally overwrite source files.

## Privacy

No photo upload or external geocoding is performed in this version. Browser geolocation is requested only after an explicit user click and browser permission. Do not add telemetry that records photo bytes, filenames or precise coordinates. Future place search must disclose what is sent to its provider. Do not put secret keys in client code.

## Advertising

Ad placements are visual placeholders only. Any future ad provider must reserve dimensions, respect consent and regional requirements, and never overlay the preview, controls, dialogs or download action. Large ad slots should be hidden/reflowed on mobile.

## Known limitations

No map UI, place search, cloud accounts or payments. JPEG is the only format intended for EXIF writing. Tags are session labels and are not embedded as image keywords. The manifest is present; offline behavior and native packaging need additional device testing.
