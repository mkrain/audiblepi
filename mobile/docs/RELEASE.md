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

## Android — Google Play

### One-time setup

1. Register at https://play.google.com/console — $25 one-time fee, paid by
   credit/debit card only (no Venmo, no prepaid cards). Verify your identity
   when prompted.
2. Create app: name "AudiblePi", default language English, App (not game),
   Free. Package name is `com.mkrain.audiblepi`.

### Upload key (one-time, keep it safe)

The release build signs with an upload key whose credentials live in
`~/.gradle/gradle.properties` on the build machine — never in the repo.
Play App Signing (Google holding the real app signing key) is default for new
apps; the upload key below is what you sign uploads with. If you lose it you
can ask Google to reset it, but don't lose it.

```sh
sudo keytool -genkeypair -v -keystore /usr/local/audiblepi-upload-key.keystore \
  -alias audiblepi-upload -keyalg RSA -keysize 2048 -validity 10000
```

Then add to `~/.gradle/gradle.properties`:
```
MYAPP_UPLOAD_STORE_FILE=/usr/local/audiblepi-upload-key.keystore
MYAPP_UPLOAD_STORE_PASSWORD=<password>
MYAPP_UPLOAD_KEY_ALIAS=audiblepi-upload
MYAPP_UPLOAD_KEY_PASSWORD=<password>
```

### Build and upload

`versionCode` is 1 (bump +1 every release), `versionName` is "2.0.0"
in `android/app/build.gradle`.

```sh
cd mobile/android
./gradlew bundleRelease
```

Upload `android/app/build/outputs/bundle/release/app-release.aab`:

1. First to **Testing > Internal testing** — instant, up to 100 testers by
   email list. Use it to verify the store build on a real phone.
2. **Store listing requirements** (must be complete before production):
   description, screenshots, feature graphic, content rating questionnaire,
   target audience, and the Data safety form — declare the AdMob SDK's
   Advertising ID collection, and provide a privacy policy URL (required
   because of ads).
3. **New personal accounts** must run a **closed test with at least 12
   testers for 14 continuous days** before Google grants production access;
   then apply for production in the Console dashboard.

## Versioning (every release)

- Android: `versionCode` (integer, always increments), `versionName`
  in `android/app/build.gradle`.
- iOS: `CURRENT_PROJECT_VERSION` (build number, always increments),
  `MARKETING_VERSION` (user-visible) in `project.pbxproj`.
- About page: `ABOUT.version` in `src/screens/AboutScreen.tsx`.
