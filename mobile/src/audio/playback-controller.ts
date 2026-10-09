/**
 * Playback orchestration: ties the digit cursor, the SoundBank and the
 * TempoScheduler together, mirroring PiViewModel's transport behavior
 * (play/pause, prev/next with skip, tap-to-play a note, instrument switch).
 *
 * The controller owns the timed loop and keep-awake state. The digit cursor
 * itself (PiDigitReader) is supplied by the caller so UI state and playback
 * stay in one place in Phase 3.
 */

import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import type { Instrument } from '../lib/notes';
import { noteNameForDigit } from '../lib/notes';
import { SoundBank } from './sound-bank';
import { TempoScheduler } from './scheduler';

/** Minimal cursor surface; PiDigitReader satisfies this structurally. */
export interface DigitCursor {
  readonly current: string;
  moveNext(): boolean;
  movePrevious(): boolean;
}

export interface KeepAwakeControl {
  activate(): Promise<void>;
  deactivate(): Promise<void>;
}

const KEEP_AWAKE_TAG = 'audiblepi-playback';

const defaultKeepAwake: KeepAwakeControl = {
  activate: () => activateKeepAwakeAsync(KEEP_AWAKE_TAG),
  deactivate: () => deactivateKeepAwake(KEEP_AWAKE_TAG),
};

export interface PlaybackEvents {
  /** Fired when the cursor runs past the last digit. */
  onEnded?: () => void;
  /** Fired after each successful timed advance (Phase 3 uses it to sync UI). */
  onAdvanced?: () => void;
}

export class PlaybackController {
  private readonly scheduler: TempoScheduler;
  private readonly keepAwake: KeepAwakeControl;
  private readonly events: PlaybackEvents;
  private source: DigitCursor | null = null;
  private instrument: Instrument | null = null;
  private keepAwakeActive = false;

  constructor(
    private readonly soundBank: SoundBank,
    keepAwake: KeepAwakeControl = defaultKeepAwake,
    events: PlaybackEvents = {},
    initialTempoMs = 1000,
  ) {
    this.keepAwake = keepAwake;
    this.events = events;
    this.scheduler = new TempoScheduler({ onTick: () => this.advance() }, initialTempoMs);
  }

  get isPlaying(): boolean {
    return this.scheduler.isRunning;
  }

  get tempoMs(): number {
    return this.scheduler.currentTempoMs;
  }

  get currentInstrument(): Instrument | null {
    return this.instrument;
  }

  /**
   * Begin timed playback from the cursor's current position. Plays the
   * current note immediately (feels responsive on play-press), then advances
   * one digit per tempo interval.
   */
  async start(source: DigitCursor, instrument: Instrument, tempoMs: number): Promise<void> {
    this.source = source;
    await this.setInstrument(instrument);
    this.scheduler.setTempoMs(tempoMs);
    await this.setKeepAwake(true);
    this.scheduler.start();
    this.playCurrent();
  }

  pause(): void {
    this.scheduler.pause();
    this.setKeepAwake(false).catch(() => undefined);
  }

  /** Resume after pause without replaying the current note. */
  resume(): void {
    if (!this.source || !this.instrument) {
      return;
    }
    this.setKeepAwake(true).catch(() => undefined);
    this.scheduler.start();
  }

  async stop(): Promise<void> {
    this.scheduler.stop();
    await this.setKeepAwake(false);
    this.source = null;
  }

  setTempoMs(ms: number): void {
    this.scheduler.setTempoMs(ms);
  }

  async setInstrument(instrument: Instrument): Promise<void> {
    this.instrument = instrument;
    await this.soundBank.loadInstrument(instrument);
  }

  /**
   * Step the cursor by delta digits (the skip buttons: 1/5/10/25/100/1000)
   * and immediately play the landed note — matches the original's prev/next
   * buttons, which both moved and sounded the note.
   */
  stepBy(source: DigitCursor, delta: number): void {
    const steps = Math.floor(Math.abs(delta));
    for (let i = 0; i < steps; i++) {
      const moved = delta >= 0 ? source.moveNext() : source.movePrevious();
      if (!moved) {
        break;
      }
    }
    this.source = source;
    this.playDigit(source.current);
  }

  /** Tap-to-play: sound a specific digit's note without moving the cursor. */
  tapDigit(digit: string): void {
    this.playDigit(digit);
  }

  private advance(): void {
    const source = this.source;
    if (!source) {
      this.stop().catch(() => undefined);
      return;
    }
    if (source.moveNext()) {
      this.playCurrent();
      this.events.onAdvanced?.();
    } else {
      const onEnded = this.events.onEnded;
      this.stop().then(() => onEnded?.()).catch(() => undefined);
    }
  }

  private playCurrent(): void {
    const source = this.source;
    if (source) {
      this.playDigit(source.current);
    }
  }

  private playDigit(digit: string): void {
    if (!this.instrument) {
      return;
    }
    let note;
    try {
      note = noteNameForDigit(digit);
    } catch {
      // Defensive: a corrupt digit file must not break playback.
      return;
    }
    this.soundBank.playNote(note);
  }

  private async setKeepAwake(active: boolean): Promise<void> {
    if (active === this.keepAwakeActive) {
      return;
    }
    this.keepAwakeActive = active;
    try {
      if (active) {
        await this.keepAwake.activate();
      } else {
        await this.keepAwake.deactivate();
      }
    } catch {
      // keep-awake is a nicety; never break playback over it.
    }
  }
}
