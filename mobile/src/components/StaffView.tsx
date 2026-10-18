import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getNotesWindow, scrubBySteps, tapNoteAt } from '../playback';
import { usePlayerStore } from '../state/player';
import { colors, fontSizes, spacing } from '../ui/theme';
import type { NoteName } from '../lib/notes';

/** Notes shown behind/ahead of the playhead. */
const BEFORE = 3;
const AFTER = 10;
/** Horizontal pixels per digit. */
const SPACING = 30;
/** Tap vs swipe threshold in pixels. */
const TAP_SLOP = 10;

/** Staff geometry: 5 lines, 12px apart, top line at STAFF_TOP. */
const STAFF_TOP = 30;
const LINE_GAP = 12;
const STAFF_HEIGHT = 120;

/** Vertical center of each note on the staff (treble, C4–B4). */
const NOTE_Y: Record<NoteName, number> = {
  B: STAFF_TOP + 6,
  'A#': STAFF_TOP + 12,
  A: STAFF_TOP + 12,
  'G#': STAFF_TOP + 18,
  G: STAFF_TOP + 18,
  'F#': STAFF_TOP + 24,
  F: STAFF_TOP + 24,
  E: STAFF_TOP + 30,
  'D#': STAFF_TOP + 36,
  D: STAFF_TOP + 36,
  'C#': STAFF_TOP + 42,
  C: STAFF_TOP + 42,
};

const SHARPS: Partial<Record<NoteName, boolean>> = {
  'C#': true,
  'D#': true,
  'F#': true,
  'G#': true,
  'A#': true,
};

const HEAD_W = 13;
const HEAD_H = 10;
const STEM_W = 2;
const STEM_H = 30;

/**
 * Live sheet-music staff. Notes sit at their true pitch positions and scroll
 * past the playhead as the digits play. Tap a note to hear it; swipe
 * horizontally to scrub through the digits, sounding each one.
 */
export function StaffView() {
  // Re-render whenever the cursor moves (playback, skip, scrub, tap).
  usePlayerStore((s) => s.digitIndex);
  const notes = getNotesWindow(BEFORE, AFTER);

  // Briefly flash a tapped note so the press has a visual cue.
  const [pressedDigitIndex, setPressedDigitIndex] = useState<number | null>(
    null,
  );
  const pressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (pressTimeout.current) {
        clearTimeout(pressTimeout.current);
      }
    },
    [],
  );
  const flashNote = (digitIndex: number) => {
    if (pressTimeout.current) {
      clearTimeout(pressTimeout.current);
    }
    setPressedDigitIndex(digitIndex);
    pressTimeout.current = setTimeout(() => setPressedDigitIndex(null), 350);
  };

  const gesture = useRef({
    startX: 0,
    lastX: 0,
    accumulatedDx: 0,
    scrubbing: false,
  });

  // Playhead sits at the horizontal center, aligned with the transport play
  // button and the current strip key above.
  const [staffWidth, setStaffWidth] = useState(0);
  const playheadX = staffWidth / 2;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>SCORE</Text>
      <View
        style={styles.staff}
        onLayout={(e) => setStaffWidth(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onResponderGrant={(e) => {
          const x = e.nativeEvent.locationX;
          gesture.current = {
            startX: x,
            lastX: x,
            accumulatedDx: 0,
            scrubbing: false,
          };
        }}
        onResponderMove={(e) => {
          const g = gesture.current;
          const x = e.nativeEvent.locationX;
          g.accumulatedDx += x - g.lastX;
          g.lastX = x;

          if (!g.scrubbing && Math.abs(g.accumulatedDx) < TAP_SLOP) {
            return;
          }
          g.scrubbing = true;

          const steps = Math.trunc(g.accumulatedDx / SPACING);
          if (steps !== 0) {
            // Dragging the notes left pulls upcoming notes to the playhead:
            // swipe left = forward in time.
            scrubBySteps(-steps);
            g.accumulatedDx -= steps * SPACING;
          }
        }}
        onResponderRelease={(e) => {
          const g = gesture.current;
          if (!g.scrubbing) {
            // Tap: find the nearest note to the touch and play it.
            const offset = Math.round(
              (e.nativeEvent.locationX - playheadX) / SPACING,
            );
            const clamped = Math.max(-BEFORE, Math.min(AFTER, offset));
            const tapped = notes.find((n) => n.offset === clamped);
            if (tapped?.note) {
              tapNoteAt(clamped);
              flashNote(tapped.digitIndex);
            }
          }
          g.accumulatedDx = 0;
          g.scrubbing = false;
        }}
      >
        {/* Staff lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[styles.staffLine, { top: STAFF_TOP + i * LINE_GAP }]}
          />
        ))}
        {/* Playhead */}
        <View style={[styles.playhead, { left: playheadX }]} />

        {/* Notes */}
        {notes.map((n) => {
          if (!n.note) {
            return null;
          }
          const x = playheadX + n.offset * SPACING;
          const y = NOTE_Y[n.note];
          const isCurrent = n.offset === 0;
          const isPressed = n.digitIndex === pressedDigitIndex;
          const isSharp = SHARPS[n.note];
          // Stems up for C–A, down for B (proper notation).
          const stemUp = n.note !== 'B';
          return (
            <View key={n.digitIndex} pointerEvents="none">
              {(n.note === 'C' || n.note === 'C#') && (
                <View
                  style={[
                    styles.ledger,
                    { left: x - 11, top: y },
                  ]}
                />
              )}
              {isSharp && (
                <Text
                  style={[
                    styles.sharp,
                    (isCurrent || isPressed) && styles.sharpCurrent,
                    { left: x - 17, top: y - 7 },
                  ]}
                >
                  ♯
                </Text>
              )}
              <View
                style={[
                  styles.head,
                  isCurrent && styles.headCurrent,
                  isPressed && styles.headPressed,
                  { left: x - HEAD_W / 2, top: y - HEAD_H / 2 },
                ]}
              />
              <View
                style={[
                  styles.stem,
                  (isCurrent || isPressed) && styles.stemCurrent,
                  stemUp
                    ? {
                        left: x + HEAD_W / 2 - STEM_W,
                        top: y - STEM_H,
                        height: STEM_H,
                      }
                    : {
                        left: x - HEAD_W / 2,
                        top: y,
                        height: STEM_H,
                      },
                ]}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.sm,
    width: '100%',
  },
  label: {
    fontSize: fontSizes.tiny,
    color: colors.muted,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  staff: {
    position: 'relative',
    height: STAFF_HEIGHT,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  staffLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#4a4a4a',
  },
  playhead: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    width: 2,
    borderRadius: 1,
    backgroundColor: colors.accent,
  },
  ledger: {
    position: 'absolute',
    width: 22,
    height: 1,
    backgroundColor: '#4a4a4a',
  },
  sharp: {
    position: 'absolute',
    color: colors.text,
    fontSize: 14,
  },
  sharpCurrent: {
    color: colors.accent,
  },
  head: {
    position: 'absolute',
    width: HEAD_W,
    height: HEAD_H,
    borderRadius: HEAD_W / 2,
    backgroundColor: colors.text,
    transform: [{ rotate: '-18deg' }],
  },
  headCurrent: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  headPressed: {
    backgroundColor: '#4dc3ff',
    transform: [{ rotate: '-18deg' }, { scale: 1.4 }],
    shadowColor: '#4dc3ff',
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
  stem: {
    position: 'absolute',
    width: STEM_W,
    backgroundColor: colors.text,
  },
  stemCurrent: {
    backgroundColor: colors.accent,
  },
});
