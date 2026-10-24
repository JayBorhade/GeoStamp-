# GeoStamp

**Edit. Tag. Stamp. Share with Location.**

GeoStamp is a responsive, privacy-conscious photo GPS and EXIF editor with a visible photo-stamp designer. The initial application is designed to run in the browser and process selected photos locally wherever possible.

## Features
- Responsive desktop and mobile interface, with a PWA manifest.
- Explicit photo selection, thumbnail gallery, multi-select, preview and zoom.
- Read supported EXIF/GPS metadata.
- Set GPS from browser geolocation (with permission) or manually entered coordinates.
- Write or remove GPS metadata in JPEG files.
- Create visible location/date/coordinate/custom-text stamps.
- Batch apply actions and export copies as ZIP.
- Reserved ad placements that never cover the editor or download controls.
- No map in the editing interface.

## Run locally
Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

## Deployment

The project includes a Vercel configuration and a small same-origin service worker for caching the app shell and visited static assets. Deploy over HTTPS for browser geolocation and installability. Verify the installed experience on target browsers before launch.

## Verify
```bash
npm run typecheck
npm test
npm run build
```

## Supported format scope
The first release focuses on JPEG metadata writing. PNG/WebP and other image types may be previewed and stamped through canvas, but canvas re-encoding does not preserve their original EXIF metadata. The app should explain this before export. HEIC/RAW/TIFF/video metadata writing is not claimed.

## Privacy
Photos are selected by the user and processed in the browser. Current location is requested only after the user chooses Capture Location. If optional reverse geocoding is added, disclose the provider and the location data sent to it. This initial version does not upload photos to a GeoStamp server.

## Project docs
- `docs/SECURITY.md` — threat model, privacy, deployment hardening and incident response
- `docs/ROADMAP.md` — milestones and acceptance criteria
- `docs/ARCHITECTURE.md` — architecture and design decisions
- `docs/TESTING.md` — test strategy and release checks
- `docs/RELEASE_CHECKLIST.md` — release acceptance checklist

## Important limitations
Browser geolocation requires a secure context (HTTPS or localhost) and user permission. Actual EXIF preservation varies by file type and browser library support. Verify exported files with a metadata reader before treating the result as production-ready.
