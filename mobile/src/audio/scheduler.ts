/**
 * Tempo scheduler — the modern equivalent of the WP7 app's XNA GameTimer
 * that drove note advancement at the configured tempo.
 *
 * Pure timing: it owns no audio and no digit state. The tick callback
 * advances the cursor and plays the note; the owner (playback-controller)
 * supplies that behavior. Uses the global setInterval so Jest fake timers
 * can drive it deterministically in tests.
 */

export interface TempoSchedulerEvents {
  onTick: () => void;
}

function validateTempo(ms: number): number {
  if (!Number.isFinite(ms) || ms <= 0) {
    throw new Error(`tempo must be a positive number of milliseconds, got ${ms}`);
  }
  return ms;
}

export class TempoScheduler {
  private timer: ReturnType<typeof setInterval> | null = null;
  private tempoMs: number;

  constructor(
    private readonly events: TempoSchedulerEvents,
    tempoMs: number,
  ) {
    this.tempoMs = validateTempo(tempoMs);
  }

  get currentTempoMs(): number {
    return this.tempoMs;
  }

  get isRunning(): boolean {
    return this.timer !== null;
  }

  /** Change tempo; restarts the interval immediately if running. */
  setTempoMs(ms: number): void {
    this.tempoMs = validateTempo(ms);
    if (this.isRunning) {
      this.restart();
    }
  }

  /** Start ticking. Idempotent — calling twice does not double-schedule. */
  start(): void {
    if (this.isRunning) {
      return;
    }
    this.timer = setInterval(() => {
      this.events.onTick();
    }, this.tempoMs);
  }

  /** Pause ticking; start() resumes. */
  pause(): void {
    this.stopTimer();
  }

  /** Stop ticking entirely. */
  stop(): void {
    this.stopTimer();
  }

  private restart(): void {
    this.stopTimer();
    this.start();
  }

  private stopTimer(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
