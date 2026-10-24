# GeoStamp Release Checklist

## Automated checks
- [x] `npm run typecheck` — passed in the latest CI run.
- [x] `npm test` — 13 tests passed in the latest CI run.
- [x] `npm run build` — passed in the latest CI run.
- [x] Latest recorded audit: zero vulnerabilities; review the lockfile-based audit artifact again before release.
- [ ] Confirm no secrets or private user data are committed.
- [ ] Review the final diff and current Git status.

- [x] `package-lock.json` is committed and CI/deployment use `npm ci`.

## Security and privacy
- [ ] Configure GitHub Pages source as GitHub Actions (or link the repository to the intended Vercel project).
- [ ] Confirm HTTPS and inspect deployed response headers.
- [ ] Confirm CSP permits only the origins required by the shipped app.
- [ ] Confirm photos are processed locally and no unapproved network requests transmit images or location.
- [ ] Test malformed images, large files, unsupported formats and invalid coordinates.
- [ ] Verify GPS write/remove and EXIF behavior using an independent metadata reader.
- [ ] Confirm export names are safe and originals remain unchanged.

## Product acceptance
- [ ] Verify desktop and mobile layouts and keyboard navigation.
- [ ] Test browser geolocation with permission allowed, denied and unavailable.
- [ ] Test mixed-format batch export and partial failures.
- [ ] Confirm ad placements do not cover editor or download controls.
- [ ] Verify the installed PWA and offline shell on target browsers.

## Release decision
Do not mark GeoStamp production-ready until the checks above are completed on the actual deployment and outstanding high/critical dependency advisories are resolved.
