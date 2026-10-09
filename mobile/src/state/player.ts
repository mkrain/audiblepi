/**
 * Ephemeral player state (zustand).
 *
 * Holds only what changes during playback: the digit cursor index and the
 * playing flag. Instrument, tempo, skip step, loop and digit count live in
 * the settings store (single source of truth); transport actions read them
 * live via useSettingsStore.getState(). Audio side effects belong to the
 * PlaybackController (Phase 3 wires store -> controller).
 */

import { create } from 'zustand';

import { INSTRUMENTS } from '../lib/notes';
import { useSettingsStore } from './settings';

export interface PlayerState {
  /** 0-based index into the active digit sequence. */
  digitIndex: number;
  isPlaying: boolean;

  togglePlay(): void;
  setPlaying(playing: boolean): void;
  /** Absolute seek, clamped to >= 0. */
  seek(index: number): void;
  /** Advance by the settings' skip step. */
  stepNext(): void;
  /** Retreat by the settings' skip step, clamped at 0. */
  stepPrevious(): void;
  /** Cycle to the next instrument (wraps), mirroring the WP7 UI button. */
  cycleInstrument(): void;
  reset(): void;
}

export const usePlayerStore = create<PlayerState>()((set) => ({
  digitIndex: 0,
  isPlaying: false,

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setPlaying: (isPlaying) => set({ isPlaying }),
  seek: (index) => set({ digitIndex: Math.max(0, Math.floor(index)) }),

  stepNext: () => {
    const { skipStep } = useSettingsStore.getState();
    set((s) => ({ digitIndex: s.digitIndex + skipStep }));
  },
  stepPrevious: () => {
    const { skipStep } = useSettingsStore.getState();
    set((s) => ({ digitIndex: Math.max(0, s.digitIndex - skipStep) }));
  },
  cycleInstrument: () => {
    const settings = useSettingsStore.getState();
    settings.setInstrumentId((settings.instrumentId + 1) % INSTRUMENTS.length);
  },
  reset: () => set({ digitIndex: 0, isPlaying: false }),
}));
