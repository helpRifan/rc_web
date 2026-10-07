'use client';

/*
 * Tech Text, from React Bits (https://reactbits.dev/r/TechText-TS-TW).
 * Copyright (c) 2026 David Haz, MIT + Commons Clause. See THIRD_PARTY_NOTICES.md.
 * Forked for the home hero:
 * - The canvas covers its whole container (the hero stage) and the text is laid out in the box of
 *   `anchor`, left-aligned, one line per '\n'. Letters can then travel anywhere on the stage.
 * - `controlRef.current.setExplode(p)` pulls the letters into an exploded view (0 assembled, 1
 *   apart), each on the original's spring, leaving its dashed outline at home with a leader line.
 * - Pointer events come from `eventSource`, so the canvas never blocks the links under it.
 * - Archivo's width axis (`fontStretch`), labels in the page's own face instead of monospace,
 *   `onReady` once a frame is drawn in the real font, and `setAsleep` to stop drawing while
 *   something opaque covers the canvas. The registry's 'area' reveal is left out.
 */

import { useEffect, useRef } from 'react';
import type { CSSProperties, RefObject } from 'react';

type Box = { x1: number; y1: number; x2: number; y2: number };
type Art = { image: HTMLCanvasElement; left: number; top: number };
type Shape = { char: string; x: number; baseline: number; box: Box };
type Glyph = Shape & {
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
  /** Where the letter goes when fully exploded, relative to home. */
  flight: { x: number; y: number };
  outline: number;
  fill: Art;
  dashes: Art;
};
type Block = { left: number; right: number; top: number; bottom: number };

export interface TechTextControl {
  /** 0 assembled, 1 fully exploded. */
  setExplode: (progress: number) => void;
  /** Stop drawing while something covers the canvas; false resumes. */
  setAsleep: (asleep: boolean) => void;
}

export interface TechTextProps {
  text: string;
  /** The element whose box the text fills (its width and height). */
  anchor: RefObject<HTMLElement | null>;
  /** Pointer events are read from here (usually the whole stage). */
  eventSource: RefObject<HTMLElement | null>;
  controlRef?: RefObject<TechTextControl | null>;
  onReady?: () => void;
  fontFamily?: string;
  fontWeight?: number;
  /** A CSS font-stretch keyword, e.g. 'expanded' for Archivo at wdth 125. */
  fontStretch?: string;
  letterSpacing?: number;
  /** Gap between lines, as a fraction of the cap height. */
  lineGap?: number;
  color?: string;
  accentColor?: string;
  dashLength?: number;
  dashGap?: number;
  strokeWidth?: number;
  lineStyle?: 'dashed' | 'solid';
  reveal?: 'letter' | 'off';
  specks?: number;
  selection?: boolean;
  labels?: boolean;
  draggable?: boolean;
  sweep?: boolean;
  speed?: number;
  className?: string;
  style?: CSSProperties;
}

type Settings = Required<Omit<TechTextProps, 'anchor' | 'eventSource' | 'controlRef' | 'onReady' | 'className' | 'style'>>;

const LABEL_PX = 11;
const SPRING = 320;
const DAMPING = 22;

const approach = (current: number, target: number, dt: number, seconds: number) =>
  current + (target - current) * (1 - Math.exp(-dt / seconds));

const hexToRgb = (hex: string): [number, number, number] => {
  let h = String(hex || '').replace('#', '');
  if (h.length === 3) h = h.replace(/./g, c => c + c);
  const n = parseInt(h.slice(0, 6), 16);
  return Number.isNaN(n) ? [255, 255, 255] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const rgba = (hex: string, alpha: number) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const noise = (...values: number[]) => {
  let h = 2166136261;
  for (const value of values) {
    h = Math.imul(h ^ (value | 0), 16777619);
    h ^= h >>> 13;
    h = Math.imul(h, 0x5bd1e995);
    h ^= h >>> 15;
  }
  return (h >>> 0) / 4294967296;
};

const signed = (value: number) => (value > 0 ? `+${value}` : value < 0 ? `−${-value}` : '0');
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const TechText = ({
  text,
  anchor,
  eventSource,
  controlRef,
  onReady,
  fontFamily = '',
  fontWeight = 800,
  fontStretch = 'normal',
  letterSpacing = -0.02,
  lineGap = 0.16,
  color = '#ffffff',
  accentColor = '#ffffff',
  dashLength = 4,
  dashGap = 2,
  strokeWidth = 1.5,
  lineStyle = 'dashed',
  reveal = 'letter',
  specks = 15,
  selection = true,
  labels = true,
  draggable = true,
  sweep = true,
  speed = 1,
  className = '',
  style
}: TechTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settingsRef = useRef<Settings | null>(null);
  const wakeRef = useRef<() => void>(() => {});
  const readyRef = useRef(onReady);

  useEffect(() => {
    readyRef.current = onReady;
    settingsRef.current = {
      text,
      fontFamily,
      fontWeight,
      fontStretch,
      letterSpacing,
      lineGap,
      color,
      accentColor,
      dashLength,
      dashGap,
      strokeWidth,
      lineStyle,
      reveal,
      specks,
      selection,
      labels,
      draggable,
      sweep,
      speed
    };
    wakeRef.current();
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const source = eventSource.current;
    const ctx = canvas?.getContext('2d');
    const probe = document.createElement('canvas').getContext('2d');
    if (!container || !canvas || !ctx || !probe || !source) return undefined;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let width = 1;
    let height = 1;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();
    let visible = true;
    let alive = true;
    let asleep = false;
    let layoutKey = '';
    let requestedFont = '';
    let fontsReady = false;
    let readySent = false;
    let block: Block | null = null;
    let glyphs: Glyph[] = [];
    let explode = 0;
    let clock = 0;
    let pulse = 0;
    let placed = false;
    let dragging = -1;
    const pointer = { x: 0, y: 0, inside: false };
    const grab = { x: 0, y: 0 };
    const lens = { x: 0, y: 0 };
    const frame = { x1: 0, y1: 0, x2: 0, y2: 0, alpha: 0, index: -1 };

    const refreshFonts = () => {
      fontsReady = true;
      layoutKey = '';
      wakeRef.current();
    };

    const family = (s: Settings) => s.fontFamily || getComputedStyle(container).fontFamily || 'sans-serif';
    const fontFor = (s: Settings, size: number) => `${s.fontWeight} ${s.fontStretch} ${size}px ${family(s)}`;
    const labelFont = (s: Settings) => `500 ${LABEL_PX}px ${family(s)}`;

    const setFont = (target: CanvasRenderingContext2D, s: Settings, size: number) => {
      target.font = fontFor(s, size);
      if ('letterSpacing' in target) target.letterSpacing = `${s.letterSpacing * size}px`;
      target.textAlign = 'left';
      target.textBaseline = 'alphabetic';
    };

    const sprite = (s: Settings, size: number, glyph: Shape, stroke: boolean): Art => {
      const pad = Math.ceil(s.strokeWidth * 2 + 4);
      const left = glyph.box.x1 - pad;
      const top = glyph.box.y1 - pad;
      const w = glyph.box.x2 - glyph.box.x1 + pad * 2;
      const h = glyph.box.y2 - glyph.box.y1 + pad * 2;
      const image = document.createElement('canvas');
      image.width = Math.max(1, Math.ceil(w * dpr));
      image.height = Math.max(1, Math.ceil(h * dpr));
      const c = image.getContext('2d');
      if (!c) return { image, left, top };
      c.setTransform(dpr, 0, 0, dpr, -left * dpr, -top * dpr);
      setFont(c, s, size);
      if (stroke) {
        c.lineJoin = 'round';
        c.lineWidth = s.strokeWidth * 2;
        c.lineCap = 'butt';
        c.strokeStyle = s.color;
        if (s.lineStyle !== 'solid') c.setLineDash([Math.max(1, s.dashLength), Math.max(1, s.dashGap)]);
        c.strokeText(glyph.char, glyph.x, glyph.baseline);
        c.setLineDash([]);
        c.globalCompositeOperation = 'destination-out';
        c.fillStyle = '#0D0D0D'; // only its alpha matters: it cuts the fill out of the stroke
        c.fillText(glyph.char, glyph.x, glyph.baseline);
        c.globalCompositeOperation = 'source-over';
      } else {
        c.fillStyle = s.color;
        c.fillText(glyph.char, glyph.x, glyph.baseline);
      }
      return { image, left, top };
    };

    // Exploded view: the letters spread across the stage in reading order (even slots, so two lines
    // never land on each other), alternately above and below the middle band, which stays clear
    // for whatever grows there.
    const plan = () => {
      const margin = width * (width < 640 ? 0.12 : 0.08);
      const last = Math.max(1, glyphs.length - 1);
      glyphs.forEach((glyph, i) => {
        const gx = (glyph.box.x1 + glyph.box.x2) / 2;
        const gy = (glyph.box.y1 + glyph.box.y2) / 2;
        const u = glyphs.length > 1 ? -1 + (2 * i) / last : 0;
        const side = i % 2 === 0 ? -1 : 1;
        const tx = width / 2 + u * (width / 2 - margin);
        const ty = clamp(height / 2 + side * (0.24 + 0.13 * noise(i, 3)) * height, height * 0.16, height * 0.86);
        glyph.flight = { x: tx - gx, y: ty - gy };
      });
    };

    const ensureLayout = (s: Settings): Block | null => {
      const anchorEl = anchor.current;
      if (!anchorEl) return null;
      const a = anchorEl.getBoundingClientRect();
      const c = container.getBoundingClientRect();
      const ax = a.left - c.left;
      const ay = a.top - c.top;
      const key = [s.text, family(s), s.fontWeight, s.fontStretch, s.letterSpacing, s.lineGap, s.color, s.dashLength, s.dashGap, s.strokeWidth, s.lineStyle, width, height, dpr, Math.round(ax), Math.round(ay), Math.round(a.width), Math.round(a.height)].join('|');
      if (key === layoutKey && block) return block;
      layoutKey = key;
      const wanted = fontFor(s, 64);
      if (document.fonts && wanted !== requestedFont) {
        requestedFont = wanted;
        document.fonts.load(wanted, s.text).then(refreshFonts, refreshFonts);
      }

      const lines = s.text.split('\n');
      setFont(probe, s, 100);
      const measured = lines.map(line => probe.measureText(line));
      const inkWidth = Math.max(1, ...measured.map(m => m.actualBoundingBoxLeft + m.actualBoundingBoxRight));
      const capHeight = Math.max(1, ...measured.map(m => m.actualBoundingBoxAscent + m.actualBoundingBoxDescent));
      // Fit by width, like the anchor's own text, and centre the lines in its height.
      const size = (100 * a.width) / inkWidth;
      setFont(probe, s, size);
      const lineHeight = (capHeight * size) / 100;
      const gap = lineHeight * s.lineGap;
      const top = ay + (a.height - (lineHeight * lines.length + gap * (lines.length - 1))) / 2;

      const previous = glyphs;
      glyphs = [];
      const next: Block = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity };
      lines.forEach((line, li) => {
        const m = probe.measureText(line);
        const baseline = top + li * (lineHeight + gap) + m.actualBoundingBoxAscent;
        const x = ax + m.actualBoundingBoxLeft;
        let prefix = '';
        for (const char of Array.from(line)) {
          prefix += char;
          const own = probe.measureText(char);
          const gx = x + probe.measureText(prefix).width - own.width;
          if (!char.trim()) continue;
          const base: Shape = {
            char,
            x: gx,
            baseline,
            box: {
              x1: gx - own.actualBoundingBoxLeft,
              y1: baseline - own.actualBoundingBoxAscent,
              x2: gx + own.actualBoundingBoxRight,
              y2: baseline + own.actualBoundingBoxDescent
            }
          };
          next.left = Math.min(next.left, base.box.x1);
          next.right = Math.max(next.right, base.box.x2);
          next.top = Math.min(next.top, base.box.y1);
          next.bottom = Math.max(next.bottom, base.box.y2);
          const kept = previous[glyphs.length];
          glyphs.push({
            ...base,
            offset: kept?.char === char ? kept.offset : { x: 0, y: 0 },
            velocity: { x: 0, y: 0 },
            flight: { x: 0, y: 0 },
            outline: 0,
            fill: sprite(s, size, base, false),
            dashes: sprite(s, size, base, true)
          });
        }
      });
      block = glyphs.length ? next : null;
      if (block) plan();
      dragging = -1;
      frame.index = -1;
      return block;
    };

    const glyphAt = (x: number, y: number, slack: number) => {
      let best = -1;
      let bestDistance = Infinity;
      glyphs.forEach((glyph, i) => {
        const x1 = glyph.box.x1 + glyph.offset.x;
        const x2 = glyph.box.x2 + glyph.offset.x;
        const y1 = glyph.box.y1 + glyph.offset.y;
        const y2 = glyph.box.y2 + glyph.offset.y;
        const dx = x < x1 ? x1 - x : x > x2 ? x - x2 : 0;
        const dy = y < y1 ? y1 - y : y > y2 ? y - y2 : 0;
        const d = Math.hypot(dx, dy);
        if (d < bestDistance) {
          bestDistance = d;
          best = i;
        }
      });
      return bestDistance < slack ? best : -1;
    };

    const blit = (target: CanvasRenderingContext2D, art: Art, dx: number, dy: number) => {
      target.drawImage(art.image, Math.round((art.left + dx) * dpr), Math.round((art.top + dy) * dpr));
    };

    const crisp = (value: number) => (Math.round(value * dpr) + 0.5) / dpr;

    const perimeterPoint = (distance: number, w: number, h: number): [number, number, number, number] => {
      let d = ((distance % (2 * (w + h))) + 2 * (w + h)) % (2 * (w + h));
      if (d < w) return [frame.x1 + d, frame.y1, 0, -1];
      d -= w;
      if (d < h) return [frame.x2, frame.y1 + d, 1, 0];
      d -= h;
      if (d < w) return [frame.x2 - d, frame.y2, 0, 1];
      d -= w;
      return [frame.x1, frame.y2 - d, -1, 0];
    };

    const drawSpecks = (s: Settings, a: number) => {
      const w = frame.x2 - frame.x1;
      const h = frame.y2 - frame.y1;
      if (w < 2 || h < 2) return;
      const perimeter = 2 * (w + h);
      const seed = frame.index + 1;
      const grid = 3;

      for (let k = 0; k < s.specks; k++) {
        const period = 0.5 + noise(seed, k, 11) * 1.2;
        const t = pulse / period + noise(seed, k, 17);
        const cycle = Math.floor(t);
        const life = t - cycle;
        if (life > 0.7) continue;
        const [px, py, nx, ny] = perimeterPoint(noise(seed, k, cycle) * perimeter, w, h);
        const pick = noise(seed, k, cycle, 2);
        const size = pick < 0.46 ? 2 : pick < 0.7 ? 3 : pick < 0.84 ? 5 : pick < 0.94 ? 8 : 11;
        const large = size >= 8;
        const out = (large ? 9 : 4) + Math.floor(noise(seed, k, cycle, 1) * 5) * grid;
        const x = frame.x1 + Math.round((px + nx * out - frame.x1) / grid) * grid;
        const y = frame.y1 + Math.round((py + ny * out - frame.y1) / grid) * grid;
        const tone = noise(seed, k, cycle, 3);
        const blink = life < 0.06 || (life > 0.32 && life < 0.36) ? 0.35 : 1;
        const alpha = a * (large ? 0.3 + 0.4 * tone : 0.3 + 0.6 * tone) * blink;
        const left = Math.round(x - size / 2);
        const top = Math.round(y - size / 2);
        if (tone < 0.26 || (large && tone < 0.78)) {
          ctx.strokeStyle = rgba(s.accentColor, alpha);
          ctx.strokeRect(left + 0.5, top + 0.5, size, size);
          if (large && tone > 0.5) {
            ctx.fillStyle = rgba(s.accentColor, alpha);
            ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
          }
        } else {
          ctx.fillStyle = rgba(s.accentColor, alpha);
          ctx.fillRect(left, top, size, size);
        }
      }

      for (let j = 0; j < 2; j++) {
        const head = (pulse * 0.42 * s.speed + j * 0.5) * perimeter;
        for (let i = 0; i < 4; i++) {
          const [x, y] = perimeterPoint(head - i * 6, w, h);
          const size = i === 0 ? 3 : 2;
          ctx.fillStyle = rgba(s.accentColor, a * [0.95, 0.55, 0.32, 0.16][i]);
          ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size);
        }
      }
    };

    // A leader from each moved letter back to its home, a pin at home and, once it has travelled
    // far enough to read, its offset in the drawing's own units.
    const drawLeaders = (s: Settings) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = labelFont(s);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      for (const glyph of glyphs) {
        const moved = Math.hypot(glyph.offset.x, glyph.offset.y);
        if (moved < 2) continue;
        const a = Math.min(1, moved / 48);
        const hx = (glyph.box.x1 + glyph.box.x2) / 2;
        const hy = (glyph.box.y1 + glyph.box.y2) / 2;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx + glyph.offset.x, hy + glyph.offset.y);
        ctx.setLineDash([3, 4]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = rgba(s.accentColor, 0.42 * a);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = rgba(s.accentColor, 0.75 * a);
        ctx.fillRect(Math.round(hx) - 2, Math.round(hy) - 2, 4, 4);
        if (s.labels && moved > 24) {
          ctx.fillStyle = rgba(s.accentColor, 0.7 * a);
          ctx.fillText(
            `${glyph.char}  ${signed(Math.round(glyph.offset.x))}, ${signed(Math.round(-glyph.offset.y))}`,
            Math.round(glyph.box.x1 + glyph.offset.x),
            Math.round(glyph.box.y1 + glyph.offset.y) - 8
          );
        }
      }
    };

    const drawFrame = (s: Settings) => {
      const glyph = glyphs[frame.index];
      if (!glyph || frame.alpha < 0.01) return;
      const a = frame.alpha;
      const x1 = crisp(frame.x1);
      const y1 = crisp(frame.y1);
      const x2 = crisp(frame.x2);
      const y2 = crisp(frame.y2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.beginPath();
      ctx.rect(x1, y1, x2 - x1, y2 - y1);
      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba(s.accentColor, 0.5 * a);
      ctx.stroke();

      ctx.beginPath();
      for (const [cx, cy] of [
        [x1, y1],
        [x2, y1],
        [x2, y2],
        [x1, y2]
      ]) {
        ctx.rect(Math.round(cx) - 2, Math.round(cy) - 2, 5, 5);
      }
      ctx.fillStyle = rgba(s.accentColor, 0.95 * a);
      ctx.fill();

      if (s.specks > 0) {
        ctx.lineWidth = 1;
        drawSpecks(s, a);
      }

      const moved = Math.hypot(glyph.offset.x, glyph.offset.y);
      if (!s.labels || moved > 24) return; // a travelled letter is labelled by its leader
      ctx.font = labelFont(s);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = rgba(s.accentColor, 0.7 * a);
      ctx.fillText(
        `${glyph.char}  ${Math.round(glyph.box.x2 - glyph.box.x1)} × ${Math.round(glyph.box.y2 - glyph.box.y1)}`,
        Math.round(frame.x1),
        Math.round(frame.y1) - 7
      );
    };

    const tick = (now: number) => {
      raf = 0;
      const s = settingsRef.current;
      if (!s || asleep) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      const view = ensureLayout(s);
      if (!view) return;

      const sweeping = s.sweep && !reducedMotion && !pointer.inside && dragging < 0 && explode < 0.05;
      if (sweeping) clock += dt * s.speed;
      pulse += dt;
      let targetX = pointer.x;
      let targetY = pointer.y;
      if (sweeping) {
        targetX = view.left + (view.right - view.left) * (0.5 - 0.5 * Math.cos(clock * 0.45));
        targetY = view.top + (view.bottom - view.top) * (0.5 + 0.42 * Math.sin(clock * 0.8));
      }
      const active = pointer.inside || sweeping || dragging >= 0;
      if (active && !placed) {
        lens.x = targetX;
        lens.y = targetY;
      }
      if (active) {
        const lag = pointer.inside ? 0.05 : 0.22;
        lens.x = approach(lens.x, targetX, dt, lag);
        lens.y = approach(lens.y, targetY, dt, lag);
      }
      placed = active;

      let moving = false;
      glyphs.forEach((glyph, i) => {
        if (i === dragging) {
          glyph.offset.x = approach(glyph.offset.x, pointer.x - grab.x, dt, 0.03);
          glyph.offset.y = approach(glyph.offset.y, pointer.y - grab.y, dt, 0.03);
          glyph.velocity.x = 0;
          glyph.velocity.y = 0;
          moving = true;
          return;
        }
        const { offset, velocity, flight } = glyph;
        const tx = flight.x * explode;
        const ty = flight.y * explode;
        if (Math.abs(offset.x - tx) < 0.05 && Math.abs(offset.y - ty) < 0.05 && Math.hypot(velocity.x, velocity.y) < 0.5) {
          offset.x = tx;
          offset.y = ty;
          velocity.x = 0;
          velocity.y = 0;
          return;
        }
        velocity.x += (-SPRING * (offset.x - tx) - DAMPING * velocity.x) * dt;
        velocity.y += (-SPRING * (offset.y - ty) - DAMPING * velocity.y) * dt;
        offset.x += velocity.x * dt;
        offset.y += velocity.y * dt;
        moving = true;
      });

      const focus = dragging >= 0 ? dragging : active ? glyphAt(lens.x, lens.y, 28) : -1;
      if (focus >= 0 && s.selection) {
        const glyph = glyphs[focus];
        const bx1 = glyph.box.x1 + glyph.offset.x - 6;
        const by1 = glyph.box.y1 + glyph.offset.y - 6;
        const bx2 = glyph.box.x2 + glyph.offset.x + 6;
        const by2 = glyph.box.y2 + glyph.offset.y + 6;
        if (frame.index < 0 || frame.alpha < 0.02) {
          frame.x1 = bx1;
          frame.y1 = by1;
          frame.x2 = bx2;
          frame.y2 = by2;
        }
        const glide = focus === dragging ? 0.02 : 0.08;
        frame.x1 = approach(frame.x1, bx1, dt, glide);
        frame.y1 = approach(frame.y1, by1, dt, glide);
        frame.x2 = approach(frame.x2, bx2, dt, glide);
        frame.y2 = approach(frame.y2, by2, dt, glide);
        frame.index = focus;
      }
      frame.alpha = approach(frame.alpha, focus >= 0 && s.selection ? 1 : 0, dt, 0.1);

      glyphs.forEach((glyph, i) => {
        const target = s.reveal === 'letter' && i === focus && i !== dragging ? 1 : 0;
        glyph.outline = approach(glyph.outline, target, dt, 0.09);
        if (Math.abs(glyph.outline - target) > 0.002) moving = true;
        else glyph.outline = target;
      });

      if (s.draggable) source.style.cursor = dragging >= 0 ? 'grabbing' : focus >= 0 && pointer.inside && glyphAt(pointer.x, pointer.y, 12) >= 0 ? 'grab' : '';

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const glyph of glyphs) {
        const moved = Math.hypot(glyph.offset.x, glyph.offset.y);
        if (moved > 1) {
          ctx.globalAlpha = Math.min(1, moved / 24) * 0.55;
          blit(ctx, glyph.dashes, 0, 0);
          ctx.globalAlpha = 1;
        }
      }
      for (const glyph of glyphs) {
        if (glyph.outline < 0.999) {
          ctx.globalAlpha = 1 - glyph.outline;
          blit(ctx, glyph.fill, glyph.offset.x, glyph.offset.y);
        }
        if (glyph.outline > 0.001) {
          ctx.globalAlpha = glyph.outline;
          blit(ctx, glyph.dashes, glyph.offset.x, glyph.offset.y);
        }
        ctx.globalAlpha = 1;
      }
      drawLeaders(s);
      drawFrame(s);

      if (!readySent && fontsReady) {
        readySent = true;
        readyRef.current?.();
      }

      const settling = moving || (frame.alpha > 0.01 && frame.alpha < 0.99);
      if ((active || settling || !fontsReady) && visible && alive) raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (raf || !visible || !alive || asleep) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    wakeRef.current = wake;

    if (controlRef) {
      controlRef.current = {
        setExplode: (progress: number) => {
          const next = clamp(progress, 0, 1);
          if (Math.abs(next - explode) < 0.0005) return;
          explode = next;
          wake();
        },
        setAsleep: (value: boolean) => {
          if (value === asleep) return;
          asleep = value;
          if (asleep) {
            cancelAnimationFrame(raf);
            raf = 0;
          } else {
            wake();
          }
        }
      };
    }

    const resize = () => {
      width = Math.max(1, container.clientWidth);
      height = Math.max(1, container.clientHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      layoutKey = '';
      wake();
    };

    const locate = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onMove = (e: PointerEvent) => {
      locate(e);
      pointer.inside = true;
      wake();
    };
    const onLeave = () => {
      if (dragging >= 0) return;
      pointer.inside = false;
      wake();
    };
    const onDown = (e: PointerEvent) => {
      locate(e);
      pointer.inside = true;
      const s = settingsRef.current;
      if (s?.draggable && (e.pointerType !== 'mouse' || e.button === 0)) {
        const index = glyphAt(pointer.x, pointer.y, 12);
        if (index >= 0) {
          dragging = index;
          grab.x = pointer.x - glyphs[index].offset.x;
          grab.y = pointer.y - glyphs[index].offset.y;
          source.setPointerCapture?.(e.pointerId);
        }
      }
      wake();
    };
    const onUp = (e: PointerEvent) => {
      if (dragging >= 0) {
        dragging = -1;
        source.releasePointerCapture?.(e.pointerId);
        const rect = source.getBoundingClientRect();
        pointer.inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      }
      wake();
    };

    source.addEventListener('pointermove', onMove, { passive: true });
    source.addEventListener('pointerenter', onMove, { passive: true });
    source.addEventListener('pointerdown', onDown, { passive: true });
    source.addEventListener('pointerup', onUp, { passive: true });
    source.addEventListener('pointercancel', onUp, { passive: true });
    source.addEventListener('pointerleave', onLeave, { passive: true });

    // The anchor can move without the canvas resizing (the copy under it wraps differently).
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    if (anchor.current) resizeObserver.observe(anchor.current);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    });
    intersectionObserver.observe(container);
    if (document.fonts) document.fonts.ready.then(refreshFonts, refreshFonts);

    resize();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      wakeRef.current = () => {};
      if (controlRef) controlRef.current = null;
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      source.style.cursor = '';
      source.removeEventListener('pointermove', onMove);
      source.removeEventListener('pointerenter', onMove);
      source.removeEventListener('pointerdown', onDown);
      source.removeEventListener('pointerup', onUp);
      source.removeEventListener('pointercancel', onUp);
      source.removeEventListener('pointerleave', onLeave);
    };
  }, [anchor, eventSource, controlRef]);

  return (
    <div ref={containerRef} aria-hidden="true" className={`pointer-events-none select-none ${className}`.trim()} style={style}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
};

export default TechText;
