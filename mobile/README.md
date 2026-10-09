# AudiblePi (React Native)

**Hear the digits of π.** Each base-12 digit of pi plays a musical note —
chromatic scale, 5 instruments (Glockenspiel, Guitar, Piano, Sax, Violin) —
on a configurable tempo. This is a bare React Native + TypeScript port of the
original Windows Phone 7 Silverlight app (whose source is preserved at the
repo root for reference); the mobile app lives in `mobile/`.

## Prerequisites

- **Node.js 22 LTS or newer** (the repo's `engines` field requires ≥ 22.11) and
  **npm** (ships with Node). Check with `node --version` / `npm --version`.
- **iOS:** Xcode (Mac only) + CocoaPods (`sudo gem install cocoapods`).
  Also run `bundle install` once inside `mobile/ios` if the Podfile setup
  complains about the Ruby bundler.
- **Android:** JDK 17 + Android Studio (SDK + an emulator, or a connected
  device with USB debugging).

Follow the [React Native environment setup guide](https://reactnative.dev/docs/set-up-your-environment)
first if any of the above is missing.

## Setup (do this after every fresh clone)

The `react-native` CLI lives in `node_modules` — **nothing works until
dependencies are installed**:

```sh
cd mobile
npm install
```

## Run

Terminal 1 — start Metro (the JS bundler):

```sh
cd mobile
npm start
```

Terminal 2 — build & run the app (with Metro running):

**Android** (emulator open, or device connected):

```sh
cd mobile
npx react-native run-android
```

**iOS** (Mac only — install pods first, then run):

```sh
cd mobile
cd ios && pod install && cd ..
npx react-native run-ios
```

You can also open `mobile/ios/AudiblePi.xcworkspace` in Xcode or the
`mobile/android` folder in Android Studio and build from there.

## Troubleshooting

**`sh: react-native: command not found` when running `npm start`**
→ You skipped Setup. Run `npm install` inside `mobile/` (this installs the
React Native CLI locally) and try again. This bites after every fresh clone.

**iOS build fails on first try**
→ The Expo native integration (expo-av, expo-file-system, …) was
hand-applied to the native projects because `install-expo-modules` doesn't
support this React Native version yet. The first `pod install` / Xcode build
on a Mac is what verifies it — if it fails, paste the error and we'll fix the
native wiring.

**Metro can't resolve a new native dependency**
→ Re-run `pod install` (iOS) or rebuild (Android) after `npm install`.

**Port 8081 in use**
→ `npx react-native start --port 8088` (and shake the device → Dev Settings →
set the debug server host/port to match).

## Project layout

```
mobile/
  App.tsx                 # bootstrap: settings hydrate → digit file → audio engine → tabs
  src/
    playback.ts           # transport orchestration (the screens call this)
    navigation.tsx        # bottom tabs: Player / Settings / About
    screens/              # PlayerScreen, SettingsScreen, AboutScreen
    audio/                # SoundBank (expo-av), TempoScheduler, PlaybackController
    lib/                  # pi engine: BigNumber, Machin PiCalculator, digit→note map
    state/                # zustand stores: player, settings (MMKV), calculation
    ui/                   # theme, instrument icons
  assets/                 # 60 WAVs, pi-digit files, icons (from the WP7 project)
```

Product decisions baked in: **base-12 only** (no base-10 toggle), **no
cross-promo "other apps" section**, **precomputed digits by default** (the
Machin calculator remains as the secondary option in Settings).

## Tests

```sh
cd mobile
npx jest          # 95 tests: parity vs the C# originals, audio, state, screens
npx tsc --noEmit  # strict TypeScript
npx eslint src __tests__ App.tsx
```
