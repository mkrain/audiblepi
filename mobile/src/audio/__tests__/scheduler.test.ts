import { TempoScheduler } from '../scheduler';

describe('TempoScheduler', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('ticks at the configured tempo', () => {
    const onTick = jest.fn();
    const scheduler = new TempoScheduler({ onTick }, 500);

    scheduler.start();
    expect(scheduler.isRunning).toBe(true);

    jest.advanceTimersByTime(1600);
    expect(onTick).toHaveBeenCalledTimes(3);

    scheduler.stop();
  });

  test('start is idempotent', () => {
    const onTick = jest.fn();
    const scheduler = new TempoScheduler({ onTick }, 500);

    scheduler.start();
    scheduler.start();
    jest.advanceTimersByTime(1000);
    expect(onTick).toHaveBeenCalledTimes(2);
    scheduler.stop();
  });

  test('stop halts ticking', () => {
    const onTick = jest.fn();
    const scheduler = new TempoScheduler({ onTick }, 250);

    scheduler.start();
    jest.advanceTimersByTime(500);
    scheduler.stop();
    expect(scheduler.isRunning).toBe(false);

    jest.advanceTimersByTime(2000);
    expect(onTick).toHaveBeenCalledTimes(2);
  });

  test('pause/resume keeps ticking from the new interval', () => {
    const onTick = jest.fn();
    const scheduler = new TempoScheduler({ onTick }, 500);

    scheduler.start();
    jest.advanceTimersByTime(500);
    scheduler.pause();
    expect(scheduler.isRunning).toBe(false);

    jest.advanceTimersByTime(2000);
    expect(onTick).toHaveBeenCalledTimes(1);

    scheduler.start();
    jest.advanceTimersByTime(500);
    expect(onTick).toHaveBeenCalledTimes(2);
    scheduler.stop();
  });

  test('setTempoMs restarts the interval while running', () => {
    const onTick = jest.fn();
    const scheduler = new TempoScheduler({ onTick }, 1000);

    scheduler.start();
    jest.advanceTimersByTime(1000);
    expect(onTick).toHaveBeenCalledTimes(1);

    // Original app's fastest tempo: 125 ms.
    scheduler.setTempoMs(250);
    jest.advanceTimersByTime(1000);
    expect(onTick).toHaveBeenCalledTimes(5);
    scheduler.stop();
  });

  test('setTempoMs while stopped applies on next start', () => {
    const onTick = jest.fn();
    const scheduler = new TempoScheduler({ onTick }, 1000);

    scheduler.setTempoMs(125);
    expect(scheduler.currentTempoMs).toBe(125);

    scheduler.start();
    jest.advanceTimersByTime(500);
    expect(onTick).toHaveBeenCalledTimes(4);
    scheduler.stop();
  });

  test('rejects non-positive tempos', () => {
    const onTick = jest.fn();
    expect(() => new TempoScheduler({ onTick }, 0)).toThrow();
    expect(() => new TempoScheduler({ onTick }, -100)).toThrow();

    const scheduler = new TempoScheduler({ onTick }, 500);
    expect(() => scheduler.setTempoMs(0)).toThrow();
    expect(scheduler.currentTempoMs).toBe(500);
  });
});
