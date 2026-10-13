// Parity tests ported from Src/Audible.Tests/*.cs (NUnit -> Jest).
import {
  INSTRUMENTS,
  fileNameForNote,
  noteForDigit,
  noteNameForDigit,
} from '../notes';

describe('digit to note mapping (port of NoteModel.GetNoteFromName)', () => {
  test.each([
    ['0', 'C'],
    ['1', 'C#'],
    ['2', 'D'],
    ['3', 'D#'],
    ['4', 'E'],
    ['5', 'F'],
    ['6', 'F#'],
    ['7', 'G'],
    ['8', 'G#'],
    ['9', 'A'],
    ['A', 'A#'],
    ['B', 'B'],
  ] as const)('digit %s maps to %s', (digit, expected) => {
    expect(noteNameForDigit(digit)).toBe(expected);
  });

  test('invalid digit throws', () => {
    expect(() => noteNameForDigit('C')).toThrow();
    expect(() => noteNameForDigit('')).toThrow();
  });
});

describe('note file names (# sanitization)', () => {
  test('sharp notes use -sharp instead of #', () => {
    expect(fileNameForNote('A#')).toBe('a-sharp.wav');
    expect(fileNameForNote('C#')).toBe('c-sharp.wav');
    expect(fileNameForNote('C')).toBe('c.wav');
  });

  test('noteForDigit builds the asset uri', () => {
    const piano = INSTRUMENTS.find((i) => i.name === 'Piano')!;
    const note = noteForDigit('0', piano);
    expect(note).toEqual({ id: '0', name: 'C', uri: 'assets/audio/Piano/c.wav' });
    const sharp = noteForDigit('A', piano);
    expect(sharp).toEqual({ id: '10', name: 'A#', uri: 'assets/audio/Piano/a-sharp.wav' });
  });
});

describe('instruments (port of NoteProvider static list)', () => {
  test('five instruments in WP7 order', () => {
    expect(INSTRUMENTS.map((i) => i.name)).toEqual([
      'Glockenspiel',
      'Guitar',
      'Piano',
      'Sax',
      'Violin',
    ]);
  });
});
