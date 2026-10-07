import { afterEach, describe, expect, it, vi } from 'vitest';
import { fieldLayout } from './field-layout';

afterEach(() => vi.unstubAllGlobals());

describe('fieldLayout', () => {
  it('keeps the demo glyph size at full screen (1440x900)', () => {
    vi.stubGlobal('devicePixelRatio', 1);
    const l = fieldLayout(1440, 900);
    expect(l.scale).toBeCloseTo(2.7);
    expect(l.gridMul[0]).toBeCloseTo(1.6);
    expect(l.gridMul[1]).toBe(1);
  });
  it('holds the backbuffer near 2.4 megapixels on retina desktops', () => {
    vi.stubGlobal('devicePixelRatio', 2);
    const { dpr } = fieldLayout(1440, 900);
    expect(1440 * 900 * dpr * dpr).toBeLessThanOrEqual(2.4e6 + 1);
    expect(dpr).toBeGreaterThanOrEqual(1);
  });
  it('caps DPR at 1.5 on touch devices', () => {
    vi.stubGlobal('devicePixelRatio', 3);
    expect(fieldLayout(390, 844, true).dpr).toBeLessThanOrEqual(1.5);
  });
});
