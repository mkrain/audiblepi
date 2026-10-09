import {
  DEFAULT_SETTINGS,
  createSettingsStore,
  readSettings,
  writeSettings,
} from '../settings';
import type { SettingsStorage } from '../settings';

// react-native-mmkv is a native module; the module-level singleton in
// settings.ts needs it importable, but these tests exercise the exported
// factory with an in-memory fake instead.
jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({
    set: jest.fn(),
    getBoolean: jest.fn(),
    getNumber: jest.fn(),
  })),
}));

function makeFakeStorage(): SettingsStorage & { keys(): string[] } {
  const map = new Map<string, boolean | string | number>();
  return {
    set: (k, v) => {
      map.set(k, v);
    },
    getBoolean: (k) => {
      const v = map.get(k);
      return typeof v === 'boolean' ? v : undefined;
    },
    getNumber: (k) => {
      const v = map.get(k);
      return typeof v === 'number' ? v : undefined;
    },
    keys: () => [...map.keys()],
  };
}

describe('settings persistence', () => {
  test('empty storage reads as defaults', () => {
    expect(readSettings(makeFakeStorage())).toEqual(DEFAULT_SETTINGS);
  });

  test('save/load round-trip through a fresh store', () => {
    const storage = makeFakeStorage();

    const writer = createSettingsStore(storage);
    writer.getState().setTempoMs(250);
    writer.getState().setSkipStep(100);
    writer.getState().setInstrumentId(3);
    writer.getState().setLoopSound(true);
    writer.getState().setUsePrecomputed(false);
    writer.getState().setDigitCount(10000);

    // A new store over the same storage hydrates the persisted values.
    const reader = createSettingsStore(storage);
    reader.getState().hydrate();

    expect(reader.getState().tempoMs).toBe(250);
    expect(reader.getState().skipStep).toBe(100);
    expect(reader.getState().instrumentId).toBe(3);
    expect(reader.getState().loopSound).toBe(true);
    expect(reader.getState().usePrecomputed).toBe(false);
    expect(reader.getState().digitCount).toBe(10000);
  });

  test('setters write through to storage immediately', () => {
    const storage = makeFakeStorage();
    const store = createSettingsStore(storage);

    store.getState().setTempoMs(125);
    expect(storage.getNumber('settings.tempoMs')).toBe(125);
  });

  test('corrupt persisted values fall back to defaults per key', () => {
    const storage = makeFakeStorage();
    storage.set('settings.tempoMs', 999); // not a valid tempo option
    storage.set('settings.skipStep', 7); // not a valid skip option
    storage.set('settings.instrumentId', 99); // out of range
    storage.set('settings.digitCount', -5);
    storage.set('settings.tempoMs', 500); // valid: must survive

    const store = createSettingsStore(storage);
    store.getState().hydrate();

    expect(store.getState().skipStep).toBe(DEFAULT_SETTINGS.skipStep);
    expect(store.getState().instrumentId).toBe(DEFAULT_SETTINGS.instrumentId);
    expect(store.getState().digitCount).toBe(DEFAULT_SETTINGS.digitCount);
    expect(store.getState().tempoMs).toBe(500);
  });

  test('setters clamp invalid input instead of persisting it', () => {
    const storage = makeFakeStorage();
    const store = createSettingsStore(storage);

    store.getState().setTempoMs(999);
    store.getState().setSkipStep(0);
    store.getState().setInstrumentId(-1);
    store.getState().setDigitCount(0);

    expect(store.getState().tempoMs).toBe(DEFAULT_SETTINGS.tempoMs);
    expect(store.getState().skipStep).toBe(DEFAULT_SETTINGS.skipStep);
    expect(store.getState().instrumentId).toBe(DEFAULT_SETTINGS.instrumentId);
    expect(store.getState().digitCount).toBe(DEFAULT_SETTINGS.digitCount);
  });

  test('resetToDefaults restores and persists defaults', () => {
    const storage = makeFakeStorage();
    const store = createSettingsStore(storage);

    store.getState().setTempoMs(125);
    store.getState().setLoopSound(true);
    store.getState().resetToDefaults();

    expect(store.getState().tempoMs).toBe(DEFAULT_SETTINGS.tempoMs);
    expect(store.getState().loopSound).toBe(DEFAULT_SETTINGS.loopSound);
    expect(readSettings(storage)).toEqual(DEFAULT_SETTINGS);
  });

  test('writeSettings/readSettings are symmetric', () => {
    const storage = makeFakeStorage();
    const settings = {
      instrumentId: 2,
      skipStep: 25,
      tempoMs: 2000,
      digitCount: 50000,
      loopSound: true,
      usePrecomputed: false,
    };
    writeSettings(storage, settings);
    expect(readSettings(storage)).toEqual(settings);
  });
});
