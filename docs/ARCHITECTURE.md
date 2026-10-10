# GeoStamp Architecture

## Principles
- Keep editing workflows simple and discoverable.
- Process files locally by default; do not upload originals.
- Keep source files immutable and export new copies.
- Separate EXIF metadata changes from visible pixel stamping.
- No map UI; GPS remains editable as coordinates and optional place text.
- Ad slots are layout components and cannot cover interactive editing surfaces.

## Stack
- React + TypeScript + Vite.
- CSS design tokens and responsive layout.
- exifr for EXIF reading; piexifjs for JPEG GPS write/remove; Canvas for visible stamps; JSZip for batch downloads.
- Vitest + React Testing Library for unit/component tests.

## State model
Each selected file is represented by a `PhotoItem` with a stable id, original File, preview object URL, dimensions, GPS values, location label, date/time, tags and processing status. Editing changes the in-memory model; the original File is never mutated.

## Data flow
1. User explicitly selects images.
2. Gallery validates type/size and creates preview URLs.
3. Metadata reader inspects EXIF when possible.
4. User edits GPS, tags, stamp settings or metadata.
5. Export creates a new Blob; batch downloads are packaged in ZIP.
6. Status and errors are shown per photo; preview URLs are revoked when photos are removed/unmounted.

## Important format caveats
- JPEG GPS writing uses EXIF APP1 metadata and requires verification on actual camera files.
- Canvas stamping re-encodes pixels and may drop metadata. If Keep EXIF is enabled, metadata must be explicitly reattached where supported; never imply that a canvas export preserves EXIF automatically.
- JPEG-only GPS editing must be stated in the UI; unsupported formats may be previewed/stamped but should not claim EXIF write support.
- Production hardening must include real-file round-trip tests for GPS write/remove and stamp/export combinations.

## Security and privacy
- Geolocation is user-initiated and permission-gated.
- Do not store image content or precise coordinates in analytics.
- Any future geocoding service must be behind a provider abstraction and disclose outbound location queries.
- No secrets in frontend environment variables.
- Validate file sizes and avoid unbounded batch processing.

## Advertising
Top banner and desktop side rail are reserved layout slots. An optional in-content slot appears below editing controls. Slots collapse or reposition on narrow screens and never overlap editor controls, dialogs, or sticky download actions.
