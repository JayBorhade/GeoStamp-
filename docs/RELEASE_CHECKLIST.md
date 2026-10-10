# Release Checklist

- [ ] Install dependencies from a clean clone with supported Node/npm.
- [ ] Type-check, lint, tests and production build pass.
- [ ] Independently verify JPEG GPS writing, editing and removal with an EXIF tool.
- [ ] Confirm source files remain unchanged after exports.
- [ ] Test stamped JPEG output and batch ZIP contents.
- [ ] Test corrupt/unsupported/large files and geolocation failure paths.
- [ ] Test desktop, tablet and mobile browsers, keyboard access and reduced motion.
- [ ] Ensure ad placeholders never cover editor controls; no live ad SDK is active.
- [ ] Confirm privacy wording matches the actual data flow.
- [ ] Test HTTPS deployment and geolocation permissions.
- [ ] Verify PWA install behavior on target browsers and document offline limitations.
- [ ] Add a license before presenting this repository as open source.
- [ ] Review supported-format claims, release notes and rollback plan.
