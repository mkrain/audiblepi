import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';

import { INSTRUMENTS } from '../../lib/notes';
import type { NoteName } from '../../lib/notes';
import { SoundBank } from '../sound-bank';

jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    Sound: {
      createAsync: jest.fn(),
    },
  },
}));

jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn((id: number) => ({
      downloadAsync: jest.fn().mockResolvedValue(undefined),
      localUri: `file:///bundled/${id}.wav`,
      uri: null,
    })),
  },
}));

// Avoid Metro's asset system in Jest; the manifest shape is what matters.
jest.mock('../instrument-assets', () => {
  const notes: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const forInstrument = (base: number): Record<NoteName, number> =>
    Object.fromEntries(notes.map((n, i) => [n, base + i])) as Record<NoteName, number>;
  return {
    INSTRUMENT_ASSETS: {
      Piano: forInstrument(100),
      Guitar: forInstrument(200),
    },
  };
});

const createAsync = Audio.Sound.createAsync as unknown as jest.Mock;
const fromModule = Asset.fromModule as unknown as jest.Mock;

interface FakeSound {
  replayAsync: jest.Mock;
  unloadAsync: jest.Mock;
}

function makeFakeSound(): FakeSound {
  return {
    replayAsync: jest.fn().mockResolvedValue({}),
    unloadAsync: jest.fn().mockResolvedValue({}),
  };
}

describe('SoundBank', () => {
  const created: FakeSound[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
    created.length = 0;
    createAsync.mockImplementation(async () => {
      const sound = makeFakeSound();
      created.push(sound);
      return { sound, status: {} };
    });
  });

  const piano = INSTRUMENTS.find((i) => i.directory === 'Piano')!;
  const guitar = INSTRUMENTS.find((i) => i.directory === 'Guitar')!;

  test('loadInstrument preloads all 12 note sounds', async () => {
    const bank = new SoundBank();
    await bank.loadInstrument(piano);

    expect(createAsync).toHaveBeenCalledTimes(12);
    expect(fromModule).toHaveBeenCalledTimes(12);
    expect(bank.isLoaded).toBe(true);
    expect(bank.currentInstrument?.directory).toBe('Piano');
    // expo-asset download + localUri wiring
    expect(fromModule).toHaveBeenCalledWith(100);
    expect(createAsync).toHaveBeenCalledWith(
      { uri: 'file:///bundled/100.wav' },
      { shouldPlay: false },
    );
  });

  test('reloading the same instrument is a no-op', async () => {
    const bank = new SoundBank();
    await bank.loadInstrument(piano);
    await bank.loadInstrument(piano);

    expect(createAsync).toHaveBeenCalledTimes(12);
  });

  test('playNote replays the mapped sound, fire-and-forget', () => {
    const bank = new SoundBank();
    return bank.loadInstrument(piano).then(() => {
      // 'C' is the first note created (index 0).
      bank.playNote('C');
      expect(created[0].replayAsync).toHaveBeenCalledTimes(1);
      expect(created[1].replayAsync).not.toHaveBeenCalled();
    });
  });

  test('playNote before load is a silent no-op', () => {
    const bank = new SoundBank();
    expect(() => bank.playNote('C')).not.toThrow();
    expect(createAsync).not.toHaveBeenCalled();
  });

  test('switching instrument unloads the old bank and loads the new one', async () => {
    const bank = new SoundBank();
    await bank.loadInstrument(piano);
    const pianoSounds = [...created];

    await bank.loadInstrument(guitar);

    expect(pianoSounds.every((s) => s.unloadAsync.mock.calls.length === 1)).toBe(true);
    expect(createAsync).toHaveBeenCalledTimes(24);
    expect(bank.currentInstrument?.directory).toBe('Guitar');
    expect(bank.isLoaded).toBe(true);

    bank.playNote('G');
    // 'G' is index 7 of the 12 guitar sounds (created[12..23]).
    expect(created[12 + 7].replayAsync).toHaveBeenCalledTimes(1);
  });

  test('unload releases all sounds', async () => {
    const bank = new SoundBank();
    await bank.loadInstrument(piano);
    await bank.unload();

    expect(bank.isLoaded).toBe(false);
    expect(bank.currentInstrument).toBeNull();
    expect(created.every((s) => s.unloadAsync.mock.calls.length === 1)).toBe(true);
  });

  test('sets an audio mode suitable for a music toy', async () => {
    const bank = new SoundBank();
    await bank.loadInstrument(piano);

    expect(Audio.setAudioModeAsync).toHaveBeenCalledWith(
      expect.objectContaining({ playsInSilentModeIOS: true, staysActiveInBackground: false }),
    );
  });
});
