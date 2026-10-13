const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    // 'txt' is not a default Metro asset ext; needed for the bundled
    // pi-digit files loaded via expo-asset (see src/lib/pi-digits-store.ts).
    // 'wav' is already included by default.
    assetExts: [...defaultConfig.resolver.assetExts, 'txt'],
  },
};

module.exports = mergeConfig(defaultConfig, config);
