# GeoStamp Product Specification

## Product promise
GeoStamp helps people add, correct, inspect, stamp, and remove location information from photos without needing a map or a complicated editing workflow.

## Primary user actions
1. **Edit photo location** — inspect existing GPS, capture current coordinates after permission, manually enter latitude/longitude/altitude, name the place, apply to selected photos, or remove GPS.
2. **Add a visible stamp** — overlay location name, capture date/time, coordinates and custom text on exported image pixels.
3. **Inspect metadata** — review supported EXIF fields and understand which fields can be written safely.
4. **Organize photos** — explicitly select images from desktop/mobile pickers, preview, multi-select and add workspace tags.
5. **Export copies** — process one photo or a batch, download a single file or ZIP, review failures, preserve originals.

## UX principles
- No map UI. Coordinates and location names are sufficient for the first release.
- Desktop shows the selected photo gallery on the left, a compact central preview, and tabbed controls on the right.
- Mobile uses the system/browser photo picker, compact tools, and bottom navigation/actions.
- Keep the main toolbar visible on desktop: Upload Photos, Capture Location, Set Location, Add Tag, Edit EXIF, Add Stamp, Batch Edit, Remove Location and Export.
- Use plain language, helpful defaults, clear progress and useful error messages.
- Ad slots must never overlap the photo, editor fields, dialogs or download controls. Ads may be hidden on narrow screens.
- Never silently overwrite original files.

## Privacy and permissions
- The app works with user-selected files only; it does not silently scan the whole photo library.
- Current location is requested only after the user presses Capture Location and the browser displays its permission flow.
- Files remain local in the initial version. Do not send image content or precise coordinates to analytics.
- If a future place-search/reverse-geocoding provider is added, disclose what is sent to that provider.
- A future cloud feature must be separately scoped, opt-in and documented.

## Initial support matrix
| Capability | Initial support |
|---|---|
| Preview | JPEG, PNG, WebP, AVIF when the browser can decode them |
| EXIF/GPS reading | Supported metadata exposed by exifr; coverage varies by file |
| GPS write/remove | JPEG only; validate output with round-trip tests |
| Visible stamps | Canvas-generated JPEG copy |
| Tags | Workspace-only labels; not embedded into EXIF |
| Batch export | ZIP of successful files with per-file status |
| Mobile | Responsive web app/PWA foundation; browser/system picker |
| Native apps | Evaluate after web workflow is proven |

## Honest limitations
- A browser canvas export creates a new image and does not automatically preserve EXIF.
- The initial stamp renderer outputs JPEG; original/metadata-only workflow is separate.
- The JPEG quality control affects stamped JPEG output only.
- Editing date/time and arbitrary EXIF fields is not claimed until a reliable writer and round-trip tests are implemented.
- The initial manifest provides PWA metadata, but production installability also requires hosting over HTTPS, icons/service-worker strategy, and browser verification.
