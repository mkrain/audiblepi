/**
 * On-device pi-digit storage — wires lib/pi-digits.ts to real storage.
 *
 * The WP7 app seeked byte-by-byte into an embedded resource stream
 * (PiStreamIterator). Here, on first launch the bundled txt asset is copied
 * via expo-asset + expo-file-system into the app document directory; reads
 * then go against that file. Byte-range reads use readAsStringAsync with
 * position/length, mirroring PiStreamIterator.ReadBytes.
 *
 * NOTE on expo-file-system v57: the top-level legacy functions throw at
 * runtime ("import from expo-file-system/legacy instead"), so this module
 * imports from 'expo-file-system/legacy' explicitly.
 */

import { Asset } from 'expo-asset';
import {
  copyAsync,
  documentDirectory,
  getInfoAsync,
  readAsStringAsync,
} from 'expo-file-system/legacy';

import { PiService } from './pi-service';
import { DIGIT_ASSET_BASE10, DIGIT_ASSET_BASE12 } from './digit-assets';

const DIGIT_FILE_BASE12 = 'pi-digits-1000000.12.txt';
const DIGIT_FILE_BASE10 = 'pi-digits-1000000.txt';

function documentDir(): string {
  // documentDirectory is null on platforms without one; both our targets
  // (iOS/Android) always provide it.
  if (!documentDirectory) {
    throw new Error('expo-file-system documentDirectory is unavailable');
  }
  return documentDirectory;
}

async function bundledAssetUri(base12: boolean): Promise<string> {
  const asset = Asset.fromModule(base12 ? DIGIT_ASSET_BASE12 : DIGIT_ASSET_BASE10);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  if (!uri) {
    throw new Error('bundled digit asset has no uri');
  }
  return uri;
}

/**
 * Copy the bundled digit file into the document directory on first launch.
 * Idempotent — subsequent calls are a single getInfoAsync.
 *
 * @returns file:// URI of the on-device digit file.
 */
export async function ensureDigitFile(base12: boolean): Promise<string> {
  const target = documentDir() + (base12 ? DIGIT_FILE_BASE12 : DIGIT_FILE_BASE10);
  const info = await getInfoAsync(target);
  if (!info.exists) {
    const source = await bundledAssetUri(base12);
    await copyAsync({ from: source, to: target });
  }
  return target;
}

/** Full read of the on-device digit file (base-12 default, ~955 KB). */
export async function readDigitFile(base12 = true): Promise<string> {
  const uri = await ensureDigitFile(base12);
  return readAsStringAsync(uri, { encoding: 'utf8' });
}

/**
 * Byte-range read of the on-device digit file — the direct equivalent of
 * PiStreamIterator.ReadBytes. Digits are ASCII, so byte offsets == char offsets.
 */
export async function readDigitRange(
  base12: boolean,
  position: number,
  length: number,
): Promise<string> {
  if (!Number.isInteger(position) || position < 0) {
    throw new Error(`position must be a non-negative integer, got ${position}`);
  }
  if (!Number.isInteger(length) || length < 0) {
    throw new Error(`length must be a non-negative integer, got ${length}`);
  }
  const uri = await ensureDigitFile(base12);
  return readAsStringAsync(uri, { encoding: 'utf8', position, length });
}

/**
 * Build the app's PiService backed by the on-device precomputed digit file.
 * Product call: precomputed digits are the default path.
 */
export async function createPiService(): Promise<PiService> {
  const digits = await readDigitFile(true);
  return new PiService(digits);
}
