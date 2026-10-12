/**
 * Player screen — port of the WP7 Panorama's first item (PiViewModel).
 *
 * Prev/current/next note buttons (tap = hear that note), a large
 * current-note display, the "digit N of M" counter, an instrument-cycle
 * button, the base-12 indicator, and the prev / play-pause / next
 * transport row.
 */

import { useCallback } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  cancelBackgroundCalculation,
  cycleInstrument,
  getDigitTotal,
  getVisibleNotes,
  stepNext,
  stepPrevious,
  tapNote,
  togglePlay,
} from '../playback';
import { usePlayerStore } from '../state/player';
import { useSettingsStore } from '../state/settings';
import { useCalculationStore } from '../state/calculation';
import { iconForInstrument } from '../ui/instrument-icons';
import { colors, fontSizes, spacing } from '../ui/theme';

function NoteButton({
  testID,
  label,
  onPress,
}: {
  testID: string;
  label: string | null;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      testID={testID}
      style={[styles.noteButton, !label && styles.noteButtonDisabled]}
      onPressIn={onPress}
      disabled={!label}
      activeOpacity={0.6}
    >
      <Text style={styles.noteButtonText}>{label ?? '–'}</Text>
    </TouchableOpacity>
  );
}

export function PlayerScreen() {
  const digitIndex = usePlayerStore((s) => s.digitIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const instrumentId = useSettingsStore((s) => s.instrumentId);
  const isCalculating = useCalculationStore((s) => s.isCalculating);
  const progressDigit = useCalculationStore((s) => s.progressDigit);
  const targetDigits = useCalculationStore((s) => s.targetDigits);

  const notes = getVisibleNotes();
  const total = getDigitTotal();

  const onTogglePlay = useCallback(() => {
    togglePlay().catch(() => undefined);
  }, []);

  const onCancelCalculation = useCallback(() => {
    cancelBackgroundCalculation();
    // Keep isCalculating true so the progress stays visible — the partial
    // digits are now the active source. User toggles precomputed in Settings
    // to revert.
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text testID="counter" style={styles.counter}>
        digit {digitIndex + 1} of {total}
      </Text>

      <View style={styles.topRow}>
        <View testID="base-indicator" style={styles.baseBadge}>
          <Text style={styles.baseBadgeText}>BASE 12</Text>
        </View>
        <TouchableOpacity
          testID="instrument-button"
          style={styles.instrumentButton}
          onPress={cycleInstrument}
          activeOpacity={0.7}
        >
          <Image
            source={iconForInstrument(instrumentId)}
            style={styles.instrumentIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <Text testID="current-note-name" style={styles.currentNote}>
        {notes.current ?? '–'}
      </Text>

      <View style={styles.notesRow}>
        <NoteButton
          testID="note-previous"
          label={notes.previous}
          onPress={() => tapNote('previous')}
        />
        <NoteButton
          testID="note-current"
          label={notes.current}
          onPress={() => tapNote('current')}
        />
        <NoteButton
          testID="note-next"
          label={notes.next}
          onPress={() => tapNote('next')}
        />
      </View>

      {isCalculating && (
        <View style={styles.calcBanner}>
          <Text testID="calc-progress" style={styles.calcProgress}>
            {progressDigit < 0
              ? `Computing… term ${(-progressDigit).toLocaleString()}`
              : `Digit ${progressDigit.toLocaleString()} of ${targetDigits.toLocaleString()}`}
          </Text>
          <TouchableOpacity
            testID="calc-cancel"
            style={styles.calcCancel}
            onPress={onCancelCalculation}
            activeOpacity={0.7}
          >
            <Ionicons name="stop-circle" size={28} color={colors.danger} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.transportRow}>
        <TouchableOpacity
          testID="transport-previous"
          style={styles.transportButton}
          onPress={stepPrevious}
          activeOpacity={0.6}
        >
          <Ionicons name="play-skip-back" size={36} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          testID="transport-play"
          style={[styles.transportButton, styles.playButton]}
          onPress={onTogglePlay}
          activeOpacity={0.6}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={44}
            color={colors.text}
          />
        </TouchableOpacity>
        <TouchableOpacity
          testID="transport-next"
          style={styles.transportButton}
          onPress={stepNext}
          activeOpacity={0.6}
        >
          <Ionicons name="play-skip-forward" size={36} color={colors.text} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  counter: {
    alignSelf: 'flex-start',
    color: colors.accent,
    fontSize: fontSizes.title,
    marginBottom: spacing.md,
  },
  calcBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  calcProgress: {
    flex: 1,
    color: colors.accent,
    fontSize: fontSizes.body,
  },
  calcCancel: {
    padding: spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.sm,
  },
  baseBadge: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  baseBadgeText: {
    color: colors.accent,
    fontSize: fontSizes.small,
    fontWeight: '600',
  },
  instrumentButton: {
    width: 56,
    height: 56,
  },
  instrumentIcon: {
    width: 56,
    height: 56,
  },
  currentNote: {
    color: colors.accent,
    fontSize: fontSizes.giant,
    fontWeight: '200',
    marginVertical: spacing.md,
  },
  notesRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginBottom: spacing.xl,
  },
  noteButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteButtonDisabled: {
    borderColor: colors.border,
  },
  noteButtonText: {
    color: colors.text,
    fontSize: fontSizes.title,
    fontWeight: '600',
  },
  transportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 'auto',
    marginBottom: spacing.xl,
  },
  transportButton: {
    padding: spacing.md,
  },
  playButton: {
    backgroundColor: colors.accentDim,
    borderRadius: 40,
  },
});
