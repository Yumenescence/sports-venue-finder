## Local Sports Venue Finder

Find nearby sports venues with a clean, fast React Native + Expo app.

### Heads‑up (Google API key)

- The app already includes a Google Places API key in `config.js`, from my test account, so reviewers don’t have to set anything up. Replace it later for production.

### Features

- Search by text or current location
- Filter by venue type (gym, stadium, golf_course, swimming_pool)
- Nice cards with photos, rating, distance, open status
- Infinite scroll with 20‑item pages

### Requirements

- Node.js 18+
- Expo (you can use `npx expo` without global install)
- iOS Simulator (Xcode) or Android Emulator (Android Studio) for best results

### Quick Start

```bash
git clone <this-repo>
cd "sports-venue-finder"
npm install

# Option A: Run in Expo Go
npx expo start

# Option B
npx expo run:ios   # or: npx expo run:android
# Note: iOS Simulator doesn't provide real GPS location — use a physical device (or simulate via Features → Location/GPX)
npx expo start --dev-client
```

### Run on a physical device (Expo Go)

- Install Expo Go on your device: App Store / Google Play
- Make sure your phone and computer are on the same network (Wi‑Fi)
- Start the dev server: `npx expo start`
- iPhone:
  - Open the Camera app, scan the QR, tap the banner → Open in Expo Go
- Android:
  - Open Expo Go → Scan QR or tap the LAN URL
- Grant location permission when prompted (turn Precise ON on iOS)
- If QR/LAN does not load:
  - Press `s` in the terminal to switch connection type, or run `npx expo start --tunnel`

### Configuration

- Google Places key lives in `config.js` under `GOOGLE_PLACES_API_KEY` and is prefilled for review.
- Location permissions are requested at runtime. On web, location is not supported in this app.

### Scripts

- `npm start` → `expo start`
- `npm run ios` → start iOS
- `npm run android` → start Android
- `npm run web` → start web (limited functionality)

### Troubleshooting

- Location permission denied: enable it in device/emulator settings and retry.
- Google API errors: if you changed the key, ensure Places API is enabled.
