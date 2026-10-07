/** The club logo palette (spec 4.1). The only colours allowed anywhere on the site. */
export const PALETTE = {
  bg: '#0D0D0D',
  ink: '#FFFFFF',
  text: '#E5E8EB',
  muted: '#BFC7CE',
  accent: '#619AC3',
  accentDeep: '#4A8DB7',
} as const;

/** A palette hex as the 0xRRGGBB number WebGL APIs take. */
export const hexToInt = (hex: string): number => parseInt(hex.slice(1), 16);

/**
 * A palette colour composited over the page background at `alpha`, as 0xRRGGBB for WebGL, which
 * can't take rgba (spec 4.1: tints only).
 */
export function tintOnBg(hex: string, alpha: number): number {
  const c = hexToInt(hex);
  const b = hexToInt(PALETTE.bg);
  const mix = (shift: number) => Math.round(((b >> shift) & 255) + (((c >> shift) & 255) - ((b >> shift) & 255)) * alpha);
  return (mix(16) << 16) | (mix(8) << 8) | mix(0);
}
