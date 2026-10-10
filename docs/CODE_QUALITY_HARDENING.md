# Code Quality Hardening — October 2026

## Scope
This pass targets low-risk correctness and configuration improvements. It intentionally avoids rewriting the application shell or changing product behavior in bulk.

## Changes in this branch
- Consolidated Vite/Vitest configuration into one typed configuration, removing the `as any` escape hatch and eliminating the duplicate Vitest config.
- Corrected the test setup path to the setup file that exists in the repository.
- Hardened decimal-degree to EXIF DMS conversion by rounding integer units once and carrying overflow across minute/degree boundaries.
- Added regression tests for normal coordinates, boundary rounding, and non-finite values.

## Verification status
- Regression tests are added but must be executed by CI; this GitHub integration does not execute the repository's Node test suite directly.
- The branch should not be merged until the CI typecheck, test, and production-build jobs pass.

## Follow-up priorities
1. Split the large `src/App.tsx` component into focused UI/workflow modules behind regression coverage.
2. Expand real-file JPEG EXIF round-trip tests, including GPS removal, missing EXIF, malformed EXIF, and negative altitude.
3. Add a committed package lockfile and switch CI to `npm ci` for reproducible installs.
4. Add browser-level tests for file lifecycle/object URL cleanup, batch partial failures, and mobile export behavior.
5. Review the ESLint configuration and either declare/configure its dependencies and script or remove the unused configuration; do not claim lint is running until verified.
