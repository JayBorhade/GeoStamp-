# Code Quality Hardening — October 2026

## Scope
This pass targets low-risk correctness and configuration improvements. It intentionally avoids rewriting the application shell or changing product behavior in bulk.

## Changes in this branch
- Separated responsibilities between Vite and Vitest configs, removed the `as any` escape hatch, and retained a dedicated Vitest config to avoid incompatible duplicate Vite type definitions.
- Configured Vitest to use the dedicated Vitest matcher setup file.
- Hardened decimal-degree to EXIF DMS conversion by rounding integer units once and carrying overflow across minute/degree boundaries.
- Added a shared empty-EXIF fallback for JPEGs that legitimately contain no EXIF segment, while keeping malformed EXIF errors explicit.
- Added regression tests for normal coordinates, boundary rounding, and non-finite values.

## Verification status
- Regression tests are added but must be executed by CI; this GitHub integration does not execute the repository's Node test suite directly.
- The branch should not be merged until the CI typecheck, test, and production-build jobs pass.

## Follow-up priorities
0. Review the six dependency vulnerabilities reported during CI install (3 moderate, 1 high, 2 critical); inspect the affected dependency paths and apply compatible updates before production. Avoid blind `npm audit fix --force` because it can introduce breaking changes.
1. Split the large `src/App.tsx` component into focused UI/workflow modules behind regression coverage.
2. Expand real-file JPEG EXIF round-trip tests, including GPS removal, missing EXIF, malformed EXIF, and negative altitude.
3. Add a committed package lockfile and switch CI to `npm ci` for reproducible installs.
4. Add browser-level tests for file lifecycle/object URL cleanup, batch partial failures, and mobile export behavior.
5. Review the ESLint configuration and either declare/configure its dependencies and script or remove the unused configuration; do not claim lint is running until verified.
