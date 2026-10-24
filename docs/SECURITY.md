# GeoStamp Security Notes

## Threat model and data handling

GeoStamp is currently a client-side photo utility. Selected photos and their metadata are processed in the browser; the project does not provide a GeoStamp upload API or user-account backend. Do not add analytics, reverse geocoding, cloud storage, or remote image processing without documenting the data sent to the provider and obtaining any required user consent.

Treat filenames, image bytes, EXIF fields, coordinates, timestamps, and custom stamp text as untrusted input. Keep original files unchanged and export a new copy. Do not log photo contents, exact coordinates, or metadata.

## Deployment requirements

- Serve the application over HTTPS. Browser geolocation and PWA installation require a secure context.
- Keep environment secrets out of client-side code and Git. Vite variables exposed with a `VITE_` prefix are public.
- Security headers are configured in `vercel.json` and `public/_headers`. Confirm the chosen hosting provider actually applies them; GitHub Pages does not guarantee support for arbitrary `_headers` files.
- Review the Content Security Policy whenever adding a script, worker, external font, API, or third-party integration. Do not add broad wildcards to make a blocked integration work.
- Keep dependency versions reviewed and resolve high/critical advisories before a public production launch.
- Validate uploaded file size and type before expensive image processing, and test malformed images in supported browsers.
- Never treat user-edited GPS metadata as proof of a photo's real-world capture location. GeoStamp edits metadata and visible stamps; metadata can be changed by other tools.

## Incident response

If a secret is accidentally committed, remove it from active code and rotate/revoke it with its provider. Removing the value from the latest commit does not remove it from Git history. Review public repository history and any generated build artifacts before release.

## Verification checklist

1. Run `npm run typecheck`, `npm test`, and `npm run build`.
2. Inspect response headers on the actual deployment.
3. Test upload, GPS write/remove, stamp and ZIP export using valid, malformed and large images.
4. Verify exported metadata with an independent EXIF reader.
5. Confirm originals remain unchanged and no photo data is sent to an unapproved service.
6. Review dependency and secret scanning results before release.
