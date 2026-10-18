/**
 * About screen — app information, player guide, and tips.
 */

import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, fontSizes, spacing } from '../ui/theme';

const ABOUT = {
  title: 'AudiblePi',
  author: 'Jeremiah Medina',
  description: 'Hear the digits of pi as music — each digit becomes a note.',
  additionalNotes:
    'Digits play from the embedded 1,000,000-digit file, or calculate them live with the Machin formula.',
  version: '2.0.0',
};

const SECTIONS: { title: string; body: string }[] = [
  {
    title: 'The Player',
    body: `The main screen, top to bottom:

Header — your position in pi ("19 of 955,187"), the BASE 12 badge, and the current instrument. Tap the instrument to cycle through sounds.

Digit — the big base-12 digit at the current position, with the note it plays (e.g. "A → A#"). Digits run 0–9, A, B.

Note strip — the five notes around the current one. Tap any key to hear it without moving; press several at once for chords. The number under each key is the familiar base-10 pi digit at that position.

Scrubber — drag to jump anywhere in pi. The pill above the knob shows the exact digit number.

Up Next — the coming digits as periodic-table cards: base-12 digit on top, note below. The current one is highlighted.

Transport — step backward/forward by the skip amount, or play/pause.

Score — a live sheet-music staff. Notes sit at their true pitch and scroll past the playhead as they play. Tap any note to hear it, or swipe horizontally to scrub through the digits, hearing each one.`,
  },
  {
    title: 'About Pi',
    body: `You can find information about Pi here:
- http://en.wikipedia.org/wiki/Pi/
Information about the formula used:
- http://en.wikipedia.org/wiki/John_Machin/

Playing 12 notes
To play the 12 notes of the chromatic scale (C, C#, D, D#, E, F, F#, G, G#, A, A#, B), pi is used in base 12 (duodecimal), where the digits are 0–9, A, B. Each digit maps directly to a note: 0 = C, 1 = C#, and so on up to B = B. The base-10 digit shown under each strip key is the same position in pi's familiar decimal expansion.`,
  },
  {
    title: 'Tips',
    body: `How it works
- Press play and the notes play continuously until the end, unless Loop is on.
- The previous/next buttons step by the skip amount without replaying intermediate notes.
- Drag the scrubber (or swipe the staff) to jump to any digit.
- Tap the instrument icon in the header to cycle through instruments.

Settings
- Instrument: pick the sound you want to hear.
- Skip: how many digits the previous/next buttons jump.
- Tempo: milliseconds between notes — try 125ms for furious mode!
- Digits: how many digits to calculate (calculated mode only; precomputed mode uses the full embedded file).
- Loop: when on, playback restarts at the beginning instead of stopping.
- Precomputed: switch between the embedded digit file and the live Machin-formula calculator. Turning it off starts calculating in the background — sound begins as soon as the first digits are ready.`,
  },
];

export function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text testID="about-title" style={styles.title}>
        {ABOUT.title}
      </Text>
      <Text style={styles.byline}>by {ABOUT.author}</Text>

      <Text style={styles.label}>Description:</Text>
      <Text style={styles.body}>{ABOUT.description}</Text>

      <Text style={styles.label}>Additional Notes:</Text>
      <Text style={styles.body}>{ABOUT.additionalNotes}</Text>

      <Text style={styles.label}>Version:</Text>
      <Text style={styles.body}>{ABOUT.version}</Text>

      {SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.body}>{section.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  title: {
    color: colors.accent,
    fontSize: fontSizes.hero,
    fontWeight: '200',
  },
  byline: {
    color: colors.muted,
    fontSize: fontSizes.body,
    marginBottom: spacing.md,
  },
  label: {
    color: colors.accent,
    fontSize: fontSizes.small,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  body: {
    color: colors.text,
    fontSize: fontSizes.body,
    lineHeight: 24,
  },
  section: {
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  sectionTitle: {
    color: colors.accent,
    fontSize: fontSizes.title,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
});
