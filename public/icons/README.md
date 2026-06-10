# App Icons

`public/manifest.json` references these icon files. Add real PNG images here with
**exactly these names** so the PWA installs with a proper home-screen icon:

| File | Size | Purpose |
|------|------|---------|
| `icon-192.png` | 192×192 | Standard icon (smaller devices) |
| `icon-512.png` | 512×512 | Standard icon (splash / larger) |
| `icon-maskable-512.png` | 512×512 | "Maskable" — safe-zone padded so Android can crop it into any shape |

> ⚠️ **These are currently PLACEHOLDER icons** — plain solid-color squares (red for the
> standard icons, yellow for maskable) generated to stop the manifest 404. **Replace
> them with real artwork** (same filenames) when ready.

Tips:
- Use the Captain Kiddo mascot on a bright background (`#FFD93D` is the manifest's
  background color).
- For the maskable icon, keep important content within the central ~80% "safe zone"
  (Android may crop the edges into a circle/squircle).
- Any image editor or an online "PWA icon generator" can produce all three sizes.
