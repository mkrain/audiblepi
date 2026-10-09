module.exports = {
  preset: '@react-native/jest-preset',
  // Extends the preset's pattern (which transforms react-native itself):
  // @react-navigation/* and react-native-screens ship ESM and need Babel too.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-screens)/)',
  ],
};
