/**
 * Player screen — port of the WP7 Panorama's first item (PiViewModel).
 *
 * Compact header (digit counter + base badge + instrument), hero note
 * display with digit→note mapping, a 5-note tappable strip, a position
 * scrubber, an "up next" piano roll, and the transport row.
 */

import { useCallback, useRef } from 'react';
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
  getNoteStrip,
  getUpcomingNotes,
  getVisibleNotes,
  seekToDigit,
  stepNext,
  stepPrevious,
  tapNoteAt,
  togglePlay,
} from '../playback';
import { usePlayerStore } from '../state/player';
import { useSettingsStore } from '../state/settings';
import { useCalculationStore } from '../state/calculation';
import { iconForInstrument } from '../ui/instrument-icons';
import { colors, fontSizes, spacing } from '../ui/theme';

const UPCOMING_COUNT = 7;

function StripKey({
  testID,
  label,
  digitLabel,
  highlighted,
  disabled,
  onPress,
}: {
  testID: string;
  label: string | null;
  digitLabel: string;
  highlighted: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.stripKey,
        highlighted && styles.stripKeyCurrent,
        disabled && styles.stripKeyDisabled,
      ]}
      onPressIn={onPress}
      disabled={disabled}
      activeOpacity={0.6}
    >
      <Text
        style={[styles.stripKeyNote, highlighted && styles.stripKeyNoteCurrent]}
      >
        {label ?? '–'}
      </Text>
      <Text style={styles.stripKeyDigit}>{digitLabel}</Text>
    </TouchableOpacity>
  );
}

function Scrubber({ value, max }: { value: number; max: number }) {
  const trackRef = useRef<View>(null);

  const seekFromTouch = useCallback(
    (x: number) => {
      const track = trackRef.current as unknown as {
        measure: (
          cb: (
            x: number,
            y: number,
            width: number,
            height: number,
            pageX: number,
            pageY: number,
          ) => void,
        ) => void;
      } | null;
      if (!track || typeof track.measure !== 'function') {
        return;
      }
      track.measure((_x, _y, width, _h, pageX) => {
        const ratio = Math.max(0, Math.min(1, (x - pageX) / Math.max(1, width)));
        seekToDigit(Math.round(ratio * Math.max(0, max - 1)));
      });
    },
    [max],
  );

  const ratio = max > 1 ? value / (max - 1) : 0;

  return (
    <View style={styles.scrubWrap}>
      <View style={styles.scrubLabels}>
        <Text style={styles.scrubLabel}>1</Text>
        <Text style={styles.scrubLabel}>{max.toLocaleString()}</Text>
      </View>
      <View
        ref={trackRef}
        testID="scrubber"
        style={styles.scrubTrack}
        onStartShouldSetResponder={() => true}
        onResponderGrant={(e) => seekFromTouch(e.nativeEvent.pageX)}
        onResponderMove={(e) => seekFromTouch(e.nativeEvent.pageX)}
      >
        <View style={[styles.scrubFill, { width: `${ratio * 100}%` }]} />
        <View style={[styles.scrubKnob, { left: `${ratio * 100}%` }]} />
      </View>
    </View>
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
  const strip = getNoteStrip();
  const upcoming = getUpcomingNotes(UPCOMING_COUNT);
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

  // Back-compat testIDs for the three central strip keys.
  const testIdForOffset = (offset: number): string => {
    switch (offset) {
      case -2:
        return 'note-prev2';
      case -1:
        return 'note-previous';
      case 0:
        return 'note-current';
      case 1:
        return 'note-next';
      case 2:
        return 'note-next2';
      default:
        return `note-offset-${offset}`;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Compact header: counter + base badge + instrument */}
      <View style={styles.header}>
        <Text testID="counter" style={styles.counter}>
          digit {(digitIndex + 1).toLocaleString()} of {total.toLocaleString()}
        </Text>
        <View style={styles.headerRight}>
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
      </View>

      {/* Hero: current note + digit→note mapping */}
      <View style={styles.hero}>
        <Text testID="current-note-name" style={styles.heroNote}>
          {notes.current ?? '–'}
        </Text>
        <Text style={styles.heroDigit}>
          digit {(digitIndex + 1).toLocaleString()} → {notes.current ?? '–'}
        </Text>
      </View>

      {/* 5-note tappable strip */}
      <View style={styles.strip}>
        {strip.map((s) => (
          <StripKey
            key={s.offset}
            testID={testIdForOffset(s.offset)}
            label={s.note}
            digitLabel={
              s.note ? (s.digitIndex + 1).toLocaleString() : '·'
            }
            highlighted={s.offset === 0}
            disabled={!s.note}
            onPress={() => tapNoteAt(s.offset)}
          />
        ))}
      </View>

      {/* Position scrubber */}
      <Scrubber value={digitIndex} max={total} />

      {/* Up next roll */}
      <View style={styles.rollWrap}>
        <Text style={styles.rollLabel}>UP NEXT</Text>
        <View style={styles.roll}>
          {upcoming.map((u, i) => (
            <View
              key={u.digitIndex}
              testID={i === 0 ? 'upnext-first' : `upnext-${i}`}
              style={[styles.rollCell, i === 0 && styles.rollCellHit]}
            >
              <Text
                style={[
                  styles.rollCellText,
                  i === 0 && styles.rollCellTextHit,
                ]}
              >
                {u.note ?? '·'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Transport */}
      <View style={styles.transportRow}>
        <TouchableOpacity
          testID="transport-previous"
          style={styles.transportButton}
          onPress={stepPrevious}
          activeOpacity={0.6}
        >
          <Ionicons name="play-skip-back" size={32} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          testID="transport-play"
          style={[styles.transportButton, styles.playButton]}
          onPress={onTogglePlay}
          activeOpacity={0.6}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={40}
            color={colors.text}
          />
        </TouchableOpacity>
        <TouchableOpacity
          testID="transport-next"
          style={styles.transportButton}
          onPress={stepNext}
          activeOpacity={0.6}
        >
          <Ionicons name="play-skip-forward" size={32} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Background-calculation banner (below transport so it never shifts the player UI) */}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  },
  counter: {
    color: colors.accent,
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
    fontSize: fontSizes.tiny,
    fontWeight: '600',
  },
  instrumentButton: {
    width: 40,
    height: 40,
  },
  instrumentIcon: {
    width: 40,
    height: 40,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  heroNote: {
    color: colors.accent,
    fontSize: 56,
    fontWeight: '200',
    // Fixed width + left alignment keeps the layout stable when switching
    // between natural notes (e.g. "D") and accidentals (e.g. "D#") —
    // centered text would still shift within the box.
    minWidth: 160,
    textAlign: 'left',
  },
  heroDigit: {
    color: colors.muted,
    fontSize: fontSizes.body,
  },
  strip: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.xs,
    marginVertical: spacing.sm,
  },
  stripKey: {
    flex: 1,
    height: 92,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  stripKeyCurrent: {
    borderColor: colors.accent,
    backgroundColor: '#0d1f2a',
  },
  stripKeyDisabled: {
    opacity: 0.4,
  },
  stripKeyNote: {
    color: colors.text,
    fontSize: fontSizes.title,
    fontWeight: '700',
  },
  stripKeyNoteCurrent: {
    color: colors.accent,
  },
  stripKeyDigit: {
    color: colors.muted,
    fontSize: fontSizes.tiny,
  },
  scrubWrap: {
    width: '100%',
    marginVertical: spacing.xs,
  },
  scrubLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  scrubLabel: {
    color: colors.muted,
    fontSize: fontSizes.tiny,
  },
  scrubTrack: {
    height: 44,
    justifyContent: 'center',
  },
  scrubFill: {
    position: 'absolute',
    left: 0,
    height: 8,
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  scrubKnob: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accent,
    marginLeft: -13,
    borderWidth: 3,
    borderColor: colors.background,
  },
  rollWrap: {
    width: '100%',
    paddingVertical: spacing.md,
  },
  rollLabel: {
    color: colors.muted,
    fontSize: fontSizes.tiny,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  roll: {
    flexDirection: 'row',
    gap: 6,
  },
  rollCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rollCellHit: {
    backgroundColor: colors.accentDim,
    borderColor: colors.accent,
  },
  rollCellText: {
    color: colors.text,
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
  rollCellTextHit: {
    color: colors.text,
  },
  calcBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: spacing.sm,
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
  transportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: spacing.xl,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  transportButton: {
    padding: spacing.sm,
  },
  playButton: {
    backgroundColor: colors.accentDim,
    borderRadius: 36,
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
