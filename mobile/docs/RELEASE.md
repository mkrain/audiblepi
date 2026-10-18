# AudiblePi — Release Checklist

Bundle IDs are `com.mkrain.audiblepi` on both platforms. User-visible version
is 2.0.0 (About page, iOS MARKETING_VERSION, Android versionName).

AdMob is wired with real IDs (checked in per Jeremiah's decision):
- iOS app ID in `Info.plist` (`GADApplicationIdentifier`)
- Android app ID in `AndroidManifest.xml` (`APPLICATION_ID`)
- Banner units per platform in `mobile/src/ads/admob.ts`

## iOS — TestFlight

1. Apple Developer Program must be active. Create the App Store Connect record
   for the app (bundle id `com.mkrain.audiblepi`).
2. Build number: `ios/AudiblePi.xcodeproj/project.pbxproj`
   (`CURRENT_PROJECT_VERSION`, currently 1 — bump for each new build).
   `MARKETING_VERSION` is 2.0.0.
3. Archive: open `ios/AudiblePi.xcworkspace` in Xcode → Product > Archive,
   then Distribute App > App Store Connect.
4. In App Store Connect: TestFlight > create an internal group, add testers,
   enable the build.

## Android — Play internal track

1. Create the app in the Play Console (package `com.mkrain.audiblepi`);
   complete the store listing, content rating, and data-safety forms.
2. **Upload keystore (not done yet).** Generate one:
   ```sh
   keytool -genkeypair -v -keystore ~/audiblepi-upload.keystore \
     -alias audiblepi -keyalg RSA -keysize 2048 -validity 10000
   ```
   Then in `mobile/android/gradle.properties` set:
   ```
   MYAPP_UPLOAD_STORE_FILE=/path/to/audiblepi-upload.keystore
   MYAPP_UPLOAD_KEY_ALIAS=audiblepi
   MYAPP_UPLOAD_STORE_PASSWORD=...
   MYAPP_UPLOAD_KEY_PASSWORD=...
   ```
   And add a `release` signingConfig in `android/app/build.gradle` using
   those properties. (Or let Play manage signing and skip the keystore —
   Play's app signing is the recommended path for new apps.)
3. `versionCode` is 1 (bump +1 every release), `versionName` is "2.0.0"
   in `android/app/build.gradle`.
4. Build and upload:
   ```sh
   cd mobile/android && ./gradlew bundleRelease
   ```
   Upload `android/app/build/outputs/bundle/release/app-release.aab`
   to Play Console > Testing > Internal testing.

## Versioning (every release)

- Android: `versionCode` (integer, always increments), `versionName`
  in `android/app/build.gradle`.
- iOS: `CURRENT_PROJECT_VERSION` (build number, always increments),
  `MARKETING_VERSION` (user-visible) in `project.pbxproj`.
- About page: `ABOUT.version` in `src/screens/AboutScreen.tsx`.
