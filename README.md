# GeoStamp

**Edit. Tag. Stamp. Share with Location.**

GeoStamp is a responsive, privacy-first photo location editor. It includes a desktop gallery, mobile-friendly photo selection, GPS coordinate editing, EXIF inspection, visible photo stamps, batch actions and export—all without a map in the editor.

## Features

- Responsive desktop, tablet and mobile UI with a PWA manifest.
- Upload or drag-and-drop JPEG, PNG, WebP and AVIF images (50 MB per file limit).
- Gallery thumbnails, search, selection, multi-select and file removal.
- Preview, zoom, navigation and original-file safety indicator.
- Read common EXIF metadata where available.
- Manually edit latitude, longitude and altitude; capture current location only after a user action and browser permission.
- Write/remove supported GPS and date EXIF fields for JPEG exports.
- Visible location/date/coordinate stamp rendering and batch ZIP export.
- EXIF toggle, JPEG quality selector, reserved ad placements and privacy information.

## Important limitations

- JPEG is the only format intended for EXIF GPS writing. PNG/WebP/AVIF can be previewed, but reliable metadata writing/preservation is not promised.
- Canvas stamping re-encodes images and may strip existing metadata. Inspect exported files before relying on metadata for legal or evidentiary workflows.
- Tags are session labels, not guaranteed embedded image keywords. Place/address search is not enabled. No map UI is included.
- The app does not upload photos in this release. Ad placements are visual placeholders, not a live ad network integration.
- The PWA manifest is included; offline support and native Android/iOS packaging need further testing/work.

## Requirements and local development

Node.js 20+ recommended.

```bash
npm install
npm run dev
```

Use the local URL printed by Vite. Browser geolocation requires HTTPS or localhost and explicit permission.

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

GitHub Actions runs type-checking, lint, tests and production build on pushes and pull requests to `main`.

## Deployment

Static Vite app; deploy to Cloudflare Pages, Vercel, Netlify or GitHub Pages. Build command: `npm run build`; output directory: `dist`. Use HTTPS. Never place private API keys in frontend code.

See [the roadmap](docs/ROADMAP.md), [architecture](docs/ARCHITECTURE.md), [testing strategy](docs/TESTING.md), [privacy notes](docs/PRIVACY.md) and [release checklist](docs/RELEASE_CHECKLIST.md).

No open-source license has been selected; all rights reserved unless a license is added by the repository owner.
