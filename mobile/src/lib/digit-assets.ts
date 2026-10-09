/**
 * Bundled pi-digit asset references, isolated in their own module so tests
 * can mock them without pulling Metro's asset system into Jest.
 *
 * Requires 'txt' in metro.config.js assetExts (added for Phase 2).
 */
export const DIGIT_ASSET_BASE12: number = require('../../assets/data/1000000.12.txt');
export const DIGIT_ASSET_BASE10: number = require('../../assets/data/1000000.txt');
