/**
 * Static Metro asset manifest for the 60 instrument WAVs.
 * Generated — Metro cannot resolve dynamic require() calls, so every
 * asset needs a literal require. Keyed by instrument directory, then note.
 *
 * Filenames use the sanitized form from notes.fileNameForNote
 * (a#.wav -> a-sharp.wav).
 */

import type { NoteName } from '../lib/notes';

export const INSTRUMENT_ASSETS: Record<string, Record<NoteName, number>> = {
  Glockenspiel: {
    'C': require('../../assets/audio/Glockenspiel/c.wav'),
    'C#': require('../../assets/audio/Glockenspiel/c-sharp.wav'),
    'D': require('../../assets/audio/Glockenspiel/d.wav'),
    'D#': require('../../assets/audio/Glockenspiel/d-sharp.wav'),
    'E': require('../../assets/audio/Glockenspiel/e.wav'),
    'F': require('../../assets/audio/Glockenspiel/f.wav'),
    'F#': require('../../assets/audio/Glockenspiel/f-sharp.wav'),
    'G': require('../../assets/audio/Glockenspiel/g.wav'),
    'G#': require('../../assets/audio/Glockenspiel/g-sharp.wav'),
    'A': require('../../assets/audio/Glockenspiel/a.wav'),
    'A#': require('../../assets/audio/Glockenspiel/a-sharp.wav'),
    'B': require('../../assets/audio/Glockenspiel/b.wav'),
  },
  Guitar: {
    'C': require('../../assets/audio/Guitar/c.wav'),
    'C#': require('../../assets/audio/Guitar/c-sharp.wav'),
    'D': require('../../assets/audio/Guitar/d.wav'),
    'D#': require('../../assets/audio/Guitar/d-sharp.wav'),
    'E': require('../../assets/audio/Guitar/e.wav'),
    'F': require('../../assets/audio/Guitar/f.wav'),
    'F#': require('../../assets/audio/Guitar/f-sharp.wav'),
    'G': require('../../assets/audio/Guitar/g.wav'),
    'G#': require('../../assets/audio/Guitar/g-sharp.wav'),
    'A': require('../../assets/audio/Guitar/a.wav'),
    'A#': require('../../assets/audio/Guitar/a-sharp.wav'),
    'B': require('../../assets/audio/Guitar/b.wav'),
  },
  Piano: {
    'C': require('../../assets/audio/Piano/c.wav'),
    'C#': require('../../assets/audio/Piano/c-sharp.wav'),
    'D': require('../../assets/audio/Piano/d.wav'),
    'D#': require('../../assets/audio/Piano/d-sharp.wav'),
    'E': require('../../assets/audio/Piano/e.wav'),
    'F': require('../../assets/audio/Piano/f.wav'),
    'F#': require('../../assets/audio/Piano/f-sharp.wav'),
    'G': require('../../assets/audio/Piano/g.wav'),
    'G#': require('../../assets/audio/Piano/g-sharp.wav'),
    'A': require('../../assets/audio/Piano/a.wav'),
    'A#': require('../../assets/audio/Piano/a-sharp.wav'),
    'B': require('../../assets/audio/Piano/b.wav'),
  },
  Sax: {
    'C': require('../../assets/audio/Sax/c.wav'),
    'C#': require('../../assets/audio/Sax/c-sharp.wav'),
    'D': require('../../assets/audio/Sax/d.wav'),
    'D#': require('../../assets/audio/Sax/d-sharp.wav'),
    'E': require('../../assets/audio/Sax/e.wav'),
    'F': require('../../assets/audio/Sax/f.wav'),
    'F#': require('../../assets/audio/Sax/f-sharp.wav'),
    'G': require('../../assets/audio/Sax/g.wav'),
    'G#': require('../../assets/audio/Sax/g-sharp.wav'),
    'A': require('../../assets/audio/Sax/a.wav'),
    'A#': require('../../assets/audio/Sax/a-sharp.wav'),
    'B': require('../../assets/audio/Sax/b.wav'),
  },
  Violin: {
    'C': require('../../assets/audio/Violin/c.wav'),
    'C#': require('../../assets/audio/Violin/c-sharp.wav'),
    'D': require('../../assets/audio/Violin/d.wav'),
    'D#': require('../../assets/audio/Violin/d-sharp.wav'),
    'E': require('../../assets/audio/Violin/e.wav'),
    'F': require('../../assets/audio/Violin/f.wav'),
    'F#': require('../../assets/audio/Violin/f-sharp.wav'),
    'G': require('../../assets/audio/Violin/g.wav'),
    'G#': require('../../assets/audio/Violin/g-sharp.wav'),
    'A': require('../../assets/audio/Violin/a.wav'),
    'A#': require('../../assets/audio/Violin/a-sharp.wav'),
    'B': require('../../assets/audio/Violin/b.wav'),
  },
};
