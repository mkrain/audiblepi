/**
 * Preloaded per-instrument WAV bank — the modern equivalent of the WP7 app's
 * XNA SoundEffect fire-and-forget playback (PiViewModel.PlaySelectedPiSound /
 * SoundEffectAction.Invoke).
 *
 * One expo-av Audio.Sound per note (12 per instrument). Each note owns its
 * Sound object, so overlapping notes at fast tempos (down to 125 ms) play
 * concurrently without cutting each other off — the same behavior the
 * original got from SoundEffect.Play().
 */

import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';

import { NOTE_NAMES } from '../lib/notes';
import type { Instrument, NoteName } from '../lib/notes';
import { INSTRUMENT_ASSETS } from './instrument-assets';

export class SoundBank {
  private readonly sounds = new Map<NoteName, Audio.Sound>();
  private loadedInstrument: Instrument | null = null;
  /** Monotonic token so a superseded load can't clobber a newer one. */
  private loadToken = 0;

  get currentInstrument(): Instrument | null {
    return this.loadedInstrument;
  }

  get isLoaded(): boolean {
    return this.sounds.size > 0;
  }

  /**
   * Preload the 12 WAVs for an instrument. No-op if it's already loaded.
   * Loading is lazy per instrument switch, keeping memory flat — only one
   * instrument's samples are resident at a time.
   */
  async loadInstrument(instrument: Instrument): Promise<void> {
    if (this.loadedInstrument?.id === instrument.id && this.sounds.size > 0) {
      return;
    }
    const token = ++this.loadToken;

    // NB: performUnload, not unload() — unload() bumps the token, which
    // would make the superseded-load check below always trip.
    await this.performUnload();

    const manifest = INSTRUMENT_ASSETS[instrument.directory];
    if (!manifest) {
      throw new Error(`no audio manifest for instrument directory "${instrument.directory}"`);
    }

    // Match the original's playback setup: audible even with the iOS
    // silent switch on; never take over background audio.
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    const entries = await Promise.all(
      NOTE_NAMES.map(async (name): Promise<readonly [NoteName, Audio.Sound]> => {
        const asset = Asset.fromModule(manifest[name]);
        await asset.downloadAsync();
        const uri = asset.localUri ?? asset.uri;
        if (!uri) {
          throw new Error(`asset has no uri for ${instrument.directory}/${name}`);
        }
        const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: false });
        return [name, sound] as const;
      }),
    );

    // A newer loadInstrument call superseded this one; drop our sounds.
    if (token !== this.loadToken) {
      await Promise.all(entries.map(([, sound]) => sound.unloadAsync().catch(() => undefined)));
      return;
    }

    for (const [name, sound] of entries) {
      this.sounds.set(name, sound);
    }
    this.loadedInstrument = instrument;
  }

  /**
   * Fire-and-forget playback of a note. Uses replayAsync (stop + rewind +
   * play) so rapid re-triggers of the same note restart the clip instead of
   * stacking silently. Never throws — a missing/unloaded note is a no-op,
   * mirroring the original's best-effort SoundEffect.Play().
   */
  playNote(name: NoteName): void {
    const sound = this.sounds.get(name);
    if (!sound) {
      return;
    }
    sound.replayAsync().catch(() => {
      // Best-effort playback; a failed clip must never break the scheduler.
    });
  }

  async unload(): Promise<void> {
    this.loadToken++;
    await this.performUnload();
  }

  private async performUnload(): Promise<void> {
    this.loadedInstrument = null;
    const sounds = [...this.sounds.values()];
    this.sounds.clear();
    await Promise.all(sounds.map((sound) => sound.unloadAsync().catch(() => undefined)));
  }
}
