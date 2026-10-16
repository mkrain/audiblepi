/**
 * AdMob configuration.
 *
 * Real production ids from https://apps.admob.com. The native app ids live
 * in the platform projects, not here:
 *   Android: android/app/src/main/AndroidManifest.xml
 *            (meta-data com.google.android.gms.ads.APPLICATION_ID)
 *   iOS:     ios/AudiblePi/Info.plist (GADApplicationIdentifier)
 */

import { Platform } from 'react-native';

// Real banner unit ids from https://apps.admob.com
// (Apps > [app] > Ad units > Banner). New units can take a few hours
// before they start serving real ads.
const BANNER_UNIT_IDS = {
  android: 'ca-app-pub-6432548326018233/5600102539',
  ios: 'ca-app-pub-6432548326018233/2242030199',
} as const;

export const ADMOB_BANNER_UNIT_ID: string =
  Platform.OS === 'ios' ? BANNER_UNIT_IDS.ios : BANNER_UNIT_IDS.android;

// App ids (from AdMob console > Apps > [app] > App settings) — kept here
// for reference; the live values are in the native projects listed above.
export const ADMOB_APP_IDS = {
  android: 'ca-app-pub-6432548326018233~4835659086',
  ios: 'ca-app-pub-6432548326018233~1722410582',
} as const;
