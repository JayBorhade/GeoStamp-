# GeoStamp Privacy Notes

Current implementation:

- Photos are selected explicitly through the file picker or drag-and-drop.
- Image processing occurs in the browser; this version does not upload photos to a GeoStamp server.
- Temporary object URLs and in-memory edit state are used for previews and are not cloud storage.
- Current-location capture uses browser geolocation only after the user clicks Capture Location; the browser asks for permission.
- No map or external geocoding provider is integrated.
- Ad slots are placeholders and do not load an advertising SDK.

Users should understand that browser extensions, the hosting provider, their device, and the browser itself are outside the app's direct control. A future release that introduces analytics, remote geocoding, accounts, cloud storage or live ads must update this document and provide appropriate consent/disclosures before release.
