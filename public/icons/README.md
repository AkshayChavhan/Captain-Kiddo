# App Icons

`public/manifest.json` references these icon files. Add real PNG images here with
**exactly these names** so the PWA installs with a proper home-screen icon:

| File | Size | Purpose |
|------|------|---------|
| `icon-192.png` | 192×192 | Standard icon (smaller devices) |
| `icon-512.png` | 512×512 | Standard icon (splash / larger) |
| `icon-maskable-512.png` | 512×512 | "Maskable" — safe-zone padded so Android can crop it into any shape |

Tips:
- Use the Captain Kiddo mascot on a bright background (`#FFD93D` is the manifest's
  background color).
- For the maskable icon, keep important content within the central ~80% "safe zone"
  (Android may crop the edges into a circle/squircle).
- Until these exist, the app still runs — only the installed icon is missing.
