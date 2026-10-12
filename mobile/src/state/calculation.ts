/**
 * Transient state for background pi calculation.
 * Progress is the current term/divisor during arctan, or digit index during
 * extraction. Target is the requested digit count.
 */

import { create } from 'zustand';

export interface CalculationState {
  isCalculating: boolean;
  progressDigit: number;
  targetDigits: number;
  start(target: number): void;
  setProgress(digitIndex: number): void;
  finish(): void;
}

export const useCalculationStore = create<CalculationState>()((set) => ({
  isCalculating: false,
  progressDigit: 0,
  targetDigits: 0,
  start: (target) => set({ isCalculating: true, progressDigit: 0, targetDigits: target }),
  setProgress: (progressDigit) => set({ progressDigit }),
  finish: () => set({ isCalculating: false, progressDigit: 0, targetDigits: 0 }),
}));
