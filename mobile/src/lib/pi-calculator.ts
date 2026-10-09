/**
 * Machin-formula pi calculator.
 * Ported from Src/Audible.Provider/PiCalculator.cs (Windows Phone 7).
 *
 * Computes pi/4 = 4*arctan(1/5) - arctan(1/239) on the BigNumber fixed-point
 * type, then extracts the digit string. The C# original ran on the ThreadPool;
 * this port is async and yields to the event loop inside the arctan series so
 * progress callbacks fire and cancel() takes effect promptly. It is designed
 * to move into a worker thread later without API changes.
 */

import { BigNumber, BigNumberEvents } from './big-number';
import { PiDigitSequence } from './pi-digits';

export type PiConversionOption = 'decimal' | 'base12';

export interface PiCalculationEvents {
  /** Fired as each 5-digit group is extracted (digitIndex counts from 0). */
  onDigitCalculated?: (digitIndex: number) => void;
  /** Fired per arctan series term; label is e.g. "16/5". */
  onArcTanDivisorCalculated?: (info: { label: string; divisor: number }) => void;
}

/** Digit-count options the calculator supports — mirrors PiCalculator.SupportedDigits. */
export const SUPPORTED_DIGIT_COUNTS: readonly number[] = [1000, 10000, 50000];

/**
 * Fallback digit strings, matching StringKey.Constants.Pi / PiBase12 from the
 * WP7 source ("3.14159" / "3.823B1", punctuation stripped like ComputedPi did).
 */
export const DEFAULT_PI_DECIMAL_DIGITS = '314159';
export const DEFAULT_PI_BASE12_DIGITS = '3823B1';

export class PiCalculator {
  private left: BigNumber | null = null;
  private right: BigNumber | null = null;
  private readonly bridge: BigNumberEvents = {};
  private cancelRequested = false;
  private calculating = false;
  private lastResult: PiDigitSequence | null = null;

  get isCalculating(): boolean {
    return this.calculating;
  }

  get supportedDigits(): readonly number[] {
    return SUPPORTED_DIGIT_COUNTS;
  }

  /**
   * Calculates pi to `rounds` digits. Resolves with the digit sequence; if the
   * calculation was canceled, resolves with the previous result (or the short
   * default constant when nothing was ever computed) — mirroring the C# behavior
   * of keeping _computedPi ?? default.
   */
  async calculatePi(
    option: PiConversionOption,
    rounds: number,
    events: PiCalculationEvents = {},
  ): Promise<PiDigitSequence> {
    this.bridge.onDigitCalculated = events.onDigitCalculated;
    this.bridge.onArcTanDivisorCalculated = events.onArcTanDivisorCalculated;

    if (this.left === null || this.right === null) {
      this.left = new BigNumber(rounds, 0, this.bridge);
      this.right = new BigNumber(rounds, 0, this.bridge);
    } else {
      this.left.setMaxDigits(rounds);
      this.right.setMaxDigits(rounds);
    }

    this.cancelRequested = false;
    this.calculating = true;

    if (!this.cancelRequested) await this.left.arcTanAsync(16, 5);
    if (!this.cancelRequested) await this.right.arcTanAsync(4, 239);
    if (!this.cancelRequested) this.left.subtractInPlace(this.right);

    let result: PiDigitSequence;
    if (!this.cancelRequested) {
      const digits =
        option === 'decimal' ? this.left.getPiDigits() : this.left.getPiDigitsBase12();
      result = new PiDigitSequence(digits);
      this.calculating = false;
      this.lastResult = result;
    } else {
      result =
        this.lastResult ??
        new PiDigitSequence(
          option === 'decimal' ? DEFAULT_PI_DECIMAL_DIGITS : DEFAULT_PI_BASE12_DIGITS,
        );
    }

    return result;
  }

  cancel(): void {
    this.cancelRequested = true;
    this.calculating = false;
    this.left?.cancel();
  }
}
