# GeoStamp Release Checklist

## Automated checks
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] Review high/critical dependency advisories and update dependencies safely.
- [ ] Confirm no secrets or private user data are committed.
- [ ] Review the final diff and current Git status.

## Security and privacy
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
