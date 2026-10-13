/**
 * About screen — port of the WP7 Panorama's third item (InfoViewModel),
 * with content transcribed from Content/About/Data.xml.
 *
 * The WP7 cross-promo "other apps" control was dropped per Jeremiah's
 * product call; this screen is the static about content only.
 */

import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  links: [
    { label: 'My blog:', content: 'Tech Space', url: 'http://jeremiahmedina.blogspot.com/' },
    {
      label: 'Email:',
      content: 'mkrain@hotmail.com',
      url: 'mailto:mkrain@hotmail.com?subject=audiblepi',
    },
  ],
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
Playing the calculated pi value
- Simply click one of the three visible notes and the sound will play.
- If you want the notes to play continuously press the play button; the notes will play until you reach the end, unless you have 'loop sound' selected.
- Press the previous arrow to return to the previous note, based on the skip amount.
- Similarly press the next arrow to advance the notes by the skip amount.
- You can play notes at the same time they are being auto played.
- Click on the instrument icon on the main menu to cycle through them.

Use The Settings Menu
The settings menu is your friend; you can customize much of the app there
- Instrument: Let the fun begin, violin is awesome but use the one you want.
- Prev/Next Skip: When using auto or manual advance this many digits will be skipped.
- Tempo: In milliseconds, time between each sound, try 125ms for furious mode!
- # Pi Digits: number of digits to calculate, more digits means more time.
- Loop Sound: When on, digits are continually played, looping at the end.
- Precomputed Digits: This will switch from calculated digits to precomputed digits.`,
  },
];

function openLink(url: string): void {
  void Linking.openURL(url).catch(() => undefined);
}

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

      {ABOUT.links.map((link) => (
        <View key={link.url} style={styles.linkRow}>
          <Text style={styles.label}>{link.label} </Text>
          <TouchableOpacity onPress={() => openLink(link.url)} testID={`about-link-${link.content}`}>
            <Text style={styles.link}>{link.content}</Text>
          </TouchableOpacity>
        </View>
      ))}

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
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  link: {
    color: colors.accent,
    fontSize: fontSizes.body,
    textDecorationLine: 'underline',
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
