// Parity tests ported from Src/Audible.Tests/*.cs (NUnit -> Jest).
import {
  PiDigitReader,
  PiDigitSequence,
  PrecomputedPiService,
} from '../pi-digits';

describe('PiDigitSequence (port of ComputedPi)', () => {
  test('cursor navigation', () => {
    const seq = new PiDigitSequence('314159');
    expect(seq.current).toBe('3');
    expect(seq.previous).toBe('');
    expect(seq.next).toBe('1');
    expect(seq.moveNext()).toBe(true);
    expect(seq.current).toBe('1');
    expect(seq.previous).toBe('3');
    seq.seek(5);
    expect(seq.current).toBe('9');
    expect(seq.next).toBe('');
    expect(seq.moveNext()).toBe(false);
    expect(seq.movePrevious()).toBe(true);
    expect(seq.current).toBe('5');
    seq.reset();
    expect(seq.current).toBe('3');
  });

  test('seek clamps to bounds', () => {
    const seq = new PiDigitSequence('314159');
    expect(seq.seek(-5)).toBe(0);
    expect(seq.seek(999)).toBe(5);
  });

  test('digitAt throws out of range', () => {
    const seq = new PiDigitSequence('314159');
    expect(seq.digitAt(0)).toBe('3');
    expect(() => seq.digitAt(6)).toThrow(RangeError);
    expect(() => seq.digitAt(-1)).toThrow(RangeError);
  });

  test('empty digits throw', () => {
    expect(() => new PiDigitSequence('')).toThrow();
  });

  test('preserves base-12 A/B characters (fixture parity)', () => {
    const seq = new PiDigitSequence('3A82B1');
    expect(seq.toString()).toBe('3A82B1');
    expect(seq.length).toBe(6);
  });
});

describe('PiDigitReader (port of PiStreamIterator)', () => {
  test('seek refreshes the previous/current/next window', () => {
    const reader = new PiDigitReader('31415926');
    expect(reader.current).toBe('3');
    expect(reader.previous).toBe('');
    expect(reader.next).toBe('1');
    reader.seek(3);
    expect(reader.previous).toBe('4');
    expect(reader.current).toBe('1');
    expect(reader.next).toBe('5');
  });

  test('last index has empty next', () => {
    const reader = new PiDigitReader('31415926');
    reader.seek(7);
    expect(reader.previous).toBe('2');
    expect(reader.current).toBe('6');
    expect(reader.next).toBe('');
  });

  test('moveNext/movePrevious refresh the prev/current/next window', () => {
    const reader = new PiDigitReader('31415926');
    expect(reader.current).toBe('3');

    expect(reader.moveNext()).toBe(true);
    expect(reader.previous).toBe('3');
    expect(reader.current).toBe('1');
    expect(reader.next).toBe('4');

    expect(reader.movePrevious()).toBe(true);
    expect(reader.previous).toBe('');
    expect(reader.current).toBe('3');
    expect(reader.next).toBe('1');
  });

  test('moveNext/movePrevious clamp at the ends', () => {
    const reader = new PiDigitReader('314');
    expect(reader.movePrevious()).toBe(false);
    expect(reader.moveNext()).toBe(true);
    expect(reader.moveNext()).toBe(true);
    expect(reader.moveNext()).toBe(false);
  });

  test('length matches the buffer', () => {
    expect(new PiDigitReader('31415926').length).toBe(8);
  });

  test('empty digits throw', () => {
    expect(() => new PiDigitReader('')).toThrow();
  });
});

describe('PrecomputedPiService (port of PiStreamCalculator)', () => {
  test('calculate resets and returns the reader', () => {
    const service = new PrecomputedPiService(new PiDigitReader('31415926'));
    const reader = service.calculate();
    expect(reader.current).toBe('3');
    expect(service.isCalculating).toBe(false);
    expect(service.supportedDigits).toEqual([8]);
  });
});
