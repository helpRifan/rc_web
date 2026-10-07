import { describe, expect, it } from 'vitest';
import { CARD_ASPECT, CARD_H, CROWD, HANG, RAIL, REST_GAP, SIDE, stageLayout } from './stage-layout';

const desktop = { width: 1440, height: 860, textFraction: 0.36, cardMin: 260, cardMax: 340 };

describe('stageLayout', () => {
  it.each([1, 3, 6])('puts the labels where the static CSS formula does, for %i badges', count => {
    const { labelX } = stageLayout({ ...desktop, count });
    const css = (i: number) => 0.36 * 1440 + SIDE + ((0.64 * 1440 - 2 * SIDE) * (i + 0.5)) / count;
    expect(labelX).toHaveLength(count);
    labelX.forEach((x, i) => expect(x).toBeCloseTo(css(i), 6));
  });

  it('keeps every anchor above the stage top', () => {
    for (const height of [640, 860, 920]) {
      const layout = stageLayout({ ...desktop, height, count: 3 });
      const top = height / layout.pxPerUnit / 2;
      for (const [, y] of layout.anchors) expect(y).toBeGreaterThan(top);
    }
  });

  it('clamps the rope to 0.45 to 1 units', () => {
    expect(stageLayout({ ...desktop, height: 2400, count: 3 }).ropeLength).toBe(1);
    expect(stageLayout({ ...desktop, height: 640, count: 3, cardMin: 340 }).ropeLength).toBeGreaterThanOrEqual(0.45);
  });

  it('rests each card 20px above the label rail when the rope allows it', () => {
    const layout = stageLayout({ ...desktop, count: 3 });
    const top = desktop.height / layout.pxPerUnit / 2;
    const restBottom = layout.anchors[0][1] - 3 * layout.ropeLength - HANG;
    expect((top - restBottom) * layout.pxPerUnit).toBeCloseTo(desktop.height - RAIL - REST_GAP, 6);
  });

  it('shrinks crowded cards to keep a 15% gap', () => {
    const layout = stageLayout({ ...desktop, count: 6 });
    const pitch = (0.64 * 1440 - 2 * SIDE) / 6;
    expect(layout.cardPx * CARD_ASPECT * CROWD).toBeCloseTo(pitch, 6);
    expect(layout.pxPerUnit).toBeCloseTo(layout.cardPx / CARD_H, 9);
  });

  it('hangs odd badges 0.3 units further back', () => {
    const { anchors } = stageLayout({ ...desktop, count: 4 });
    expect(anchors.map(a => a[2])).toEqual([0, -0.3, 0, -0.3]);
  });

  it('frames the stage height exactly at z = 0', () => {
    const layout = stageLayout({ ...desktop, count: 3 });
    const visibleH = 2 * layout.cameraZ * Math.tan((10 * Math.PI) / 180);
    expect(visibleH * layout.pxPerUnit).toBeCloseTo(desktop.height, 6);
  });
});
