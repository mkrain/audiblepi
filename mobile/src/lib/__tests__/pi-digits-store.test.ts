/**
 * pi-digits-store tests. The expo-asset / expo-file-system modules are
 * mocked, but readAsStringAsync is backed by the REAL bundled digit file
 * read from disk — so the byte-seek assertions verify true behavior
 * against the actual asset content.
 */
import * as fs from 'fs';
import * as path from 'path';

import { PiDigitReader } from '../pi-digits';
import { createPiService, ensureDigitFile, readDigitFile, readDigitRange } from '../pi-digits-store';

jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn((_id: number) => ({
      downloadAsync: jest.fn().mockResolvedValue(undefined),
      localUri: 'file:///bundled/1000000.12.txt',
      uri: null,
    })),
  },
}));

jest.mock('../digit-assets', () => ({
  DIGIT_ASSET_BASE12: 1001,
  DIGIT_ASSET_BASE10: 1002,
}));

const REAL_DIGITS_PATH = path.join(__dirname, '../../../assets/data/1000000.12.txt');
const realDigits: string = fs.readFileSync(REAL_DIGITS_PATH, 'utf8');

jest.mock('expo-file-system/legacy', () => {
  // In-memory stand-in for the document directory. require() is lazy here,
  // so it is allowed inside the mock factory (unlike top-level imports).
  const mockFs = require('fs') as typeof import('fs');
  const mockPath = require('path') as typeof import('path');
  const mockRealDigits: string = mockFs.readFileSync(
    mockPath.join(__dirname, '../../../assets/data/1000000.12.txt'),
    'utf8',
  );
  const files = new Map<string, string>();
  return {
    documentDirectory: 'file:///documents/',
    getInfoAsync: jest.fn(async (uri: string) => ({ exists: files.has(uri), uri })),
    copyAsync: jest.fn(async ({ to }: { from: string; to: string }) => {
      // The "bundled" copy source is the real asset on disk.
      files.set(to, mockRealDigits);
    }),
    readAsStringAsync: jest.fn(
      async (uri: string, options?: { position?: number; length?: number }) => {
        const content = files.get(uri) ?? '';
        if (options?.length !== undefined) {
          const position = options.position ?? 0;
          return content.slice(position, position + options.length);
        }
        return content;
      },
    ),
  };
});

import { copyAsync, getInfoAsync, readAsStringAsync } from 'expo-file-system/legacy';

const mockedCopy = copyAsync as unknown as jest.Mock;
const mockedInfo = getInfoAsync as unknown as jest.Mock;
const mockedRead = readAsStringAsync as unknown as jest.Mock;

describe('pi-digits-store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ensureDigitFile copies the bundled asset on first launch only', async () => {
    const first = await ensureDigitFile(true);
    expect(first).toBe('file:///documents/pi-digits-1000000.12.txt');
    expect(mockedCopy).toHaveBeenCalledTimes(1);
    expect(mockedCopy).toHaveBeenCalledWith({
      from: 'file:///bundled/1000000.12.txt',
      to: 'file:///documents/pi-digits-1000000.12.txt',
    });

    // Second call: file exists, no copy.
    const second = await ensureDigitFile(true);
    expect(second).toBe(first);
    expect(mockedCopy).toHaveBeenCalledTimes(1);
    expect(mockedInfo).toHaveBeenCalledWith('file:///documents/pi-digits-1000000.12.txt');
  });

  test('readDigitRange byte-seeks against the real asset content', async () => {
    expect(await readDigitRange(true, 0, 12)).toBe(realDigits.slice(0, 12));
    expect(await readDigitRange(true, 1000, 8)).toBe(realDigits.slice(1000, 1008));
    // The base-12 file starts with "3" (the integer part), like the original.
    expect(await readDigitRange(true, 0, 1)).toBe('3');
    // Tail of the file.
    const tail = await readDigitRange(true, realDigits.length - 5, 5);
    expect(tail).toBe(realDigits.slice(-5));
  });

  test('byte ranges line up with PiDigitReader windows', async () => {
    const reader = new PiDigitReader(realDigits);
    for (const index of [0, 1, 42, 99999, realDigits.length - 1]) {
      reader.seek(index);
      const expected = realDigits.slice(index, index + 3);
      const actual = await readDigitRange(true, index, 3);
      // At the final index fewer than 3 bytes remain; slice handles that.
      expect(actual).toBe(expected);
      expect(reader.current).toBe(realDigits[index]);
    }
  });

  test('readDigitRange validates position/length', async () => {
    await expect(readDigitRange(true, -1, 5)).rejects.toThrow();
    await expect(readDigitRange(true, 1.5, 5)).rejects.toThrow();
    await expect(readDigitRange(true, 0, -2)).rejects.toThrow();
    expect(mockedRead).not.toHaveBeenCalled();
  });

  test('readDigitFile returns the full on-device content', async () => {
    const content = await readDigitFile(true);
    expect(content).toBe(realDigits);
    expect(content.length).toBe(955187);
  });

  test('createPiService builds a precomputed PiService from storage', async () => {
    const service = await createPiService();
    expect(service.isPrecomputed).toBe(true);
    expect(service.supportedDigitCounts).toEqual([realDigits.length]);

    const reader = await service.calculate('base12', realDigits.length);
    expect(reader.current).toBe('3');
  });
});
