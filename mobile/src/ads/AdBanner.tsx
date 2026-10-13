/**
 * Persistent banner ad pinned to the bottom of the screen, below the tab bar.
 * Mirrors the original WP7 app's always-visible pubCenter banner.
 *
 * Uses an anchored adaptive banner so it spans the full width on any device.
 * The container collapses to zero height until Google serves an ad.
 */

import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { ADMOB_BANNER_UNIT_ID } from './admob';
import { colors } from '../ui/theme';

export function AdBanner() {
  return (
    <View style={styles.container} testID="ad-banner">
      <BannerAd
        unitId={ADMOB_BANNER_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    alignItems: 'center',
  },
});
