// Bloom and SMAA are per-pixel passes (the geometry is cheap), so the road's backbuffer is held
// to a pixel budget on top of spec 4.4's DPR caps: 2 on desktop, 1.5 on touch.
const BACKBUFFER_BUDGET = 3.5e6;

export function roadLayout(width: number, height: number, coarse = window.matchMedia('(pointer: coarse)').matches): { dpr: number } {
  let dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
  const px = Math.max(width * height, 1);
  if (px * dpr * dpr > BACKBUFFER_BUDGET) dpr = Math.max(1, Math.sqrt(BACKBUFFER_BUDGET / px));
  return { dpr };
}
