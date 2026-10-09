/**
 * AdMob configuration.
 *
 * The app ships with Google's official TEST ids so banners render during
 * development without generating invalid traffic. Every id below must be
 * replaced with the real ids from https://apps.admob.com before ANY store
 * release — search this file (and AndroidManifest.xml / Info.plist) for
 * `TODO(ADMOB)`.
 */

import { TestIds } from 'react-native-google-mobile-ads';

// TODO(ADMOB): Replace with your real AdMob banner unit id.
// AdMob console > Apps > AudiblePi > Ad units > Banner. Keep one unit id per
// platform (AdMob issues separate ids for Android and iOS).
// Currently: Google's test banner id (per-platform via TestIds.BANNER).
export const ADMOB_BANNER_UNIT_ID: string = TestIds.BANNER;

// TODO(ADMOB): Replace with your real AdMob app ids.
// AdMob console > Apps > AudiblePi > App settings. These live in the native
// projects, not here:
//   Android: android/app/src/main/AndroidManifest.xml
//            (meta-data com.google.android.gms.ads.APPLICATION_ID)
//   iOS:     ios/AudiblePi/Info.plist (GADApplicationIdentifier)
// Currently: Google's test app ids on both platforms.
export const ADMOB_APP_IDS = {
  android: 'ca-app-pub-3940256099942544~3347511713',
  ios: 'ca-app-pub-3940256099942544~1458002511',
} as const;
