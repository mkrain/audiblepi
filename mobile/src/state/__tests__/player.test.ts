import { INSTRUMENTS } from '../../lib/notes';
import { usePlayerStore } from '../player';
import { useSettingsStore } from '../settings';

jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({
    set: jest.fn(),
    getBoolean: jest.fn(),
    getNumber: jest.fn(),
  })),
}));

describe('player state', () => {
  beforeEach(() => {
    useSettingsStore.getState().resetToDefaults();
    usePlayerStore.getState().reset();
  });

  test('togglePlay flips the playing flag', () => {
    expect(usePlayerStore.getState().isPlaying).toBe(false);
    usePlayerStore.getState().togglePlay();
    expect(usePlayerStore.getState().isPlaying).toBe(true);
    usePlayerStore.getState().togglePlay();
    expect(usePlayerStore.getState().isPlaying).toBe(false);
  });

  test('seek clamps to non-negative integers', () => {
    usePlayerStore.getState().seek(1234);
    expect(usePlayerStore.getState().digitIndex).toBe(1234);
    usePlayerStore.getState().seek(-10);
    expect(usePlayerStore.getState().digitIndex).toBe(0);
  });

  test('stepNext/stepPrevious use the settings skip step', () => {
    useSettingsStore.getState().setSkipStep(100);

    usePlayerStore.getState().seek(50);
    usePlayerStore.getState().stepNext();
    expect(usePlayerStore.getState().digitIndex).toBe(150);

    usePlayerStore.getState().stepPrevious();
    expect(usePlayerStore.getState().digitIndex).toBe(50);

    // Clamped at zero, never negative.
    usePlayerStore.getState().stepPrevious();
    expect(usePlayerStore.getState().digitIndex).toBe(0);
  });

  test('cycleInstrument wraps through all instruments via settings', () => {
    const count = INSTRUMENTS.length;
    for (let i = 1; i <= count; i++) {
      usePlayerStore.getState().cycleInstrument();
      expect(useSettingsStore.getState().instrumentId).toBe(i % count);
    }
  });

  test('reset clears index and playing flag', () => {
    usePlayerStore.getState().seek(999);
    usePlayerStore.getState().setPlaying(true);
    usePlayerStore.getState().reset();

    expect(usePlayerStore.getState().digitIndex).toBe(0);
    expect(usePlayerStore.getState().isPlaying).toBe(false);
  });
});
