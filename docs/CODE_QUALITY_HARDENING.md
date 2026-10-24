# Code Quality Hardening — October 2026

## Scope
This implementation pass applies focused security, correctness, dependency, CI and release-readiness improvements without replacing the existing product UI.

## Implemented
- Hardened decimal-degree to EXIF DMS conversion and retained explicit handling for JPEGs without EXIF segments.
- Added safe export filename handling, finite byte-size formatting, and regression tests for malformed filenames and numeric inputs.
- Added workspace limits (50 photos) and a decoded-image pixel ceiling (60 megapixels) to reduce browser memory-exhaustion risk.
- Validated paired latitude/longitude values and finite altitude values before export; cleared stale altitude tags when altitude is omitted.
- Added deployment security headers for Vercel and a static-hosting headers file, with a note to verify host support.
- Added ESLint dependencies and a lint script, then included lint in CI.
- Added weekly Dependabot checks for npm dependencies and GitHub Actions.
- Added a CI dependency audit report artifact and upgraded vulnerable Vite/Vitest versions.
- Generated and committed `package-lock.json`; switched CI and GitHub Pages builds to `npm ci` with least-privilege read-only CI permissions.
- Added real JPEG EXIF round-trip tests for GPS write/remove, signed coordinates, altitude clearing, metadata preservation/orientation, invalid coordinates and unreadable input.
- Fixed GPS writing after non-JPEG images are converted to JPEG by tracking the actual output format separately from the source format.
- Added a static-host-compatible baseline CSP meta policy and documented the response-header limitations of GitHub Pages.
- Added security notes and an explicit release checklist.

## Verification status
- Latest verified CI run `40068725245` passed lockfile-based dependency installation, TypeScript type checking, dependency audit report, ESLint, all 13 unit tests and the production build.
- The most recent audit report before the lockfile-based run reported 0 info, 0 low, 0 moderate, 0 high and 0 critical vulnerabilities; the lockfile-based run's audit step also passed and should be reviewed in its artifact before release.
- These are automated repository checks. They do not replace real-device/browser testing, independent EXIF round-trip verification, deployed-header inspection, or a production deployment review.

## Remaining priorities
1. Add browser-level tests for object URL cleanup, large/malformed image handling, batch partial failures and mobile downloads.
2. Refactor the large `src/App.tsx` into focused modules behind regression coverage.
3. Verify CSP and response headers on the actual hosting provider; GitHub Pages cannot apply every configured header from `_headers` or a CSP meta tag.
4. Run a manual desktop/mobile accessibility and usability pass, including geolocation permission states and installed/offline PWA behavior.
5. Review the current lockfile-based audit artifact and verify the public deployment before deciding production readiness.

Avoid blind major-version upgrades or disabling tests to make CI green. Review breaking changes and preserve the existing user workflow.
