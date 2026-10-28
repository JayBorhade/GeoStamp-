# GeoStamp Release Checklist

## Automated checks
- [x] `npm run typecheck` — passed in CI for commit `e6881a059fe6023461d4d193055a387880fa733f`.
- [x] `npm run lint` — passed in CI for commit `e6881a059fe6023461d4d193055a387880fa733f`.
- [x] `npm test` — 15 tests passed in CI for commit `e6881a059fe6023461d4d193055a387880fa733f`.
- [x] Root and GitHub Pages production builds and Pages asset-path smoke check passed in CI for that commit.
- [x] High-severity dependency audit passed; a fresh local audit reported zero vulnerabilities.
- [ ] Confirm no secrets or private user data are committed.
- [ ] Review the final diff and current Git status.

- [x] `package-lock.json` is committed and CI/deployment use `npm ci`.

## Security and privacy
- [ ] Configure GitHub Pages source as GitHub Actions (or link the repository to the intended Vercel project).
- [ ] The expected GitHub Pages URL currently returns HTTP 404; verify it after enabling deployment and merging the release branch.
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
