/**
 * Persisted app settings — the modern equivalent of the WP7 app's
 * SettingsViewmodel + isolated-storage settings (Common.Configuration).
 *
 * Single source of truth for: instrument, skip step, tempo, digit count,
 * loop-sound, and the precomputed-vs-computed flag (default precomputed,
 * per Jeremiah's product call). Persisted with react-native-mmkv;
 * every setter writes through immediately, and hydrate() loads on start.
 */

import { create } from 'zustand';
import { createMMKV } from 'react-native-mmkv';
import type { MMKV } from 'react-native-mmkv';

import { INSTRUMENTS } from '../lib/notes';

/** Tempo options from the original SettingsViewModel (milliseconds). */
export const TEMPO_OPTIONS = [2000, 1000, 500, 250, 125] as const;
/** Skip-step options from the original SettingsViewModel (digits). */
export const SKIP_OPTIONS = [1, 5, 10, 25, 100, 1000] as const;
/** Computed-digit options for the Machin calculator path. */
export const COMPUTED_DIGIT_OPTIONS = [1000, 10000, 50000] as const;

export interface Settings {
  instrumentId: number;
  skipStep: number;
  tempoMs: number;
  digitCount: number;
  loopSound: boolean;
  usePrecomputed: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  instrumentId: 0, // Glockenspiel — matches the WP7 default (first NoteType)
  skipStep: 1,
  tempoMs: 1000,
  digitCount: 1_000_000, // precomputed file length; settings screen can narrow it
  loopSound: false,
  usePrecomputed: true, // product call: keep precomputed digits
};

/** Minimal storage surface; MMKV satisfies it structurally. */
export interface SettingsStorage {
  set(key: string, value: boolean | string | number): void;
  getBoolean(key: string): boolean | undefined;
  getNumber(key: string): number | undefined;
}

const KEYS = {
  instrumentId: 'settings.instrumentId',
  skipStep: 'settings.skipStep',
  tempoMs: 'settings.tempoMs',
  digitCount: 'settings.digitCount',
  loopSound: 'settings.loopSound',
  usePrecomputed: 'settings.usePrecomputed',
} as const;

function clampInstrumentId(id: number | undefined): number {
  return Number.isInteger(id) && (id as number) >= 0 && (id as number) < INSTRUMENTS.length
    ? (id as number)
    : DEFAULT_SETTINGS.instrumentId;
}

function clampOption<T extends number>(value: number | undefined, options: readonly T[], fallback: T): T {
  return options.includes(value as T) ? (value as T) : fallback;
}

function clampPositiveInt(value: number | undefined, fallback: number): number {
  return Number.isInteger(value) && (value as number) > 0 ? (value as number) : fallback;
}

/** Read + validate stored settings, falling back to defaults per key. */
export function readSettings(storage: SettingsStorage): Settings {
  return {
    instrumentId: clampInstrumentId(storage.getNumber(KEYS.instrumentId)),
    skipStep: clampOption(storage.getNumber(KEYS.skipStep), SKIP_OPTIONS, DEFAULT_SETTINGS.skipStep),
    tempoMs: clampOption(storage.getNumber(KEYS.tempoMs), TEMPO_OPTIONS, DEFAULT_SETTINGS.tempoMs),
    digitCount: clampPositiveInt(storage.getNumber(KEYS.digitCount), DEFAULT_SETTINGS.digitCount),
    loopSound: storage.getBoolean(KEYS.loopSound) ?? DEFAULT_SETTINGS.loopSound,
    usePrecomputed: storage.getBoolean(KEYS.usePrecomputed) ?? DEFAULT_SETTINGS.usePrecomputed,
  };
}

export function writeSettings(storage: SettingsStorage, settings: Settings): void {
  storage.set(KEYS.instrumentId, settings.instrumentId);
  storage.set(KEYS.skipStep, settings.skipStep);
  storage.set(KEYS.tempoMs, settings.tempoMs);
  storage.set(KEYS.digitCount, settings.digitCount);
  storage.set(KEYS.loopSound, settings.loopSound);
  storage.set(KEYS.usePrecomputed, settings.usePrecomputed);
}

export interface SettingsActions {
  setInstrumentId(id: number): void;
  setSkipStep(step: number): void;
  setTempoMs(ms: number): void;
  setDigitCount(count: number): void;
  setLoopSound(loop: boolean): void;
  setUsePrecomputed(use: boolean): void;
  /** Load persisted settings into the store (call once at app start). */
  hydrate(): void;
  resetToDefaults(): void;
}

export type SettingsStore = Settings & SettingsActions;

export function createSettingsStore(storage: SettingsStorage) {
  return create<SettingsStore>()((set) => {
    const update = (partial: Partial<Settings>): void => {
      set((state) => {
        const next: Settings = { ...state, ...partial };
        writeSettings(storage, next);
        return next;
      });
    };
    return {
      ...DEFAULT_SETTINGS,
      setInstrumentId: (instrumentId) => update({ instrumentId: clampInstrumentId(instrumentId) }),
      setSkipStep: (skipStep) =>
        update({ skipStep: clampOption(skipStep, SKIP_OPTIONS, DEFAULT_SETTINGS.skipStep) }),
      setTempoMs: (tempoMs) =>
        update({ tempoMs: clampOption(tempoMs, TEMPO_OPTIONS, DEFAULT_SETTINGS.tempoMs) }),
      setDigitCount: (digitCount) =>
        update({ digitCount: clampPositiveInt(digitCount, DEFAULT_SETTINGS.digitCount) }),
      setLoopSound: (loopSound) => update({ loopSound }),
      setUsePrecomputed: (usePrecomputed) => update({ usePrecomputed }),
      hydrate: () => set(readSettings(storage)),
      resetToDefaults: () => {
        writeSettings(storage, DEFAULT_SETTINGS);
        set(DEFAULT_SETTINGS);
      },
    };
  });
}

const mmkv: MMKV = createMMKV({ id: 'audiblepi-settings' });

/** App singleton. Call hydrate() once at startup. */
export const useSettingsStore = createSettingsStore(mmkv);
