# AudiblePi — Release Checklist

Everything below is in order. The app currently ships with **Google test ad
ids** and must not go to either store until step 1 is done.

Bundle IDs are set to `com.mkrain.audiblepi` on both platforms (matching the
original publisher `mkrain`). Change them before creating the store listings
if you want something else:
- Android: `android/app/build.gradle` (`namespace` + `applicationId`)
- iOS: `ios/AudiblePi.xcodeproj/project.pbxproj` (`PRODUCT_BUNDLE_IDENTIFIER`,
  Debug and Release)

## 0. Verify the native build (do this first, once)

The Expo native integration (`expo-av`, `expo-file-system`, etc.) and the
`@react-native-picker/picker` native module were wired by hand — the automated
installer doesn't support this RN version. Before anything else:

```sh
cd mobile
npm install
npx pod-install          # iOS; run from mobile/ios if you prefer pod install
npx react-native run-ios # or open ios/AudiblePi.xcworkspace in Xcode and build
npx react-native run-android
```

If either build fails on a native module, that's the thing to fix before
continuing — everything below assumes green builds.

## 1. AdMob — swap test ids for real ones

1. Create an AdMob account at https://apps.admob.com and add the app
   (use the final bundle id from above).
2. Create a **banner** ad unit. AdMob issues separate unit ids per platform —
   create one for Android and one for iOS.
3. Replace every `TODO(ADMOB)`:
   - `mobile/src/ads/admob.ts` → `ADMOB_BANNER_UNIT_ID` (per-platform unit id)
   - `mobile/android/app/src/main/AndroidManifest.xml` →
     `com.google.android.gms.ads.APPLICATION_ID` meta-data (app id)
   - `mobile/ios/AudiblePi/Info.plist` → `GADApplicationIdentifier` (app id)
4. If you serve ads to EU users, gate `mobileAds().initialize()` in
   `mobile/App.tsx` behind UMP consent (see `App.tsx` NOTE).

## 2. iOS — TestFlight

1. Enroll in the Apple Developer Program; create the App Store Connect record
   for the app (bundle id must match step 0's).
2. Bump the build number: `ios/AudiblePi.xcodeproj/project.pbxproj`
   (`CURRENT_PROJECT_VERSION`); `MARKETING_VERSION` is the user-visible version.
3. Archive: open `ios/AudiblePi.xcworkspace` in Xcode → Product > Archive,
   then Distribute App > App Store Connect. (CLI alternative:
   `npx react-native build-ios --configuration Release`.)
4. In App Store Connect: TestFlight > create an internal group, add testers,
   enable the build for testing.

## 3. Android — Play internal track

1. Create the app in the Play Console (package name must match step 0's);
   complete the store listing, content rating, and data-safety forms.
2. App signing: let Play manage the signing key (recommended), or generate an
   upload keystore and reference it in `android/gradle.properties`
   (`MYAPP_UPLOAD_STORE_FILE`, `MYAPP_UPLOAD_KEY_ALIAS`, passwords) plus a
   `release` signingConfig in `android/app/build.gradle`.
3. Bump `versionCode` (+1 every release) and `versionName` in
   `android/app/build.gradle`.
4. Build and upload:
   ```sh
   cd mobile/android && ./gradlew bundleRelease
   ```
   Upload `android/app/build/outputs/bundle/release/app-release.aab` to
   Play Console > Testing > Internal testing.

## 4. Versioning (every release)

- Android: `versionCode` (integer, always increments), `versionName`
  (`"1.0"`, `"1.1"`, …) in `android/app/build.gradle`.
- iOS: `CURRENT_PROJECT_VERSION` (build number, always increments),
  `MARKETING_VERSION` (user-visible) in `project.pbxproj`.

## 5. Regenerating art

- Launcher icons: `node scripts/generate-icons.js` (source:
  `assets/images/Pi.Glow.png`; outputs committed).
- Splash: `npx react-native-bootsplash generate assets/images/Pi.Glow.png
  --platforms android,ios --background "#070014" --logo-width 120
  --assets-output assets/bootsplash`, then re-apply the two manual native
  hooks if the generator overwrites them (`MainActivity.kt`
  `RNBootSplash.init`, `AppDelegate.swift` `initWithStoryboard`).
