/**
 * Arbitrary-precision fixed-point number backing the Machin-formula pi calculator.
 * Ported from Src/Audible.Provider/BigNumber.cs (Windows Phone 7).
 *
 * Representation: little-endian array of uint32 limbs; limbs[0] is the integer
 * part, the remaining limbs are the fractional part in base 2^32.
 *
 * NOTE: the C# original exposed mutating operator overloads (`a -= b`, `a /= n`);
 * those become the explicit `subtractInPlace` / `divideByUintInPlace` methods here.
 */

export interface BigNumberEvents {
  /** Fired as each 5-digit group is extracted in getPiDigits()/getPiDigitsBase12(). */
  onDigitCalculated?: (digitIndex: number) => void;
  /** Fired per arctan series term; label is e.g. "16/5". */
  onArcTanDivisorCalculated?: (info: { label: string; divisor: number }) => void;
}

const LIMB_BASE = 0x100000000; // 2^32
const LIMB_MASK_BIGINT = 0xffffffffn;

/** Yield to the event loop so progress UI stays alive during long calculations. */
export function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/** uint32 -> base-12 string. Port of IntegerExtensions.ToBase12. */
export function toBase12(value: number): string {
  const chars = '0123456789AB';
  let n = value >>> 0;
  let out = '';
  do {
    out = chars[n % 12] + out;
    n = Math.floor(n / 12);
  } while (n > 0);
  return out;
}

export class BigNumber {
  private limbs: number[] = [];
  private size = 0;
  private maxDigits = 0;
  private cancelRequested = false;
  private readonly events: BigNumberEvents;

  constructor(maxDigits: number, intPart = 0, events: BigNumberEvents = {}) {
    this.events = events;
    this.setMaxDigits(maxDigits);
    this.limbs[0] = intPart >>> 0;
  }

  get Size(): number {
    return this.size;
  }

  /**
   * Live limb array (little-endian uint32s). Exposed deliberately, mirroring the
   * C# `Number` property — callers such as getPiDigits() write limbs[0] directly.
   */
  get number(): number[] {
    return this.limbs;
  }

  /**
   * Re-initializes this number for a new digit count.
   * @param maxDigits Number of pi digits after the leading 3.
   */
  setMaxDigits(maxDigits: number): void {
    this.maxDigits = maxDigits;
    this.size = Math.ceil(maxDigits * 0.104) + 2;
    this.limbs = new Array<number>(this.size).fill(0);
  }

  assign(value: BigNumber): void {
    this.verifySameSize(value);
    for (let i = 0; i < this.size; i++) {
      this.limbs[i] = value.limbs[i];
    }
  }

  isZero(): boolean {
    return this.limbs.every((limb) => limb === 0);
  }

  verifySameSize(value: BigNumber): void {
    if (value.size !== this.size) {
      throw new Error('BigNumbers must have the same size');
    }
  }

  cancel(): void {
    this.cancelRequested = true;
  }

  /**
   * Maclaurin series for arctan: this = multiplicand * arctan(1/reciprocal).
   * Async variant — yields to the event loop every `yieldEvery` terms so the
   * caller stays responsive and cancel() takes effect promptly.
   */
  async arcTanAsync(
    multiplicand: number,
    reciprocal: number,
    yieldEvery = 256,
  ): Promise<void> {
    this.cancelRequested = false;
    const label = `${multiplicand}/${reciprocal}`;

    const x = new BigNumber(this.maxDigits, multiplicand);
    x.divideByUintInPlace(reciprocal);
    reciprocal = reciprocal * reciprocal;

    this.assign(x);

    const term = new BigNumber(this.maxDigits);
    let divisor = 1;
    let subtractTerm = true;
    let iterations = 0;

    while (!this.cancelRequested) {
      x.divideByUintInPlace(reciprocal);

      term.assign(x);

      divisor += 2;
      this.events.onArcTanDivisorCalculated?.({ label, divisor });

      term.divideByUintInPlace(divisor);

      if (term.isZero()) break;

      if (subtractTerm) this.subtract(term);
      else this.add(term);

      subtractTerm = !subtractTerm;

      iterations++;
      if (iterations % yieldEvery === 0) {
        await yieldToEventLoop();
      }
    }
  }

  /** Synchronous variant — exact port of the C# ArcTan loop (no yielding). */
  arcTan(multiplicand: number, reciprocal: number): void {
    this.cancelRequested = false;
    const label = `${multiplicand}/${reciprocal}`;

    const x = new BigNumber(this.maxDigits, multiplicand);
    x.divideByUintInPlace(reciprocal);
    reciprocal = reciprocal * reciprocal;

    this.assign(x);

    const term = new BigNumber(this.maxDigits);
    let divisor = 1;
    let subtractTerm = true;

    while (!this.cancelRequested) {
      x.divideByUintInPlace(reciprocal);

      term.assign(x);

      divisor += 2;
      this.events.onArcTanDivisorCalculated?.({ label, divisor });

      term.divideByUintInPlace(divisor);

      if (term.isZero()) break;

      if (subtractTerm) this.subtract(term);
      else this.add(term);

      subtractTerm = !subtractTerm;
    }
  }

  /** Port of C# `operator -` (mutates and returns this). */
  subtractInPlace(rhs: BigNumber): this {
    this.subtract(rhs);
    return this;
  }

  /** Port of C# `operator /` (mutates and returns this). */
  divideByUintInPlace(rhs: number): this {
    this.divide(rhs);
    return this;
  }

  /**
   * Extracts the computed value as a decimal digit string, leading "3" included.
   * Port of GetPiDigits().
   */
  getPiDigits(): string {
    const temp = new BigNumber(this.maxDigits);
    temp.assign(this);

    let digits = '3';
    let digitCount = 0;

    while (digitCount < this.maxDigits) {
      this.events.onDigitCalculated?.(digitCount);

      temp.number[0] = 0;
      temp.multiply(100000);

      const piString = temp.number[0].toString().padStart(5, '0');
      digits += piString.substring(0, Math.min(Math.min(5, this.maxDigits), piString.length));

      digitCount += 5;
    }

    return digits;
  }

  /**
   * Extracts the computed value as a base-12 digit string, leading "3" included.
   * Port of GetPiDigitsBase12(). Note the original's quirk is preserved: each
   * 5-decimal-digit group is converted to base-12 *without* zero-padding, so the
   * result is shorter than the decimal form (958 chars for 1000 rounds).
   */
  getPiDigitsBase12(): string {
    const temp = new BigNumber(this.maxDigits);
    temp.assign(this);

    let digits = '3';
    let digitCount = 0;

    while (digitCount < this.maxDigits) {
      this.events.onDigitCalculated?.(digitCount);

      temp.number[0] = 0;
      temp.multiply(100000);

      const piString = toBase12(temp.number[0]);
      digits += piString.substring(0, Math.min(Math.min(5, this.maxDigits), piString.length));

      digitCount += 5;
    }

    return digits;
  }

  private add(value: BigNumber): void {
    this.verifySameSize(value);

    let index = this.size - 1;
    while (index >= 0 && value.limbs[index] === 0) index--;

    let carry = 0;
    while (index >= 0) {
      const result = this.limbs[index] + value.limbs[index] + carry;
      this.limbs[index] = result % LIMB_BASE;
      carry = result >= LIMB_BASE ? 1 : 0;
      index--;
    }
  }

  private subtract(value: BigNumber): void {
    this.verifySameSize(value);

    let index = this.size - 1;
    while (index >= 0 && value.limbs[index] === 0) index--;

    let borrow = 0;
    while (index >= 0) {
      const result = LIMB_BASE + this.limbs[index] - value.limbs[index] - borrow;
      this.limbs[index] = result % LIMB_BASE;
      borrow = result >= LIMB_BASE ? 0 : 1;
      index--;
    }
  }

  private multiply(value: number): void {
    let index = this.size - 1;
    while (index >= 0 && this.limbs[index] === 0) index--;

    let carry = 0;
    while (index >= 0) {
      const result = BigInt(this.limbs[index]) * BigInt(value) + BigInt(carry);
      this.limbs[index] = Number(result & LIMB_MASK_BIGINT);
      carry = Number(result >> 32n);
      index--;
    }
  }

  private divide(value: number): void {
    let index = 0;
    while (index < this.size && this.limbs[index] === 0) index++;

    let carry = 0;
    while (index < this.size) {
      const result = BigInt(this.limbs[index]) + (BigInt(carry) << 32n);
      this.limbs[index] = Number(result / BigInt(value));
      carry = Number(result % BigInt(value));
      index++;
    }
  }
}
