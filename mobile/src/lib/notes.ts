/**
 * Digit -> musical-note mapping.
 * Ported from Src/Audible.Model/NoteModel.cs (GetNoteFromName) and
 * Src/Audible.Provider/NoteProvider.cs (instrument list, note URIs).
 *
 * Jeremiah's product call: ship base-12 only — the mapping below covers the 12
 * base-12 digits (0-9, A, B) mapped 1:1 onto the chromatic scale. No base-10
 * toggle is provided.
 */

/** Chromatic note names in semitone order starting at C. */
export const NOTE_NAMES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const;

export type NoteName = (typeof NOTE_NAMES)[number];

export interface Instrument {
  /** Stable id matching the WP7 provider's NoteType.Id ordering. */
  id: number;
  name: string;
  /** Directory under assets/audio holding this instrument's WAVs. */
  directory: string;
  /** Asset-relative icon path. */
  icon: string;
}

export const INSTRUMENTS: readonly Instrument[] = [
  { id: 0, name: 'Glockenspiel', directory: 'Glockenspiel', icon: 'assets/images/Xylophone.Icon.png' },
  { id: 1, name: 'Guitar', directory: 'Guitar', icon: 'assets/images/Classical.Guitar.Icon.png' },
  { id: 2, name: 'Piano', directory: 'Piano', icon: 'assets/images/Piano.Icon.png' },
  { id: 3, name: 'Sax', directory: 'Sax', icon: 'assets/images/Sax.Icon.png' },
  { id: 4, name: 'Violin', directory: 'Violin', icon: 'assets/images/Violin.Icon.png' },
];

export interface Note {
  /** Semitone index as a string ("0".."11"), matching the WP7 provider's Id. */
  id: string;
  name: NoteName;
  /** Asset-relative URI, e.g. "assets/audio/Piano/a-sharp.wav". */
  uri: string;
}

/** Base-12 digit -> chromatic note, exactly as NoteModel.GetNoteFromName. */
const DIGIT_TO_NOTE: Record<string, NoteName> = {
  '0': 'C',
  '1': 'C#',
  '2': 'D',
  '3': 'D#',
  '4': 'E',
  '5': 'F',
  '6': 'F#',
  '7': 'G',
  '8': 'G#',
  '9': 'A',
  A: 'A#',
  B: 'B',
};

export function noteNameForDigit(digit: string): NoteName {
  const name = DIGIT_TO_NOTE[digit];
  if (name === undefined) {
    throw new Error(`Invalid digit for note mapping: ${digit}`);
  }
  return name;
}

/**
 * Sanitized WAV file name for a note. The WP7 assets used names like `a#.wav`;
 * `#` is replaced with `-sharp` to avoid bundler/URL-encoding headaches.
 */
export function fileNameForNote(name: NoteName): string {
  return `${name.toLowerCase().replace('#', '-sharp')}.wav`;
}

export function noteForDigit(digit: string, instrument: Instrument): Note {
  const name = noteNameForDigit(digit);
  const id = NOTE_NAMES.indexOf(name);
  return {
    id: String(id),
    name,
    uri: `assets/audio/${instrument.directory}/${fileNameForNote(name)}`,
  };
}
