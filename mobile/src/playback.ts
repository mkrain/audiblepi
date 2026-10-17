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
import { yieldToEventLoop } from './lib/big-number';
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

  /** Peek at the digit at an absolute index without moving the cursor. */
  peekDigitAt(index: number): string {
    if (index < 0 || index >= this.source.length) {
      return '';
    }
    return this.source.digitAt(index);
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

  // Calculated digits don't survive app restart — the computation is
  // session-only. Reset to precomputed so the toggle matches reality.
  if (!settings.usePrecomputed) {
    settings.setUsePrecomputed(true);
  }
  // The digit count may be a stale computed value (1K/10K/50K); restore the
  // precomputed default.
  if (settings.digitCount !== DEFAULT_SETTINGS.digitCount) {
    settings.setDigitCount(DEFAULT_SETTINGS.digitCount);
  }

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
        .catch((error) => {
          console.warn('[playback] instrument switch failed', error);
        });
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

/** Map a raw digit char to a note name, or null when missing/invalid. */
function noteForDigitChar(digit: string): NoteName | null {
  if (!digit) {
    return null;
  }
  try {
    return noteNameForDigit(digit);
  } catch {
    return null;
  }
}

export interface StripNote {
  /** Offset from the cursor (-2..+2); 0 is the current note. */
  offset: number;
  /** 0-based absolute digit index. */
  digitIndex: number;
  note: NoteName | null;
}

/**
 * Five notes centered on the cursor for the tappable note strip.
 * Out-of-range slots have note: null.
 */
export function getNoteStrip(): StripNote[] {
  const s = services;
  if (!s) {
    return [];
  }
  const result: StripNote[] = [];
  for (let offset = -2; offset <= 2; offset++) {
    const digitIndex = s.cursor.index + offset;
    result.push({
      offset,
      digitIndex,
      note: noteForDigitChar(s.cursor.peekDigitAt(digitIndex)),
    });
  }
  return result;
}

/**
 * The next `count` notes after the cursor for the "up next" roll.
 * Out-of-range slots have note: null.
 */
export function getUpcomingNotes(count: number): StripNote[] {
  const s = services;
  if (!s) {
    return [];
  }
  const result: StripNote[] = [];
  for (let i = 1; i <= count; i++) {
    const digitIndex = s.cursor.index + i;
    result.push({
      offset: i,
      digitIndex,
      note: noteForDigitChar(s.cursor.peekDigitAt(digitIndex)),
    });
  }
  return result;
}

/** Tap-to-play the note at an offset from the cursor without moving it. */
export function tapNoteAt(offset: number): void {
  const s = requireServices();
  const digit = s.cursor.peekDigitAt(s.cursor.index + offset);
  if (digit) {
    s.controller.tapDigit(digit);
  }
}

/** Seek the cursor to an absolute digit index (for the scrubber). */
export function seekToDigit(index: number): void {
  const s = requireServices();
  s.cursor.seek(index);
  syncIndex();
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
  // Cancel any in-flight calculation first — otherwise it keeps hogging the
  // JS thread after we've switched back.
  cancelCalculation();
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
 * Start the Machin calculator in the background. Returns immediately —
 * the computation runs async and the cursor source is swapped when it
 * completes. Progress is reported via the callbacks for the Player screen
 * to display. Call cancelBackgroundCalculation() to stop early and lock in
 * partial digits.
 *
 * Two-phase: first computes a small starter set (fast) so the user can play
 * immediately, then computes the full requested digits in the background.
 */
export function startBackgroundCalculation(
  rounds: number,
  onProgress: (digitIndex: number) => void,
  onArcTanProgress?: (divisor: number) => void,
  onComplete?: (completed: boolean) => void,
): void {
  const s = requireServices();
  calcCancelled = false;
  const wasPlaying = usePlayerStore.getState().isPlaying;
  if (wasPlaying) {
    s.controller.pause();
    usePlayerStore.getState().setPlaying(false);
  }
  s.piService.setUsePrecomputed(false);

  // Throttle progress updates — the arctan fires per-term, which would be
  // tens of thousands of React re-renders. Update at most every 100ms.
  let lastProgressUpdate = 0;
  const throttledArcTan = onArcTanProgress
    ? (divisor: number) => {
        const now = Date.now();
        if (now - lastProgressUpdate >= 100) {
          lastProgressUpdate = now;
          onArcTanProgress(divisor);
        }
      }
    : undefined;

  (async () => {
    await yieldToEventLoop();

    // Phase 1: Quick starter digits so the user can play immediately.
    // 100 digits computes in milliseconds.
    const starterRounds = Math.min(100, rounds);
    const starter = await s.piService.calculate('base12', starterRounds, {
      onDigitCalculated: onProgress,
      onArcTanDivisorCalculated: throttledArcTan
        ? ({ divisor }) => throttledArcTan(divisor)
        : undefined,
    });
    if (calcCancelled) {
      onComplete?.(false);
      return;
    }
    // Swap to starter digits immediately — user can play now.
    s.cursor.swapSource(starter, starter.length - 1);
    usePlayerStore.getState().reset();

    // Phase 2: Full computation in background (skip if starter was the full request).
    if (starterRounds >= rounds) {
      onComplete?.(true);
      return;
    }
    const full = await s.piService.calculate('base12', rounds, {
      onDigitCalculated: onProgress,
      onArcTanDivisorCalculated: throttledArcTan
        ? ({ divisor }) => throttledArcTan(divisor)
        : undefined,
    });
    if (calcCancelled) {
      onComplete?.(false);
      return;
    }
    // Preserve cursor position when swapping to full digits.
    const pos = s.cursor.index;
    s.cursor.swapSource(full, full.length - 1);
    s.cursor.seek(Math.min(pos, full.length - 1));
    usePlayerStore.getState().reset();
    onComplete?.(true);
  })().catch(() => undefined);
}

/**
 * Stop the background computation and lock in whatever digits were computed
 * so far. The cursor source is swapped to the partial sequence.
 */
export function cancelBackgroundCalculation(): void {
  calcCancelled = true;
  const s = services;
  if (!s) {
    return;
  }
  s.piService.cancel();
  // Extract partial digits from the interrupted computation.
  const partial = s.piService.extractPartialDigits('base12');
  if (partial && partial.length > 10) {
    s.cursor.swapSource(partial, partial.length - 1);
    usePlayerStore.getState().reset();
  }
}

/**
 * Legacy: Run the Machin calculator (the WP7 "Calculating Pi…" flow).
 * Resolves true when the calculated sequence became the active source,
 * false when the user cancelled (precomputed source is kept).
 * @deprecated Use startBackgroundCalculation for the new UX.
 */
export async function startCalculation(
  rounds: number,
  onProgress: (digitIndex: number) => void,
  onArcTanProgress?: (divisor: number) => void,
): Promise<boolean> {
  return new Promise((resolve) => {
    startBackgroundCalculation(rounds, onProgress, onArcTanProgress, (completed) => {
      if (!completed) {
        switchToPrecomputed();
      }
      resolve(completed);
    });
  });
}

export function cancelCalculation(): void {
  cancelBackgroundCalculation();
}
