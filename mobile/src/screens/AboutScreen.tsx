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
  description: 'Hear the digits of pi as music.',
  additionalNotes:
    'Plays from the embedded 1,000,000-digit file, or calculates digits live with the Machin formula.',
  version: '2.0.0',
};

const SECTIONS: { title: string; body: string }[] = [
  {
    title: 'The Player',
    body: `The header shows where you are ("19 of 955,187"), the BASE 12 badge, and the current instrument. Tap the instrument to switch sounds.

The big digit is the base-12 digit at the current position, with the note it plays. Digits go 0-9, A, B.

The strip has the five notes around the current one. Tap a key to hear that note. Tap more than one at a time to play chords. The small number under each key is the base-10 pi digit at that spot.

Drag the scrubber to jump to any digit. The number above the knob is the exact position.

Up Next shows the coming digits. Each card has the base-12 digit and its note. The current digit is highlighted.

The transport buttons step forward or back by the skip amount, or play/pause.

The score is a sheet music staff that scrolls as the music plays. Tap a note to hear it. Swipe left or right to move through the digits.`,
  },
  {
    title: 'About Pi',
    body: `You can find information about Pi here:
- http://en.wikipedia.org/wiki/Pi/
Information about the formula used:
- http://en.wikipedia.org/wiki/John_Machin/

Pi in base 12 uses digits 0-9, A, B. Each one maps to a note. 0 is C, 1 is C#, up through B which is B. The small numbers under the strip keys are the base-10 digits of pi at those positions.`,
  },
  {
    title: 'Tips',
    body: `Press play to start. It plays to the end unless Loop is on.

The skip buttons jump forward or back by the skip amount.

Drag the scrubber or swipe the staff to jump around.

Tap the instrument icon to change sounds.

Settings:
Instrument: the sound that plays.
Skip: how far the skip buttons jump.
Tempo: time between notes in milliseconds. 125 is fast.
Digits: how many digits to calculate. Only used in calculated mode.
Loop: restart at the beginning instead of stopping.
Precomputed: use the embedded file or calculate live. Turning it off starts the calculator in the background. You will hear sound as soon as digits are ready.`,
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
