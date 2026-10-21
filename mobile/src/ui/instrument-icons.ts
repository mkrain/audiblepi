/**
 * Static Metro requires for the instrument icons extracted from the WP7
 * project (mobile/assets/images/). Kept in one module so screens and tests
 * share the same mapping; Metro requires must be literals, hence the record.
 */

import type { ImageSourcePropType } from 'react-native';

/** Instrument id (matches INSTRUMENTS ordering) -> icon image. */
export const INSTRUMENT_ICONS: Record<number, ImageSourcePropType> = {
  0: require('../../assets/images/Xylophone.Icon.png'),
  1: require('../../assets/images/Classical.Guitar.Icon.png'),
  2: require('../../assets/images/Piano.Icon.png'),
  3: require('../../assets/images/Sax.Icon.png'),
  4: require('../../assets/images/Violin.Icon.png'),
};

export function iconForInstrument(id: number): ImageSourcePropType {
  return INSTRUMENT_ICONS[id] ?? INSTRUMENT_ICONS[0];
}
