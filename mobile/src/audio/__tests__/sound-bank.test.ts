import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Asset } from 'expo-asset';

import { INSTRUMENTS } from '../../lib/notes';
import type { NoteName } from '../../lib/notes';
import { SoundBank } from '../sound-bank';

jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(),
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
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

const createPlayer = createAudioPlayer as unknown as jest.Mock;
const setMode = setAudioModeAsync as unknown as jest.Mock;
const fromModule = Asset.fromModule as unknown as jest.Mock;

interface FakePlayer {
  play: jest.Mock;
  seekTo: jest.Mock;
  remove: jest.Mock;
}

function makeFakePlayer(): FakePlayer {
  return {
    play: jest.fn(),
    seekTo: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn(),
  };
}

const flushPromises = (): Promise<void> => new Promise(setImmediate);

describe('SoundBank', () => {
  const created: FakePlayer[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
    created.length = 0;
    createPlayer.mockImplementation(() => {
      const player = makeFakePlayer();
      created.push(player);
      return player;
    });
  });

  const piano = INSTRUMENTS.find((i) => i.directory === 'Piano')!;
  const guitar = INSTRUMENTS.find((i) => i.directory === 'Guitar')!;

  test('loadInstrument preloads all 12 note players', async () => {
    const bank = new SoundBank();
    await bank.loadInstrument(piano);

    expect(createPlayer).toHaveBeenCalledTimes(12);
    expect(fromModule).toHaveBeenCalledTimes(12);
    expect(bank.isLoaded).toBe(true);
    expect(bank.currentInstrument?.directory).toBe('Piano');
    // expo-asset download + localUri wiring
    expect(fromModule).toHaveBeenCalledWith(100);
    expect(createPlayer).toHaveBeenCalledWith({ uri: 'file:///bundled/100.wav' });
  });

  test('reloading the same instrument is a no-op', async () => {
    const bank = new SoundBank();
    await bank.loadInstrument(piano);
    await bank.loadInstrument(piano);

    expect(createPlayer).toHaveBeenCalledTimes(12);
  });

  test('playNote restarts the mapped player, fire-and-forget', async () => {
    const bank = new SoundBank();
    await bank.loadInstrument(piano);

    // 'C' is the first player created (index 0).
    bank.playNote('C');
    await flushPromises();

    expect(created[0].seekTo).toHaveBeenCalledWith(0);
    expect(created[0].play).toHaveBeenCalledTimes(1);
    expect(created[1].seekTo).not.toHaveBeenCalled();
  });

  test('playNote before load is a silent no-op', () => {
    const bank = new SoundBank();
    expect(() => bank.playNote('C')).not.toThrow();
    expect(createPlayer).not.toHaveBeenCalled();
  });

  test('switching instrument removes the old bank and loads the new one', async () => {
    const bank = new SoundBank();
    await bank.loadInstrument(piano);
    const pianoPlayers = [...created];

    await bank.loadInstrument(guitar);

    expect(pianoPlayers.every((p) => p.remove.mock.calls.length === 1)).toBe(true);
    expect(createPlayer).toHaveBeenCalledTimes(24);
    expect(bank.currentInstrument?.directory).toBe('Guitar');
    expect(bank.isLoaded).toBe(true);

    bank.playNote('G');
    await flushPromises();
    // 'G' is index 7 of the 12 guitar players (created[12..23]).
    expect(created[12 + 7].seekTo).toHaveBeenCalledWith(0);
    expect(created[12 + 7].play).toHaveBeenCalledTimes(1);
  });

  test('unload releases all players', async () => {
    const bank = new SoundBank();
    await bank.loadInstrument(piano);
    await bank.unload();

    expect(bank.isLoaded).toBe(false);
    expect(bank.currentInstrument).toBeNull();
    expect(created.every((p) => p.remove.mock.calls.length === 1)).toBe(true);
  });

  test('sets an audio mode suitable for a music toy', async () => {
    const bank = new SoundBank();
    await bank.loadInstrument(piano);

    expect(setMode).toHaveBeenCalledWith(
      expect.objectContaining({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionMode: 'duckOthers',
      }),
    );
  });
});
