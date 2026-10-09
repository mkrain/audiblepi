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
import { Ionicons } from '@expo/vector-icons';

import {
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
      onPress={onPress}
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

  const notes = getVisibleNotes();
  const total = getDigitTotal();

  const onTogglePlay = useCallback(() => {
    togglePlay().catch(() => undefined);
  }, []);

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  counter: {
    alignSelf: 'flex-start',
    color: colors.accent,
    fontSize: fontSizes.title,
    marginBottom: spacing.md,
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
