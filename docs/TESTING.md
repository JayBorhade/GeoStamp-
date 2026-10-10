# Testing Strategy

## Automated checks

- TypeScript strict type-check.
- ESLint and React hook rules.
- Vitest unit tests for file helper behavior.
- React Testing Library checks for main tools, empty state and privacy settings.
- Production Vite build.

## Manual release checks

1. Test desktop, tablet and narrow phone widths; confirm ad slots never cover controls.
2. Add JPEG with GPS, JPEG without GPS, PNG/WebP/AVIF, corrupted image, unsupported file and file over 50 MB.
3. Verify duplicate handling, selection, preview, remove and clear behavior.
4. Test coordinate boundaries, invalid numbers and incomplete coordinate pairs.
5. Test geolocation allowed, denied, timeout and unavailable. Permission should only be requested after clicking Capture.
6. Export a JPEG with GPS; reopen using an independent EXIF tool and verify coordinates and altitude.
7. Remove GPS, export, and verify GPS tags are absent.
8. Verify actual metadata preservation behavior with EXIF on/off.
9. Stamp a JPEG, compare preview/output, verify dimensions and confirm original bytes are unchanged.
10. Batch export mixed-validity files; inspect ZIP contents and per-file failures.
11. Test keyboard focus, reduced motion, mobile touch controls and browser permissions.
12. Run typecheck, lint, tests and production build.

Automated tests are not a substitute for a real-photo fixture corpus, independent EXIF verification, device testing and deployment smoke tests. Do not claim evidentiary-grade metadata integrity without independent validation.
