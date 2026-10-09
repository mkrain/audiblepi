/**
 * Pi digit iterators.
 * Ported from Src/Audible.Interfaces/Provider/ComputedPi.cs (ComputedPi),
 * Src/Audible.Provider/PiStreamIterator.cs (PiStreamIterator) and
 * Src/Audible.Provider/PiStreamCalculator.cs (PiStreamCalculator).
 */

/**
 * In-memory digit sequence with a movable cursor — port of ComputedPi.
 *
 * DEVIATION from the C# original (deliberate): the C# constructor filtered
 * characters with char.IsDigit, which would silently drop the 'A'/'B' digits of
 * base-12 output — contradicting the original's own PiCalculatorFixture, whose
 * expected base-12 string contains A/B. This port preserves every character.
 */
export class PiDigitSequence {
  private readonly digits: string[];
  private index = 0;

  constructor(digits: string | readonly string[]) {
    this.digits = typeof digits === 'string' ? digits.split('') : [...digits];
    if (this.digits.length === 0) {
      throw new Error('pi digits must not be empty');
    }
  }

  get length(): number {
    return this.digits.length;
  }

  get current(): string {
    return this.digits[this.index] ?? '';
  }

  get previous(): string {
    return this.index > 0 ? this.digits[this.index - 1] : '';
  }

  get next(): string {
    return this.index < this.digits.length - 1 ? this.digits[this.index + 1] : '';
  }

  moveNext(): boolean {
    if (this.index < this.digits.length - 1) {
      this.index++;
      return true;
    }
    return false;
  }

  movePrevious(): boolean {
    if (this.index > 0) {
      this.index--;
      return true;
    }
    return false;
  }

  reset(): void {
    this.index = 0;
  }

  /** Absolute 0-based seek, clamped to [0, length-1]. */
  seek(index: number): number {
    if (index < 0) this.index = 0;
    else if (index > this.digits.length - 1) this.index = this.digits.length - 1;
    else this.index = Math.floor(index);
    return this.index;
  }

  digitAt(index: number): string {
    if (index < 0 || index >= this.digits.length) {
      throw new RangeError(`digit index ${index} out of range [0, ${this.digits.length})`);
    }
    return this.digits[index];
  }

  toString(): string {
    return this.digits.join('');
  }
}

/**
 * Random-access reader over a precomputed digit buffer — port of PiStreamIterator.
 * In the WP7 app this seeked into an embedded resource stream; here it wraps a
 * plain string (loaded from the bundled asset file), which keeps byte-level
 * random access without any stream machinery.
 *
 * DEVIATION from the C# original (deliberate): the C# Seek() had an edge-case
 * bug — at the last index it re-read from position 0, yielding the *first* two
 * digits as previous/current. This port returns the actually-intended last two
 * digits instead.
 */
export class PiDigitReader {
  private readonly digits: string;
  private index = 0;
  private _previous = '';
  private _current = '';
  private _next = '';

  constructor(digits: string) {
    if (!digits) {
      throw new Error('digits must not be empty');
    }
    this.digits = digits;
    this.seek(0);
  }

  get length(): number {
    return this.digits.length;
  }

  get current(): string {
    return this._current;
  }

  get previous(): string {
    return this._previous;
  }

  get next(): string {
    return this._next;
  }

  moveNext(): boolean {
    if (this.index >= this.digits.length - 1) {
      return false;
    }
    // Refresh the previous/current/next window via seek — the WP7
    // PiStreamIterator re-read its window on every move as well.
    this.seek(this.index + 1);
    return true;
  }

  movePrevious(): boolean {
    if (this.index <= 0) {
      return false;
    }
    this.seek(this.index - 1);
    return true;
  }

  reset(): void {
    this.seek(0);
  }

  /** Absolute 0-based seek; refreshes the previous/current/next window. */
  seek(index: number): number {
    let offset = Math.floor(index);
    if (offset > this.digits.length - 1) offset = this.digits.length - 1;
    if (offset < 0) offset = 0;
    this.index = offset;

    if (offset === 0) {
      this._previous = '';
      this._current = this.digits[0] ?? '';
      this._next = this.digits[1] ?? '';
    } else if (offset === this.digits.length - 1) {
      this._previous = this.digits[offset - 1] ?? '';
      this._current = this.digits[offset] ?? '';
      this._next = '';
    } else {
      this._previous = this.digits[offset - 1] ?? '';
      this._current = this.digits[offset] ?? '';
      this._next = this.digits[offset + 1] ?? '';
    }

    return this.index;
  }

  /** Byte-level read mirroring PiStreamIterator.ReadBytes (digits are ASCII). */
  readBytes(buffer: Uint8Array, offset: number, count: number): number {
    if (offset < 0) throw new Error('offset is less than 0');
    if (offset > this.digits.length) throw new Error('offset is greater than the actual size');
    const n = Math.min(count, this.digits.length - offset);
    for (let i = 0; i < n; i++) {
      buffer[i] = this.digits.charCodeAt(offset + i);
    }
    return n;
  }
}

/**
 * Precomputed-digit pi source — port of PiStreamCalculator. Never "calculates";
 * it just resets the reader, exactly like the original.
 */
export class PrecomputedPiService {
  private readonly reader: PiDigitReader;

  constructor(reader: PiDigitReader) {
    this.reader = reader;
  }

  get supportedDigits(): readonly number[] {
    return [this.reader.length];
  }

  get isCalculating(): boolean {
    return false;
  }

  /** Resets to the first digit and hands back the reader (mirrors CalculatePi*). */
  calculate(): PiDigitReader {
    this.reader.reset();
    return this.reader;
  }

  cancel(): PiDigitReader {
    return this.calculate();
  }
}
