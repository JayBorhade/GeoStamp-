# GeoStamp — Product Roadmap & Milestones

> Product principle: **Simple on the surface, powerful underneath, trustworthy in every result.**
>
> GeoStamp helps users add, edit, verify, and remove photo location metadata, add visible photo stamps, process multiple photos, and export results. The same responsive product should work on desktop and mobile.

## Scope and product decisions

- **No map UI in the editor.** GPS coordinates and location names remain first-class features; users can enter coordinates manually, capture the device location with permission, or search for a place through a geocoding service when configured.
- **Gallery sidebar on desktop.** Show thumbnails for files the user explicitly selects. Support selection checkboxes, multi-select, file status, and clear/remove actions.
- **Mobile-first responsive behavior.** Use the browser/OS photo picker on mobile, compact tool panels, touch-friendly controls, and a bottom navigation/action bar where useful.
- **Privacy-first processing.** Prefer local browser processing. Never imply unrestricted gallery access. Explain any data sent to third-party geocoding or services. Do not upload photos unless a future feature explicitly requires it and the user consents.
- **Ads are layout slots, not editing controls.** Reserve a top banner, a right-side desktop slot, and an optional in-content slot below the editing workspace. Ads must never overlay photos, controls, dialogs, or download actions. Hide/reflow slots on small screens if they reduce usability.
- **Originals are preserved.** Never silently overwrite source files. Export edited copies and report what was changed.
- **Format scope starts with JPEG.** Add support for other formats only after reliable read/write and export tests exist. Clearly explain unsupported formats.
- **One responsive codebase first.** Build the web app as a PWA-capable React/TypeScript app. Consider native Android/iOS packaging after the web workflow is stable and platform limitations are understood.

## Milestone overview

| ID | Milestone | Main outcome | Depends on |
|---|---|---|---|
| M0 | Product contract & repository setup | Agreed requirements, repo conventions, roadmap, architecture and test plan | — |
| M1 | App foundation & responsive design system | Running React/TypeScript app, navigation, toolbar, panels, ad placeholders and responsive shell | M0 |
| M2 | Photo picker, upload & gallery | Select files, thumbnails, multi-select, validation, remove/clear and selection state | M1 |
| M3 | Photo preview & editing workspace | Preview, zoom/fit, original/edited comparison, responsive desktop/mobile workspace | M2 |
| M4 | EXIF inspection engine | Read supported metadata safely and display GPS/date/camera fields | M2 |
| M5 | GPS location editor | Capture current location with permission, manually edit coordinates, validate, set/remove GPS | M4 |
| M6 | Tags, date/time & metadata editing | Edit supported fields and add/remove user-defined tags where technically supported | M4 |
| M7 | Visible Stamp Studio | Add location/date/coordinates/custom text overlays with styles and presets | M3 |
| M8 | Export & file integrity | Download edited copies, format/quality options where applicable, metadata/stamp toggles, verification | M5, M6, M7 |
| M9 | Batch workflows | Apply location/stamp/settings to selected photos; per-file status, retries and results summary | M8 |
| M10 | Ads, monetization & responsive polish | Responsive ad slots, upgrade entry points, no-obstruction rules and layout verification | M1, M3, M8 |
| M11 | Privacy, accessibility, security & QA | Permission/error handling, keyboard/touch accessibility, file safety, automated tests and real-file tests | M2–M10 |
| M12 | PWA, deployment & launch | Installable web app where supported, CI, production hosting, docs and release checklist | M11 |
| M13 | Native mobile evaluation | Decide whether to wrap or build native apps based on validated usage and browser API limits | M12 |

---

## Detailed milestones and acceptance criteria

### M0 — Product contract & repository setup
**Deliverables**
- This roadmap plus `docs/PRODUCT_SPEC.md`, `docs/ARCHITECTURE.md`, and `docs/TESTING.md`.
- Agree the supported image formats, metadata fields, privacy boundaries, ad positions, and desktop/mobile navigation.
- Set naming conventions, branching/commit conventions, and a definition of done.

**Done when**
- Product requirements and known browser limitations are documented.
- The initial release is scoped to a small, testable JPEG workflow rather than claiming support for every image format.

### M1 — App foundation & responsive design system
**Deliverables**
- React + TypeScript + Vite application, lint/type-check/test/build scripts.
- Reusable buttons, tabs, inputs, toggles, dialogs, status badges, empty states, alerts, and loading/progress indicators.
- Desktop header with GeoStamp brand, top banner ad placeholder, Help, Settings and Upgrade.
- Upper toolbar: Upload Photos, Capture Location, Set Location, Add Tag, Edit EXIF, Add Stamp, Batch Edit, Remove Location, Export.
- Desktop gallery sidebar, compact central preview area, right-side Location/Stamp/EXIF/Tags tabs, bottom export bar.
- Mobile layout with photo-picker entry point, compact tool grid, preview, collapsible panels, bottom navigation/actions.
- Explicit ad-slot components: top banner, desktop right rail, optional in-content placement below workspace.

**Done when**
- App runs locally and builds cleanly.
- Layout works at phone, tablet, laptop and wide desktop widths.
- Ad placeholders never cover the gallery, editor, modal, toolbar, or download controls.
- Main controls have real labels and keyboard/touch focus states, even if some actions are marked “coming in next milestone.”

### M2 — Photo picker, upload & gallery
**Deliverables**
- Drag-and-drop and file-picker upload on desktop.
- Mobile file/photo picker using browser-supported selection APIs.
- File validation, duplicate handling, loading/error states, thumbnail gallery, select all/none, multi-select, remove and clear.
- File details: name, size, dimensions when available, type and processing status.

**Done when**
- Users explicitly select the photos the app can process; the app does not claim silent/full gallery access.
- Invalid/unsupported files produce actionable explanations.
- Large batches do not freeze the UI; progress and limits are communicated.

### M3 — Photo preview & editing workspace
**Deliverables**
- Preview selected photo; next/previous navigation.
- Zoom, fit-to-workspace, reset zoom, and original/edited preview.
- Selected photo state stays synchronized with the gallery.
- Compact desktop preview to leave room for settings and reserved ad space.
- Mobile preview with touch-friendly controls.

**Done when**
- Selection and preview never get out of sync.
- Preview resizing does not change the source file.
- Ads are outside the editing canvas and the primary action remains visible.

### M4 — EXIF inspection engine
**Deliverables**
- Select and integrate a maintained EXIF library after validating JPEG read behavior and licensing.
- Normalize supported metadata into typed internal models.
- Display GPS, date/time and common camera fields when present.
- Handle missing, malformed, or partial metadata without crashing.

**Done when**
- Fixtures with GPS, no GPS, partial EXIF and malformed metadata are covered by tests.
- Unsupported fields/formats are identified honestly.
- Reading metadata does not mutate the source photo.

### M5 — GPS location editor
**Deliverables**
- Latitude, longitude, altitude and coordinate-direction controls.
- Coordinate validation and common coordinate format display.
- “Capture Location” using browser geolocation only after explicit permission.
- “Set Location” with manual coordinate entry.
- Optional place/address search through a provider abstraction; no map is shown in the editor.
- Apply location to one or selected photos; remove GPS metadata.
- Clear permission-denied, location-unavailable and provider-failure messages.

**Done when**
- Users can edit GPS without using a map.
- Permission is never requested without a user action.
- Coordinates are range-validated and location changes are visible in the preview/status.

### M6 — Tags, date/time & metadata editing
**Deliverables**
- Add Tag control and tag list editor.
- Date/time editor with explicit timezone behavior and validation.
- Editable common metadata fields only where the selected library/format supports writing.
- Separate read-only and editable fields; warn when metadata may not survive a transformation.

**Done when**
- UI does not promise to write fields that the selected format/library cannot reliably write.
- Metadata changes are staged until export and are clearly summarized.

### M7 — Visible Stamp Studio
**Deliverables**
- Stamp fields: location name, address/place text if supplied, date/time, coordinates, custom text and optional watermark/logo.
- Presets: Minimal, Travel, Classic, Professional and Field Report.
- Position, alignment, typography, size, color, background, opacity, padding and shadow controls.
- Live preview and on/off toggle; batch-compatible settings.
- Accessible controls and sensible defaults.

**Done when**
- The stamp changes pixels only when enabled.
- Metadata-only export remains separate from visible stamping.
- Stamp preview matches exported output closely.

### M8 — Export & file integrity
**Deliverables**
- Export selected photo(s) as new files; no silent overwrite.
- “Keep EXIF” and “Add Stamp” options with clear descriptions.
- JPEG quality option only for JPEG output; retain dimensions by default.
- Meaningful output names/suffixes, per-file progress, success/failure report and retry.
- Re-open exported files and verify intended GPS/stamp behavior where feasible.
- ZIP download for batches if supported reliably by the selected libraries.

**Done when**
- Exported files can be re-read to verify intended GPS changes.
- The app explains any metadata that could not be preserved.
- Failed exports do not get reported as successful.
- Source files remain untouched.

### M9 — Batch workflows
**Deliverables**
- Apply the same GPS location, tag, date/time or stamp preset to selected photos.
- Remove GPS from selected photos.
- Allow per-photo editing after batch selection.
- Per-file status, progress, cancel where safe, retries and final summary.

**Done when**
- Batch actions show a confirmation/summary before destructive-looking operations.
- A failure for one photo does not silently discard other successful results.
- The result summary distinguishes success, skipped and failed files.

### M10 — Ads, monetization & responsive polish
**Deliverables**
- Reusable ad-slot wrappers with reserved dimensions to reduce layout shifts.
- Desktop: top banner, optional right-side vertical ad, optional in-content ad below the workspace.
- Mobile: optional compact banner and/or ad between non-editing sections; never overlay the editor or bottom actions.
- Upgrade/Pro entry point can be present without blocking core editing.
- Layout fallbacks for no-fill/ad-blocked states.

**Done when**
- Core editing and download remain usable when ads fail to load or are blocked.
- No ad appears inside the photo canvas, metadata form, dialogs, or sticky download bar.
- Ad loading does not cause major layout jumps.

### M11 — Privacy, accessibility, security & QA
**Deliverables**
- Plain-language privacy notes: what stays local and what is sent to optional third parties.
- File size/type validation, safe error handling, memory cleanup and URL/object cleanup.
- Keyboard navigation, focus visibility, labels, contrast and screen-reader-friendly status messages.
- Unit, component, integration and browser-level tests.
- Real-file test corpus with expected metadata and export outcomes.
- Test on current Chrome/Edge/Firefox and mobile Safari/Chrome as feasible.

**Done when**
- Critical workflows pass on desktop and mobile.
- Permission, unsupported-format, corrupted-file, no-GPS and export-failure paths are tested.
- No unsupported privacy or format-support claims remain in UI/docs.

### M12 — PWA, deployment & launch
**Deliverables**
- Installability manifest and app icons where supported.
- Offline shell where practical; explain that some optional geocoding/provider features need internet.
- CI checks for lint, type-check, tests and production build.
- Production hosting, environment/configuration documentation, monitoring for app errors without collecting photo contents or precise GPS unnecessarily.
- README with setup, architecture, supported formats, privacy behavior and release notes.

**Done when**
- A fresh clone can be installed and run by following README steps.
- CI passes and production build is deployed.
- Install flow is tested on supported browsers and limitations are documented.

### M13 — Native mobile evaluation
**Deliverables**
- Review actual user demand and PWA limitations.
- Compare a native wrapper (e.g. Capacitor) versus a dedicated React Native/native client.
- Verify photo-library permissions, file-system access, export/save flows, app-store requirements and privacy disclosures.
- Make a decision memo before adding platform-specific code.

**Done when**
- Native development is approved only if it provides meaningful capability beyond the responsive/PWA experience.
- Web and mobile share the same documented product behavior and export correctness requirements.

---

## Suggested implementation batches

Use these batches for focused coding sessions and commits. Each batch should end with a working build and a short verification report.

1. **Batch 1 — Foundation:** M0 + M1 skeleton, app shell, design tokens, navigation, toolbar, responsive panels, ad placeholders, docs.
2. **Batch 2 — Gallery:** M2 file selection, thumbnails, multi-select, validation, empty/loading/error states.
3. **Batch 3 — Preview:** M3 preview, zoom, fit, original/edited comparison and mobile behavior.
4. **Batch 4 — EXIF reader:** M4 metadata model, JPEG fixtures and read-only EXIF panel.
5. **Batch 5 — GPS editor:** M5 current-location permission flow, manual coordinates, apply/remove GPS and tests.
6. **Batch 6 — Tags & metadata:** M6 supported field editing and validation.
7. **Batch 7 — Stamp Studio:** M7 live stamp design, presets and pixel-rendering tests.
8. **Batch 8 — Export:** M8 real output files, metadata verification and downloads.
9. **Batch 9 — Batch processing:** M9 multi-photo operations, progress, retry and results.
10. **Batch 10 — Ads & responsive finish:** M10 placements, mobile ad rules, layout stability and usability polish.
11. **Batch 11 — Quality & privacy:** M11 accessibility, security checks, full test matrix and bug fixing.
12. **Batch 12 — PWA & release:** M12 installability, CI, deployment, README and release checklist.
13. **Post-launch — Native decision:** M13 based on actual needs, not before the web workflow is reliable.

## Technical direction

- Frontend: React, TypeScript and Vite.
- UI: reusable component system and responsive CSS/Tailwind (choose one consistent approach during M1).
- Image preview/stamping: Canvas or OffscreenCanvas where supported, with tested fallback behavior.
- Metadata: choose an EXIF reader/writer only after validating supported fields, browser compatibility, licensing and output preservation.
- Location: browser Geolocation API after permission; optional geocoding behind a provider interface. **No map component.**
- Tests: Vitest + React Testing Library; browser E2E with Playwright or an equivalent tool.
- State: typed app state for files, selection, metadata edits, stamp configuration and export jobs.
- Backend: not required for the initial local-processing release. Add one only for a clearly scoped future need such as accounts, cloud library or subscription entitlements. Never put private API secrets in client code.

## Definition of done for every milestone

- The app builds without errors and all relevant tests pass.
- User-visible actions work or are clearly marked as not yet available.
- Loading, empty, success, warning and failure states are considered.
- Desktop and mobile layouts are checked.
- Source photos are not silently overwritten.
- Privacy behavior and supported formats are documented accurately.
- The milestone ends with a commit and a concise report: changed files, verification run, known limitations, and next milestone.

## Release-critical user journeys

1. Select a JPEG → inspect existing GPS → change coordinates → export → reopen export and verify GPS.
2. Select a photo without GPS → set coordinates manually → export and verify GPS.
3. Capture current location after permission → apply to selected photos → export.
4. Add a visible location/date stamp → compare preview and output.
5. Remove GPS → export → verify GPS metadata is absent where supported.
6. Select multiple photos → batch apply stamp/location → review per-file outcomes.
7. Use the app on a phone → pick photos explicitly → edit → save/download results.
8. Complete all journeys with ads blocked or unavailable, without ads obstructing editing.

## Explicit non-goals for the first release

- No map in the editing UI.
- No unrestricted background photo-library scanning.
- No cloud upload/storage or accounts unless separately scoped and consented to.
- No claims of universal RAW, HEIC, TIFF, WebP or video metadata writing before each format is tested.
- No ad overlays, forced interstitials during editing, or ads placed over download controls.
