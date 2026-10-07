// What a club ID badge prints, and how it's drawn (team brief 5.5). Pure functions over a 2D canvas,
// shared by the WebGL badges, the profile badge and the sphere tiles. `bandFor` and the constants
// are also read by the static HTML badge, so this file never touches the DOM at import time.
import { encode } from 'uqr';
import { glyphSquares } from './glyph-print';

export type BadgeBand = {
  fill: string;
  text: string;
  label: string;
  /** Right-aligned on the front band: the division, for core members. */
  right: string | null;
  /** Alumni bands are dark, with a thin light rule along the top. */
  rule: boolean;
};

export type BadgeFace = {
  slug: string;
  name: string;
  role: string | null;
  initials: string;
  band: BadgeBand;
  joinedYear: number | null;
};

export type BadgeAssets = {
  /** The page's Archivo family, as computed from the body. */
  family: string;
  logo: CanvasImageSource | null;
  photo: CanvasImageSource | null;
  /** QR modules for the profile link (with its quiet zone), or null when there's no public https site. */
  qr: boolean[][] | null;
};

export type FaceDrawer = (ctx: CanvasRenderingContext2D, width: number, height: number) => void;

const INK = '#FFFFFF';
const TEXT = '#E5E8EB';
const MUTED = '#BFC7CE';
const BG = '#0D0D0D';

/** The band by level (team brief 5.5): Board blue, core light, members grey, alumni dark. */
export function bandFor(level: string, division: string, divisionLabel: string | null): BadgeBand {
  if (division === 'alumni') return { fill: BG, text: MUTED, label: 'Alumni', right: null, rule: true };
  if (level === 'board') return { fill: '#619AC3', text: BG, label: 'Board', right: null, rule: false };
  if (level === 'head' || level === 'lead' || level === 'core') return { fill: TEXT, text: BG, label: 'Core team', right: divisionLabel, rule: false };
  return { fill: MUTED, text: BG, label: 'Member', right: divisionLabel, rule: false };
}

/** The profile link the QR encodes, or null unless the site has a public https address. */
export function qrTarget(siteUrl: string | undefined, slug: string): string | null {
  if (!siteUrl) return null;
  try {
    const url = new URL(siteUrl);
    if (url.protocol !== 'https:' || url.hostname === 'localhost' || url.hostname === '127.0.0.1') return null;
    return new URL(`/team/${slug}`, url).toString();
  } catch {
    return null;
  }
}

/** QR modules with a 2-module quiet zone, error correction M. */
export function qrModules(text: string): boolean[][] {
  return encode(text, { ecc: 'M', border: 2 }).data;
}

type Stretch = 'normal' | 'semi-expanded' | 'expanded';

function setFont(ctx: CanvasRenderingContext2D, family: string, weight: number, px: number, stretch: Stretch = 'normal') {
  ctx.font = `${weight} ${stretch === 'normal' ? '' : `${stretch} `}${px}px ${family}`;
  if ('fontStretch' in ctx) (ctx as CanvasRenderingContext2D & { fontStretch: string }).fontStretch = stretch;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** The text cut to `max` px wide, with an ellipsis when it had to be cut. */
function ellipsise(ctx: CanvasRenderingContext2D, text: string, max: number): string {
  if (ctx.measureText(text).width <= max) return text;
  let cut = text;
  while (cut.length > 1 && ctx.measureText(`${cut}…`).width > max) cut = cut.slice(0, -1);
  return `${cut.trimEnd()}…`;
}

/** The card's dark base, its blue corner light and its hairline (both faces). */
function drawBase(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);
  // 145 degrees: from the top-right corner towards the bottom-left, fading out by 60%.
  const gradient = ctx.createLinearGradient(W, 0, W - H * 0.6 * Math.sin((35 * Math.PI) / 180), H * 0.6 * Math.cos((35 * Math.PI) / 180));
  gradient.addColorStop(0, 'rgba(74, 141, 183, 0.22)');
  gradient.addColorStop(1, 'rgba(13, 13, 13, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);
  roundRect(ctx, W * 0.025, W * 0.025, W * 0.95, H - W * 0.05, W * 0.05);
  ctx.lineWidth = W * 0.006;
  ctx.strokeStyle = 'rgba(191, 199, 206, 0.45)';
  ctx.stroke();
}

function drawBand(ctx: CanvasRenderingContext2D, W: number, H: number, family: string, band: BadgeBand, left: string | null, right: string | null) {
  const top = H - W * 0.12;
  ctx.fillStyle = band.fill;
  ctx.fillRect(0, top, W, H - top);
  if (band.rule) {
    ctx.fillStyle = MUTED;
    ctx.fillRect(0, top, W, W * 0.004);
  }
  ctx.fillStyle = band.text;
  setFont(ctx, family, 700, W * 0.045, 'semi-expanded');
  ctx.textBaseline = 'alphabetic';
  if (left) {
    ctx.textAlign = 'left';
    ctx.fillText(left, W * 0.08, H - W * 0.045);
  }
  if (right) {
    ctx.textAlign = 'right';
    ctx.fillText(ellipsise(ctx, right, W * 0.5), W * 0.92, H - W * 0.045);
  }
  ctx.textAlign = 'left';
}

/** Draws `image` to cover the box, centred. */
function drawCover(ctx: CanvasRenderingContext2D, image: CanvasImageSource, x: number, y: number, w: number, h: number) {
  const iw = (image as HTMLImageElement).naturalWidth || (image as HTMLCanvasElement).width;
  const ih = (image as HTMLImageElement).naturalHeight || (image as HTMLCanvasElement).height;
  if (!iw || !ih) return;
  const scale = Math.max(w / iw, h / ih);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(image, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, w, h);
}

/**
 * The glyph print over a box, then the initials over it (team brief 5.5): the homepage field's
 * glyphs, seeded by slug, brighter at the top, with the letters cut out of the print in the dark.
 */
export function drawGlyphWindow(
  ctx: CanvasRenderingContext2D,
  family: string,
  seed: string,
  letters: string,
  x: number,
  y: number,
  w: number,
  h: number,
  { cols = 12, strokeWidth }: { cols?: number; strokeWidth: number },
) {
  const gradient = ctx.createLinearGradient(0, y, 0, y + h);
  gradient.addColorStop(0, 'rgba(97, 154, 195, 0.95)');
  gradient.addColorStop(1, 'rgba(97, 154, 195, 0.25)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  for (const [sx, sy, size] of glyphSquares(seed, cols, w, h)) ctx.rect(x + sx, y + sy, size, size);
  ctx.fill();
  if (!letters) return;

  setFont(ctx, family, 800, 100, 'expanded');
  const widthAt100 = ctx.measureText(letters).width || 1;
  const px = letters.length > 1 ? Math.min(((w * 0.7) / widthAt100) * 100, h * 0.5) : h * 0.55;
  setFont(ctx, family, 800, px, 'expanded');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const baseline = y + h - h * 0.12;
  ctx.lineJoin = 'round';
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = BG;
  ctx.strokeText(letters, x + w / 2, baseline);
  ctx.fillStyle = INK;
  ctx.fillText(letters, x + w / 2, baseline);
  ctx.textAlign = 'left';
}

/** The club header: logo, "Robotics Club", "VIT Chennai". */
function drawHeader(ctx: CanvasRenderingContext2D, W: number, family: string, logo: CanvasImageSource | null) {
  if (logo) ctx.drawImage(logo, W * 0.08, W * 0.16, W * 0.1, W * 0.1);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = INK;
  setFont(ctx, family, 700, W * 0.052, 'semi-expanded');
  ctx.fillText('Robotics Club', W * 0.21, W * 0.205);
  ctx.fillStyle = MUTED;
  setFont(ctx, family, 500, W * 0.04);
  ctx.fillText('VIT Chennai', W * 0.21, W * 0.25);
}

/** Splits a name for the badge: one line if it fits at the smallest size, else two at the last space. */
function fitName(ctx: CanvasRenderingContext2D, family: string, name: string, W: number): { px: number; lines: string[] } {
  const max = W * 0.84;
  for (let px = W * 0.115; px >= W * 0.068; px *= 0.98) {
    setFont(ctx, family, 800, px, 'expanded');
    if (ctx.measureText(name).width <= max) return { px, lines: [name] };
  }
  const space = name.lastIndexOf(' ');
  const px = W * 0.068;
  return { px, lines: space > 0 ? [name.slice(0, space), name.slice(space + 1)] : [name] };
}

export function drawBadgeFront(ctx: CanvasRenderingContext2D, W: number, H: number, face: BadgeFace, assets: BadgeAssets) {
  const { family } = assets;
  drawBase(ctx, W, H);
  drawHeader(ctx, W, family, assets.logo);

  const name = fitName(ctx, family, face.name, W);
  const twoLines = name.lines.length > 1;
  const wx = W * 0.08;
  const wy = W * 0.3;
  const ww = W * 0.84;
  const wh = H - W * 0.37 - (twoLines ? W * 0.075 : 0) - wy;
  ctx.save();
  roundRect(ctx, wx, wy, ww, wh, W * 0.03);
  ctx.clip();
  ctx.fillStyle = BG;
  ctx.fillRect(wx, wy, ww, wh);
  if (assets.photo) drawCover(ctx, assets.photo, wx, wy, ww, wh);
  else drawGlyphWindow(ctx, family, face.slug, face.initials, wx, wy, ww, wh, { strokeWidth: W * 0.04 });
  ctx.restore();
  roundRect(ctx, wx + 0.5, wy + 0.5, ww - 1, wh - 1, W * 0.03);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(191, 199, 206, 0.2)';
  ctx.stroke();

  ctx.fillStyle = INK;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  setFont(ctx, family, 800, name.px, 'expanded');
  const baseline = H - W * 0.265;
  if (twoLines) {
    ctx.fillText(name.lines[0], wx, baseline - W * 0.075, W * 0.84);
    ctx.fillText(name.lines[1], wx, baseline, W * 0.84);
  } else {
    ctx.fillText(name.lines[0], wx, baseline, W * 0.84);
  }
  if (face.role) {
    ctx.fillStyle = TEXT;
    setFont(ctx, family, 500, W * 0.05);
    ctx.fillText(ellipsise(ctx, face.role, W * 0.84), wx, H - W * 0.195);
  }
  drawBand(ctx, W, H, family, face.band, face.band.label, face.band.right);
}

export function drawBadgeBack(ctx: CanvasRenderingContext2D, W: number, H: number, face: BadgeFace, assets: BadgeAssets) {
  const { family } = assets;
  drawBase(ctx, W, H);
  // With a QR, the logo sits high; without one, the logo and the club's name centre on the card.
  const groupHeight = W * 0.475;
  const logoTop = assets.qr ? W * 0.18 : (W * 0.15 + (H - W * 0.12)) / 2 - groupHeight / 2;
  if (assets.logo) ctx.drawImage(assets.logo, (W - W * 0.3) / 2, logoTop, W * 0.3, W * 0.3);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = INK;
  setFont(ctx, family, 800, W * 0.072, 'expanded');
  ctx.fillText('Robotics Club', W / 2, logoTop + W * 0.42, W * 0.84);
  ctx.fillStyle = MUTED;
  setFont(ctx, family, 500, W * 0.046);
  ctx.fillText('VIT Chennai', W / 2, logoTop + W * 0.475);
  ctx.textAlign = 'left';

  if (assets.qr) {
    const size = W * 0.5;
    const x = (W - size) / 2;
    const y = W * 0.72;
    ctx.fillStyle = TEXT;
    roundRect(ctx, x, y, size, size, W * 0.02);
    ctx.fill();
    const n = assets.qr.length;
    const cell = size / n;
    ctx.fillStyle = BG;
    ctx.beginPath();
    assets.qr.forEach((row, r) =>
      row.forEach((on, c) => {
        // Slightly oversized modules, so neighbours join without hairline seams.
        if (on) ctx.rect(x + c * cell, y + r * cell, cell + 0.35, cell + 0.35);
      }),
    );
    ctx.fill();
  }
  drawBand(ctx, W, H, family, face.band, face.joinedYear ? `Joined ${face.joinedYear}` : null, null);
}

// The card's texture atlas. card.glb maps the front face to the left half and the back face to the
// right half (measured: u 0.001-0.499 by v 0.004-0.755, and u 0.501-1.000 by v 0.002-0.757), and its
// edges to the rest. On a 1024 x 948 canvas each face rect has the mesh face's own 0.716 shape, so
// a face drawn at the rect's pixel size lands on the card unstretched.
export const ATLAS_W = 1024;
export const ATLAS_H = 948;
export const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };
export const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 };
/** The card's edges: a light core, like a PVC ID card, which outlines the dark print. */
const EDGE = '#BFC7CE';

/** Both faces of one badge on one atlas canvas, ready to become the card's texture. */
export function composeAtlas(drawFront: FaceDrawer, drawBack: FaceDrawer): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = ATLAS_W;
  canvas.height = ATLAS_H;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = EDGE;
  ctx.fillRect(0, 0, ATLAS_W, ATLAS_H);
  for (const [rect, draw] of [
    [FRONT_UV_RECT, drawFront],
    [BACK_UV_RECT, drawBack],
  ] as const) {
    const rw = Math.round(rect.w * ATLAS_W);
    const rh = Math.round(rect.h * ATLAS_H);
    ctx.save();
    ctx.translate(Math.round(rect.x * ATLAS_W), Math.round(rect.y * ATLAS_H));
    ctx.beginPath();
    ctx.rect(0, 0, rw, rh);
    ctx.clip();
    draw(ctx, rw, rh);
    ctx.restore();
  }
  return canvas;
}

/**
 * The strap: club blue with woven edges, printing "Robotics Club" and the logo once per tile. A
 * strap is about 11 tile-heights long on screen, so a 512 x 96 tile repeated twice along it keeps
 * the print in proportion (Lanyard's `repeat`).
 */
export const STRAP_REPEAT = 2;
export function drawStrapCanvas(family: string, logo: CanvasImageSource | null): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#4A8DB7';
  ctx.fillRect(0, 0, 512, 96);
  ctx.fillStyle = 'rgba(13, 13, 13, 0.35)';
  ctx.fillRect(0, 7, 512, 2);
  ctx.fillRect(0, 87, 512, 2);
  ctx.fillStyle = BG;
  setFont(ctx, family, 700, 38, 'semi-expanded');
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('Robotics Club', 36, 61);
  if (logo) ctx.drawImage(logo, 364, 22, 52, 52);
  return canvas;
}

/** The page's own font family (next/font's generated name), with the weights the badges use loaded. */
export async function badgeFamily(): Promise<string> {
  const family = getComputedStyle(document.body).fontFamily;
  await Promise.all([800, 700, 500].map(weight => document.fonts.load(`${weight} 100px ${family}`))).catch(() => {});
  return family;
}

/** Loads an image for canvas use. Resolves null on error or after `timeout` ms, so a slow photo never blocks a badge. */
export function loadImage(src: string, timeout = 4000): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    const timer = window.setTimeout(() => resolve(null), timeout);
    image.onload = () => {
      window.clearTimeout(timer);
      resolve(image);
    };
    image.onerror = () => {
      window.clearTimeout(timer);
      resolve(null);
    };
    image.src = src;
  });
}
