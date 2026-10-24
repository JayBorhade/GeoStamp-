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
- Added security notes and an explicit release checklist.

## Verification status
- GitHub Actions passed TypeScript type checking, ESLint, unit tests and the production build on commit `1caa147aecd380ab32fdf251aa3df764f39dc6e3`.
- The npm audit report on that commit reported 0 info, 0 low, 0 moderate, 0 high and 0 critical vulnerabilities.
- These are automated repository checks. They do not replace real-device/browser testing, independent EXIF round-trip verification, deployed-header inspection, or a production deployment review.

## Remaining priorities
1. Add and commit a lockfile, then use `npm ci` for reproducible dependency installation.
2. Add real-file JPEG EXIF round-trip tests for GPS write/remove, no-EXIF files, malformed EXIF and negative altitude.
3. Add browser-level tests for object URL cleanup, large/malformed image handling, batch partial failures and mobile downloads.
4. Refactor the large `src/App.tsx` into focused modules behind regression coverage.
5. Verify CSP and security headers on the actual hosting provider and run a manual desktop/mobile accessibility and usability pass.
6. Reassess production readiness only after the remaining checks are completed.

Avoid blind major-version upgrades or disabling tests to make CI green. Review breaking changes and preserve the existing user workflow.
