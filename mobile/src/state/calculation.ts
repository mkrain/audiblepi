/**
 * Transient state for the "Calculating Pi…" overlay (the WP7 popup).
 * Progress is the 0-based digit-group index reported by PiCalculator.
 */

import { create } from 'zustand';

export interface CalculationState {
  isCalculating: boolean;
  progressDigit: number;
  start(): void;
  setProgress(digitIndex: number): void;
  finish(): void;
}

export const useCalculationStore = create<CalculationState>()((set) => ({
  isCalculating: false,
  progressDigit: 0,
  start: () => set({ isCalculating: true, progressDigit: 0 }),
  setProgress: (progressDigit) => set({ progressDigit }),
  finish: () => set({ isCalculating: false, progressDigit: 0 }),
}));
