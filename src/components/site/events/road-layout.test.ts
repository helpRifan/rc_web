import { afterEach, describe, expect, it, vi } from 'vitest';
import { hexToInt, PALETTE, tintOnBg } from '@/lib/palette';
import { roadLayout } from './road-layout';
import { ROAD_OPTIONS } from './road-options';

afterEach(() => vi.unstubAllGlobals());

describe('roadLayout', () => {
  it('holds the backbuffer under 3.5 megapixels on a retina desktop', () => {
    vi.stubGlobal('devicePixelRatio', 2);
    const { dpr } = roadLayout(1440, 792, false);
    expect(1440 * 792 * dpr * dpr).toBeLessThanOrEqual(3.5e6 + 1);
    expect(dpr).toBeGreaterThanOrEqual(1);
  });

  it('caps DPR at 1.5 on touch devices', () => {
    vi.stubGlobal('devicePixelRatio', 3);
    expect(roadLayout(390, 743, true).dpr).toBeLessThanOrEqual(1.5);
  });
});

describe('road colours', () => {
  it('composites a tint over the page background', () => {
    expect(tintOnBg(PALETTE.muted, 0)).toBe(hexToInt(PALETTE.bg));
    expect(tintOnBg(PALETTE.muted, 1)).toBe(hexToInt(PALETTE.muted));
    expect(tintOnBg(PALETTE.muted, 0.06)).toBe(0x181819);
  });

  it('uses palette colours for every light', () => {
    const palette = new Set(Object.values(PALETTE).map(hexToInt));
    const { colors } = ROAD_OPTIONS;
    for (const light of [...colors!.leftCars, ...colors!.rightCars, colors!.sticks, colors!.roadColor, colors!.background]) {
      expect(palette.has(light)).toBe(true);
    }
  });
});
