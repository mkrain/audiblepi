import { INSTRUMENTS } from '../../lib/notes';
import { PiDigitReader } from '../../lib/pi-digits';
import { PlaybackController } from '../playback-controller';
import type { KeepAwakeControl } from '../playback-controller';
import { SoundBank } from '../sound-bank';

// The controller injects keep-awake, but the module still needs to resolve
// in Jest (expo packages ship untransformed TS source).
jest.mock('expo-keep-awake', () => ({
  activateKeepAwakeAsync: jest.fn().mockResolvedValue(undefined),
  deactivateKeepAwake: jest.fn().mockResolvedValue(undefined),
}));

describe('PlaybackController', () => {
  const piano = INSTRUMENTS.find((i) => i.directory === 'Piano')!;

  let soundBank: SoundBank;
  let keepAwake: KeepAwakeControl;
  let controller: PlaybackController;

  beforeEach(() => {
    jest.useFakeTimers();
    soundBank = {
      loadInstrument: jest.fn().mockResolvedValue(undefined),
      playNote: jest.fn(),
      unload: jest.fn().mockResolvedValue(undefined),
    } as unknown as SoundBank;
    keepAwake = {
      activate: jest.fn().mockResolvedValue(undefined),
      deactivate: jest.fn().mockResolvedValue(undefined),
    };
    controller = new PlaybackController(soundBank, keepAwake, {}, 1000);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const loadInstrumentMock = () => soundBank.loadInstrument as unknown as jest.Mock;
  const playNoteMock = () => soundBank.playNote as unknown as jest.Mock;

  test('start loads the instrument, keeps awake, and plays the first note', async () => {
    const reader = new PiDigitReader('31415'); // starts on '3' -> D#

    await controller.start(reader, piano, 1000);

    expect(loadInstrumentMock()).toHaveBeenCalledWith(piano);
    expect(keepAwake.activate).toHaveBeenCalledTimes(1);
    expect(controller.isPlaying).toBe(true);
    expect(playNoteMock()).toHaveBeenCalledWith('D#');
  });

  test('ticks advance one digit per tempo and play each note', async () => {
    const reader = new PiDigitReader('31415');

    await controller.start(reader, piano, 500);
    playNoteMock().mockClear();

    jest.advanceTimersByTime(500); // '1' -> C#
    jest.advanceTimersByTime(500); // '4' -> E

    expect(playNoteMock()).toHaveBeenNthCalledWith(1, 'C#');
    expect(playNoteMock()).toHaveBeenNthCalledWith(2, 'E');
  });

  test('setTempoMs changes the tick rate mid-playback', async () => {
    const reader = new PiDigitReader('31415926535');

    await controller.start(reader, piano, 1000);
    playNoteMock().mockClear();

    controller.setTempoMs(250);
    jest.advanceTimersByTime(1000);

    expect(playNoteMock()).toHaveBeenCalledTimes(4);
  });

  test('pause stops ticking and releases keep-awake; resume continues', async () => {
    const reader = new PiDigitReader('31415');

    await controller.start(reader, piano, 500);
    playNoteMock().mockClear();

    controller.pause();
    expect(controller.isPlaying).toBe(false);
    expect(keepAwake.deactivate).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(2000);
    expect(playNoteMock()).not.toHaveBeenCalled();

    controller.resume();
    expect(controller.isPlaying).toBe(true);
    jest.advanceTimersByTime(500);
    expect(playNoteMock()).toHaveBeenCalledTimes(1);
  });

  test('stop halts playback and releases keep-awake', async () => {
    const reader = new PiDigitReader('31415');

    await controller.start(reader, piano, 500);
    await controller.stop();

    expect(controller.isPlaying).toBe(false);
    expect(keepAwake.deactivate).toHaveBeenCalled();
  });

  test('stepBy moves the cursor by the skip amount and plays the landed note', async () => {
    const reader = new PiDigitReader('31415926');
    await controller.setInstrument(piano);
    playNoteMock().mockClear();

    controller.stepBy(reader, 5); // lands on '9' -> A
    expect(playNoteMock()).toHaveBeenCalledWith('A');

    controller.stepBy(reader, -2); // lands on '1' -> C#
    expect(playNoteMock()).toHaveBeenCalledWith('C#');
  });

  test('tapDigit plays a note without moving the cursor', async () => {
    const reader = new PiDigitReader('31415');
    await controller.setInstrument(piano);
    playNoteMock().mockClear();

    controller.tapDigit('B'); // base-12 digit B -> note B
    expect(playNoteMock()).toHaveBeenCalledWith('B');
    expect(reader.current).toBe('3');
  });

  test('reaching the end stops playback and fires onEnded', async () => {
    const onEnded = jest.fn();
    const endedController = new PlaybackController(soundBank, keepAwake, { onEnded }, 250);
    const reader = new PiDigitReader('31'); // two digits

    await endedController.start(reader, piano, 250);
    playNoteMock().mockClear();

    jest.advanceTimersByTime(250); // moves to '1', plays C#
    expect(playNoteMock()).toHaveBeenCalledWith('C#');

    await jest.advanceTimersByTimeAsync(250); // past the end
    expect(endedController.isPlaying).toBe(false);
    expect(onEnded).toHaveBeenCalledTimes(1);
  });

  test('a second start while playing restarts cleanly', async () => {
    const reader = new PiDigitReader('31415');

    await controller.start(reader, piano, 500);
    await controller.start(reader, piano, 500);

    // One scheduler only: a single tick per interval, not doubled.
    playNoteMock().mockClear();
    jest.advanceTimersByTime(500);
    expect(playNoteMock()).toHaveBeenCalledTimes(1);
  });
});
