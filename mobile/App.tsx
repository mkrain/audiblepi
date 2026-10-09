/**
 * AudiblePi — hear the digits of pi.
 *
 * Bootstraps persisted settings, the precomputed digit file and the audio
 * engine before showing the tab UI.
 *
 * @format
 */

import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/navigation';
import { initApp } from './src/playback';
import { colors, fontSizes, spacing } from './src/ui/theme';

function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    initApp()
      .then(() => {
        if (!cancelled) {
          setReady(true);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaProvider>
      {error ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Couldn&apos;t start AudiblePi</Text>
          <Text style={styles.errorBody}>{error}</Text>
        </View>
      ) : ready ? (
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      ) : (
        <View style={styles.center} testID="app-loading">
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading pi…</Text>
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    color: colors.muted,
    fontSize: fontSizes.body,
    marginTop: spacing.md,
  },
  errorTitle: {
    color: colors.danger,
    fontSize: fontSizes.title,
    marginBottom: spacing.sm,
  },
  errorBody: {
    color: colors.text,
    fontSize: fontSizes.body,
    textAlign: 'center',
  },
});

export default App;
