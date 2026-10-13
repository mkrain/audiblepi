/**
 * Preloaded per-instrument WAV bank — the modern equivalent of the WP7 app's
 * XNA SoundEffect fire-and-forget playback (PiViewModel.PlaySelectedPiSound /
 * SoundEffectAction.Invoke).
 *
 * One expo-audio AudioPlayer per note (12 per instrument). Each note owns its
 * player, so overlapping notes at fast tempos (down to 125 ms) play
 * concurrently without cutting each other off — the same behavior the
 * original got from SoundEffect.Play().
 *
 * NB: this was built on expo-av, but expo-av is deprecated and its final
 * release is incompatible with Expo SDK 57 — it imports
 * <ExpoModulesCore/EXEventEmitter.h>, which expo-modules-core removed in its
 * Objective-C → Swift migration. expo-audio is the maintained replacement.
 */

import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import { Asset } from 'expo-asset';

import { NOTE_NAMES } from '../lib/notes';
import type { Instrument, NoteName } from '../lib/notes';
import { INSTRUMENT_ASSETS } from './instrument-assets';

export class SoundBank {
  private readonly players = new Map<NoteName, AudioPlayer>();
  private loadedInstrument: Instrument | null = null;
  /** Monotonic token so a superseded load can't clobber a newer one. */
  private loadToken = 0;

  get currentInstrument(): Instrument | null {
    return this.loadedInstrument;
  }

  get isLoaded(): boolean {
    return this.players.size > 0;
  }

  /**
   * Preload the 12 WAVs for an instrument. No-op if it's already loaded.
   * Loading is lazy per instrument switch, keeping memory flat — only one
   * instrument's samples are resident at a time.
   */
  async loadInstrument(instrument: Instrument): Promise<void> {
    if (this.loadedInstrument?.id === instrument.id && this.players.size > 0) {
      return;
    }
    const token = ++this.loadToken;

    this.performUnload();

    const manifest = INSTRUMENT_ASSETS[instrument.directory];
    if (!manifest) {
      throw new Error(`no audio manifest for instrument directory "${instrument.directory}"`);
    }

    // Match the original's playback setup: audible even with the iOS
    // silent switch on; never take over background audio.
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'duckOthers',
    });

    const entries = await Promise.all(
      NOTE_NAMES.map(async (name): Promise<readonly [NoteName, AudioPlayer]> => {
        const asset = Asset.fromModule(manifest[name]);
        await asset.downloadAsync();
        const uri = asset.localUri ?? asset.uri;
        if (!uri) {
          throw new Error(`asset has no uri for ${instrument.directory}/${name}`);
        }
        const player = createAudioPlayer({ uri });
        return [name, player] as const;
      }),
    );

    // A newer loadInstrument call superseded this one; drop our players.
    if (token !== this.loadToken) {
      for (const [, player] of entries) {
        try {
          player.remove();
        } catch {
          // Best-effort; a failed release must never break the scheduler.
        }
      }
      return;
    }

    for (const [name, player] of entries) {
      this.players.set(name, player);
    }
    this.loadedInstrument = instrument;
  }

  /**
   * Fire-and-forget playback of a note. Seeks to the start and plays, so
   * rapid re-triggers of the same note restart the clip instead of stacking
   * silently. Never throws — a missing/unloaded note is a no-op, mirroring
   * the original's best-effort SoundEffect.Play().
   */
  playNote(name: NoteName): void {
    const player = this.players.get(name);
    if (!player) {
      return;
    }
    player
      .seekTo(0)
      .then(() => player.play())
      .catch(() => {
        // Best-effort playback; a failed clip must never break the scheduler.
      });
  }

  async unload(): Promise<void> {
    this.loadToken++;
    this.performUnload();
  }

  private performUnload(): void {
    this.loadedInstrument = null;
    const players = [...this.players.values()];
    this.players.clear();
    for (const player of players) {
      try {
        player.remove();
      } catch {
        // Best-effort; a failed release must never break the scheduler.
      }
    }
  }
}
