// The glyph print: a still of the homepage field, seeded per person, drawn the way the FaultyTerminal
// shader draws a glyph (team brief 5.5). The same slug always gives the same print, on the badge, the
// sphere tile and the static HTML badge.

/** FNV-1a, 32-bit. */
export function hashSeed(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32: a small, fast seeded generator, returning [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LATTICE = 3;
const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * Intensity (0 to 1) per cell, row by row: smooth lattice noise every 3 cells, brightest towards the
 * top-right corner like the hero's halo, through the shader's own `n * 1.3 - 0.03` curve.
 */
export function glyphField(seed: string, cols: number, rows: number): Float32Array {
  const random = mulberry32(hashSeed(seed));
  const lw = Math.ceil(cols / LATTICE) + 2;
  const lh = Math.ceil(rows / LATTICE) + 2;
  const lattice = Float32Array.from({ length: lw * lh }, () => random());
  const at = (x: number, y: number) => lattice[y * lw + x];
  const maxDistance = Math.hypot(cols, rows);
  const field = new Float32Array(cols * rows);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const fx = c / LATTICE;
      const fy = r / LATTICE;
      const x0 = Math.floor(fx);
      const y0 = Math.floor(fy);
      const tx = smooth(fx - x0);
      const ty = smooth(fy - y0);
      const top = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * tx;
      const bottom = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * tx;
      const noise = top + (bottom - top) * ty;
      const distance = Math.hypot(cols - (c + 0.5), r + 0.5);
      const bias = 0.35 + 0.65 * (1 - distance / maxDistance);
      field[r * cols + c] = Math.min(Math.max(noise * bias * 1.3 - 0.03, 0), 1);
    }
  }
  return field;
}

/** Whether the sub-square at (i, j), each -2 to 2 from the cell centre, is lit: the shader's `step(0.1, intensity - f)`. */
export function glyphOn(intensity: number, i: number, j: number): boolean {
  return intensity - (i * i + j * j) * 0.0625 > 0.1;
}

/** Each lit sub-square of a print `cols` cells wide over a `width` x `height` area, as [x, y, size]. */
export function glyphSquares(seed: string, cols: number, width: number, height: number): [number, number, number][] {
  const cell = width / cols;
  const rows = Math.max(1, Math.round(height / cell));
  const field = glyphField(seed, cols, rows);
  const sub = cell / 5;
  const size = sub * 0.82;
  const inset = (sub - size) / 2;
  const squares: [number, number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const intensity = field[r * cols + c];
      if (intensity <= 0.1) continue;
      for (let j = -2; j <= 2; j++) {
        for (let i = -2; i <= 2; i++) {
          if (glyphOn(intensity, i, j)) squares.push([c * cell + (i + 2) * sub + inset, r * cell + (j + 2) * sub + inset, size]);
        }
      }
    }
  }
  return squares;
}
