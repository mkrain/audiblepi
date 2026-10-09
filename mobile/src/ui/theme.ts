/**
 * Metro-spirited dark theme — a modern take on the WP7 app's look
 * (black background, phone-accent foregrounds, Segoe-like light type).
 */

export const colors = {
  background: '#000000',
  surface: '#141414',
  surfaceRaised: '#1f1f1f',
  text: '#ffffff',
  muted: '#9a9a9a',
  accent: '#1ba1e2', // classic WP7 default accent blue
  accentDim: '#0d5a80',
  danger: '#e81123',
  border: '#2a2a2a',
} as const;

export const fontSizes = {
  tiny: 12,
  small: 14,
  body: 16,
  title: 20,
  hero: 28,
  giant: 72,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;
