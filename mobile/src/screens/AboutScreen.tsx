/**
 * About screen — port of the WP7 Panorama's third item (InfoViewModel),
 * with content transcribed from Content/About/Data.xml.
 *
 * The WP7 cross-promo "other apps" control was dropped per Jeremiah's
 * product call; this screen is the static about content only.
 */

import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, fontSizes, spacing } from '../ui/theme';

const ABOUT = {
  title: 'Audible.Pi',
  author: 'Jeremiah Medina',
  description: 'Hear the sounds of Pi with various instruments',
  additionalNotes:
    'Options for both calculating pi and playing it from the embedded file.',
  version: '1.2.1.0',
};

const SECTIONS: { title: string; body: string }[] = [
  {
    title: 'History',
    body: `1.2.1.0
- Minor update to fix the app list control.

1.2.0.0
- This adds the ability to play up to nearly 1,000,000 digits of pi from the embedded file.

1.1.0.0
- Bug fixes.

1.0.0.0
- This is the initial public version.`,
  },
  {
    title: 'About Pi',
    body: `You can find information about Pi here:
- http://en.wikipedia.org/wiki/Pi/
Information about the formula used:
- http://en.wikipedia.org/wiki/John_Machin/

Playing 12 Standard Notes
In order to play the 12 standard notes (C, C#, D, D#, E, F, F#, G, G#, A, A#, B), the decimal equivalent of Pi must be converted into duodecimal or base 12. The application takes a shortcut as converting such a precise number with imprecise datatypes is difficult. Instead the application takes each grouping of 5 digits as they are calculated and converts those to base 12. What gets played are these "pseudo"-base 12 digits.`,
  },
  {
    title: 'Tips',
    body: `How it works
- The big note shows the note for the current digit of pi; the strip below it plays the two notes before and after, and supports multi-touch chords.
- Drag the position slider (or tap it) to jump to any digit.
- Press play and the notes play continuously until the end, unless Loop Sound is on.
- The previous/next buttons step by the skip amount.
- Tap the instrument name in the header to cycle through instruments.

Use The Settings Menu
The settings menu is your friend; you can customize much of the app there
- Instrument: pick the sound you want to hear.
- Previous/Next Skip: when stepping manually or auto-playing, this many digits will be skipped.
- Tempo: in milliseconds, the time between each sound — try 125ms for furious mode!
- Number of Pi Digits: how many digits to calculate (calculated mode only; precomputed mode always uses the full 1,000,000 from the embedded file).
- Loop Sound: when on, digits play continually, looping at the end.
- Precomputed Digits: switch between the embedded 1,000,000-digit file and the Machin-formula calculator.`,
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
