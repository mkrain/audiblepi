/**
 * Facade over the two pi sources — port of Src/Audible.Model/PiModel.cs and
 * Src/Audible.Provider/PiCalculatorFactory.cs.
 *
 * The WP7 PiModel swapped between the streamed (precomputed) and calculated
 * (Machin) calculators via messenger events. Here it is a plain class:
 * precomputed digits are the default/primary path (Jeremiah's call — "keep
 * precomputed digits"); the Machin calculator remains available as the
 * secondary option for the settings screen's "Calculating Pi" flow.
 *
 * The cross-promo "other apps" concept (AppListViewModel / AppsListControl)
 * was dropped per his call and nothing from it carries over.
 */

import {
  PiCalculationEvents,
  PiCalculator,
  PiConversionOption,
} from './pi-calculator';
import { PiDigitReader, PiDigitSequence, PrecomputedPiService } from './pi-digits';

export type { PiConversionOption, PiCalculationEvents };

export class PiService {
  private readonly calculator = new PiCalculator();
  private readonly precomputed: PrecomputedPiService;
  private usePrecomputed = true;

  /**
   * @param precomputedDigits Full contents of the precomputed digit file
   * (e.g. assets/data/1000000.12.txt), starting with "3".
   */
  constructor(precomputedDigits: string) {
    this.precomputed = new PrecomputedPiService(new PiDigitReader(precomputedDigits));
  }

  get isPrecomputed(): boolean {
    return this.usePrecomputed;
  }

  setUsePrecomputed(value: boolean): void {
    this.usePrecomputed = value;
  }

  get supportedDigitCounts(): readonly number[] {
    return this.usePrecomputed
      ? this.precomputed.supportedDigits
      : this.calculator.supportedDigits;
  }

  get isCalculating(): boolean {
    return this.calculator.isCalculating;
  }

  /**
   * Resolves with the active pi source: the precomputed reader (default) or a
   * freshly calculated digit sequence.
   */
  calculate(
    option: PiConversionOption,
    rounds: number,
    events: PiCalculationEvents = {},
  ): Promise<PiDigitSequence | PiDigitReader> {
    if (this.usePrecomputed) {
      return Promise.resolve(this.precomputed.calculate());
    }
    return this.calculator.calculatePi(option, rounds, events);
  }

  cancel(): void {
    this.calculator.cancel();
  }
}
