type Vec2 = [number, number];

// The React Bits demo was tuned in a 500px-tall box (scale 1.5, gridMul [2, 1]).
// Deriving both from the viewport keeps that glyph size at full screen (owner-approved prototype).
const DEMO_BOX_HEIGHT = 500;
const BACKBUFFER_BUDGET = 2.4e6; // the shader runs digit() 10x per pixel

export function fieldLayout(width: number, height: number, coarse = false): { dpr: number; scale: number; gridMul: Vec2 } {
  const safeH = Math.max(height, 1);
  const k = Math.min(Math.max(safeH / DEMO_BOX_HEIGHT, 1), 3);
  const cap = coarse ? 1.5 : 2;
  let dpr = Math.min(window.devicePixelRatio || 1, cap);
  if (width * height * dpr * dpr > BACKBUFFER_BUDGET) dpr = Math.max(1, Math.sqrt(BACKBUFFER_BUDGET / Math.max(width * height, 1)));
  return { dpr, scale: 1.5 * k, gridMul: [Math.max(width, 1) / safeH, 1] };
}
