/**
 * App-level playback orchestration (Phase 3).
 *
 * Owns the singletons (PiService, SoundBank, PlaybackController) and the
 * digit cursor, and exposes the transport actions the screens call.
 * The zustand player/settings stores stay the reactive UI surface; this
 * module keeps them in sync with the audio engine.
 */

import { PlaybackController } from './audio/playback-controller';
import { SoundBank } from './audio/sound-bank';
import {
  INSTRUMENTS,
  noteNameForDigit,
  type Instrument,
  type NoteName,
} from './lib/notes';
import { PiDigitReader, PiDigitSequence } from './lib/pi-digits';
import { readDigitFile } from './lib/pi-digits-store';
import { PiService } from './lib/pi-service';
import { usePlayerStore } from './state/player';
import { DEFAULT_SETTINGS, useSettingsStore } from './state/settings';

type DigitSource = PiDigitReader | PiDigitSequence;

interface Services {
  piService: PiService;
  controller: PlaybackController;
  soundBank: SoundBank;
  cursor: Cursor;
  digits: string;
}

/**
 * Digit cursor with index tracking and an upper bound (the settings'
 * digit count), satisfying the controller's DigitCursor surface.
 */
class Cursor {
  index = 0;

  constructor(
    private source: DigitSource,
    private bound: number,
  ) {}

  get current(): string {
    return this.source.current;
  }

  get previous(): string {
    return this.source.previous;
  }

  get next(): string {
    return this.source.next;
  }

  get sourceLength(): number {
    return this.source.length;
  }

  /** Playable digit count (1-based for the "digit N of M" counter). */
  get total(): number {
    return Math.min(this.source.length, this.bound + 1);
  }

  moveNext(): boolean {
    if (this.index >= this.bound || this.index >= this.source.length - 1) {
      return false;
    }
    const moved = this.source.moveNext();
    if (moved) {
      this.index += 1;
    }
    return moved;
  }

  movePrevious(): boolean {
    if (this.index <= 0) {
      return false;
    }
    const moved = this.source.movePrevious();
    if (moved) {
      this.index -= 1;
    }
    return moved;
  }

  seek(index: number): number {
    const clamped = Math.max(
      0,
      Math.min(Math.floor(index), this.bound, this.source.length - 1),
    );
    this.index = this.source.seek(clamped);
    return this.index;
  }

  swapSource(source: DigitSource, bound: number): void {
    this.source = source;
    this.bound = bound;
    this.seek(0);
  }

  setBound(bound: number): void {
    this.bound = bound;
    if (this.index > bound) {
      this.seek(bound);
    }
  }
}

let services: Services | null = null;
let calcCancelled = false;

function boundFor(digitCount: number, length: number): number {
  return Math.max(0, Math.min(digitCount, length) - 1);
}

function requireServices(): Services {
  if (!services) {
    throw new Error('playback not initialized — call initApp() first');
  }
  return services;
}

function currentInstrument(): Instrument {
  const { instrumentId } = useSettingsStore.getState();
  return INSTRUMENTS[instrumentId] ?? INSTRUMENTS[0];
}

function syncIndex(): void {
  const s = services;
  if (s) {
    usePlayerStore.setState({ digitIndex: s.cursor.index });
  }
}

function handleEnded(): void {
  const s = services;
  if (!s) {
    return;
  }
  const settings = useSettingsStore.getState();
  if (settings.loopSound) {
    s.cursor.seek(0);
    syncIndex();
    s.controller
      .start(s.cursor, currentInstrument(), settings.tempoMs)
      .then(() => usePlayerStore.getState().setPlaying(true))
      .catch(() => undefined);
  } else {
    usePlayerStore.getState().setPlaying(false);
  }
}

/**
 * One-time app bootstrap. Hydrates persisted settings, loads the precomputed
 * digit file, and wires the audio engine. Screens render only after this
 * resolves (see App.tsx).
 */
export async function initApp(): Promise<void> {
  if (services) {
    return;
  }
  const settings = useSettingsStore.getState();
  settings.hydrate();

  const digits = await readDigitFile(true);
  const piService = new PiService(digits);
  const soundBank = new SoundBank();
  const cursor = new Cursor(
    new PiDigitReader(digits),
    boundFor(settings.digitCount, digits.length),
  );
  const controller = new PlaybackController(soundBank, undefined, {
    onEnded: handleEnded,
    onAdvanced: syncIndex,
  });
  await controller.setInstrument(currentInstrument());

  services = { piService, controller, soundBank, cursor, digits };

  useSettingsStore.subscribe((state, prev) => {
    const s = services;
    if (!s) {
      return;
    }
    if (state.instrumentId !== prev.instrumentId) {
      controller
        .setInstrument(INSTRUMENTS[state.instrumentId] ?? INSTRUMENTS[0])
        .catch(() => undefined);
    }
    if (state.tempoMs !== prev.tempoMs && controller.isPlaying) {
      controller.setTempoMs(state.tempoMs);
    }
    if (state.digitCount !== prev.digitCount) {
      s.cursor.setBound(boundFor(state.digitCount, s.cursor.sourceLength));
      syncIndex();
    }
  });

  usePlayerStore.getState().reset();
}

export function isReady(): boolean {
  return services !== null;
}

/** Note names for the prev/current/next buttons (null when out of range). */
export function getVisibleNotes(): {
  previous: NoteName | null;
  current: NoteName | null;
  next: NoteName | null;
} {
  const s = services;
  if (!s) {
    return { previous: null, current: null, next: null };
  }
  const map = (digit: string): NoteName | null => {
    if (!digit) {
      return null;
    }
    try {
      return noteNameForDigit(digit);
    } catch {
      return null;
    }
  };
  return {
    previous: map(s.cursor.previous),
    current: map(s.cursor.current),
    next: map(s.cursor.next),
  };
}

export function getDigitTotal(): number {
  return services?.cursor.total ?? 0;
}

export async function togglePlay(): Promise<void> {
  const s = requireServices();
  const player = usePlayerStore.getState();
  const settings = useSettingsStore.getState();
  if (player.isPlaying) {
    s.controller.pause();
    player.setPlaying(false);
    return;
  }
  s.cursor.seek(player.digitIndex);
  if (s.cursor.index >= s.cursor.total - 1) {
    s.cursor.seek(0);
  }
  syncIndex();
  await s.controller.start(s.cursor, currentInstrument(), settings.tempoMs);
  player.setPlaying(true);
}

/** Step by the settings' skip amount and sound the landed note. */
export function stepNext(): void {
  const s = requireServices();
  const { skipStep } = useSettingsStore.getState();
  s.controller.stepBy(s.cursor, skipStep);
  syncIndex();
}

export function stepPrevious(): void {
  const s = requireServices();
  const { skipStep } = useSettingsStore.getState();
  s.controller.stepBy(s.cursor, -skipStep);
  syncIndex();
}

/** Tap-to-play one of the visible notes without moving the cursor. */
export function tapNote(which: 'previous' | 'current' | 'next'): void {
  const s = requireServices();
  const digit = s.cursor[which];
  if (digit) {
    s.controller.tapDigit(digit);
  }
}

export function cycleInstrument(): void {
  usePlayerStore.getState().cycleInstrument();
}

export function setInstrumentId(id: number): void {
  useSettingsStore.getState().setInstrumentId(id);
}

/** Public for the settings screen's precomputed toggle. */
export function switchToPrecomputed(): void {
  const s = requireServices();
  s.piService.setUsePrecomputed(true);
  useSettingsStore.getState().setUsePrecomputed(true);
  s.cursor.swapSource(
    new PiDigitReader(s.digits),
    boundFor(DEFAULT_SETTINGS.digitCount, s.digits.length),
  );
  useSettingsStore.getState().setDigitCount(DEFAULT_SETTINGS.digitCount);
  usePlayerStore.getState().reset();
}

/**
 * Run the Machin calculator (the WP7 "Calculating Pi…" flow).
 * Resolves true when the calculated sequence became the active source,
 * false when the user cancelled (precomputed source is kept).
 */
export async function startCalculation(
  rounds: number,
  onProgress: (digitIndex: number) => void,
): Promise<boolean> {
  const s = requireServices();
  calcCancelled = false;
  const wasPlaying = usePlayerStore.getState().isPlaying;
  if (wasPlaying) {
    s.controller.pause();
    usePlayerStore.getState().setPlaying(false);
  }
  s.piService.setUsePrecomputed(false);
  const sequence = await s.piService.calculate('base12', rounds, {
    onDigitCalculated: onProgress,
  });
  if (calcCancelled) {
    switchToPrecomputed();
    return false;
  }
  s.cursor.swapSource(sequence, sequence.length - 1);
  usePlayerStore.getState().reset();
  return true;
}

export function cancelCalculation(): void {
  calcCancelled = true;
  if (services) {
    services.piService.cancel();
  }
}
