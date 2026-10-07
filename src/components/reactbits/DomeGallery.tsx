'use client';

// DomeGallery from React Bits (https://reactbits.dev), ported for this site (gallery brief 5.1).
// Kept: the sphere layout, its CSS geometry, drag rotation and the inertia glide.
// Changed:
// - the root is a <div> (the layout already has <main>);
// - no demo images (`images` is required);
// - palette colours;
// - the built-in enlarge viewer, its scrim and its scroll lock are gone (PhotoViewer replaces them);
// - tiles are not focusable and carry alt="" (the accessible grid is the keyboard path);
// - each tile keeps its photo's index (data-index);
// - new props: tone, inertia, introSpinDeg, frozen, touchPanY, edgeBlur, onOpen.
import { useGesture } from '@use-gesture/react';
import { type CSSProperties, useCallback, useEffect, useMemo, useRef } from 'react';

export type DomeImage = { src: string; alt?: string; index: number };

type DomeGalleryProps = {
  images: DomeImage[];
  fit?: number;
  fitBasis?: 'auto' | 'min' | 'max' | 'width' | 'height';
  minRadius?: number;
  maxRadius?: number;
  overlayBlurColor?: string;
  maxVerticalRotationDeg?: number;
  dragSensitivity?: number;
  segments?: number;
  dragDampening?: number;
  imageBorderRadius?: string;
  /** duotone: tiles in the logo blue (luminosity over #4A8DB7); grayscale: the stock filter; none: true colour. */
  tone?: 'duotone' | 'grayscale' | 'none';
  /** false: no glide after a drag (reduced motion). */
  inertia?: boolean;
  /** Degrees to turn into place once on mount (0 to skip). */
  introSpinDeg?: number;
  /** Hold still and ignore input (while the viewer is open). */
  frozen?: boolean;
  /** Touch: vertical swipes scroll the page, horizontal swipes turn the dome. */
  touchPanY?: boolean;
  /** The backdrop-blur edge layer (expensive during a touch swipe). */
  edgeBlur?: boolean;
  /** A tile was clicked or tapped: the photo's index and the tile element (for a FLIP flight). */
  onOpen?: (index: number, tile: HTMLElement) => void;
};

type ItemDef = { src: string; index: number; x: number; y: number; sizeX: number; sizeY: number };

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const wrapAngleSigned = (deg: number) => {
  const a = (((deg + 180) % 360) + 360) % 360;
  return a - 180;
};

function buildItems(pool: DomeImage[], seg: number): ItemDef[] {
  const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];
  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map(y => ({ x, y, sizeX: 2, sizeY: 2 }));
  });
  if (pool.length === 0) return coords.map(c => ({ ...c, src: '', index: -1 }));

  const used = Array.from({ length: coords.length }, (_, i) => pool[i % pool.length]);
  // No photo next to itself.
  for (let i = 1; i < used.length; i++) {
    if (used[i].src === used[i - 1].src) {
      for (let j = i + 1; j < used.length; j++) {
        if (used[j].src !== used[i].src) {
          [used[i], used[j]] = [used[j], used[i]];
          break;
        }
      }
    }
  }
  return coords.map((c, i) => ({ ...c, src: used[i].src, index: used[i].index }));
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

export default function DomeGallery({
  images,
  fit = 0.5,
  fitBasis = 'auto',
  minRadius = 600,
  maxRadius = Infinity,
  overlayBlurColor = '#0D0D0D',
  maxVerticalRotationDeg = 5,
  dragSensitivity = 20,
  segments = 35,
  dragDampening = 0.7,
  imageBorderRadius = '10px',
  tone = 'duotone',
  inertia = true,
  introSpinDeg = 0,
  frozen = false,
  touchPanY = false,
  edgeBlur = true,
  onOpen,
}: DomeGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef({ x: 0, y: 0 });
  const startRotRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const inertiaRAF = useRef<number | null>(null);
  const introRAF = useRef<number | null>(null);
  const introDone = useRef(false);
  const pointerTypeRef = useRef<string>('mouse');
  const tapTargetRef = useRef<HTMLElement | null>(null);
  const lastDragEndAt = useRef(0);
  const lastOpenAt = useRef(-Infinity);
  const onOpenRef = useRef(onOpen);
  const frozenRef = useRef(frozen);
  useEffect(() => {
    onOpenRef.current = onOpen;
    frozenRef.current = frozen;
  });

  const maxTilt = touchPanY ? 0 : maxVerticalRotationDeg;
  const items = useMemo(() => buildItems(images, segments), [images, segments]);

  const applyTransform = useCallback((xDeg: number, yDeg: number) => {
    const el = sphereRef.current;
    if (el) el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
  }, []);

  const stopIntro = useCallback(() => {
    if (introRAF.current) cancelAnimationFrame(introRAF.current);
    introRAF.current = null;
    introDone.current = true;
  }, []);

  // The one settle: turn into place over 600ms after the first layout.
  const startIntro = useCallback(() => {
    if (introDone.current || introSpinDeg <= 0) {
      introDone.current = true;
      return;
    }
    introDone.current = true;
    const from = -introSpinDeg;
    rotationRef.current = { x: 0, y: from };
    applyTransform(0, from);
    let start = 0;
    const step = (t: number) => {
      if (!start) start = t;
      const p = Math.min((t - start) / 600, 1);
      const y = from * (1 - easeOutCubic(p));
      rotationRef.current = { x: rotationRef.current.x, y };
      applyTransform(rotationRef.current.x, y);
      introRAF.current = p < 1 ? requestAnimationFrame(step) : null;
    };
    introRAF.current = requestAnimationFrame(step);
  }, [applyTransform, introSpinDeg]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(entries => {
      const cr = entries[0].contentRect;
      const w = Math.max(1, cr.width);
      const h = Math.max(1, cr.height);
      const minDim = Math.min(w, h);
      const maxDim = Math.max(w, h);
      const basis =
        fitBasis === 'min' ? minDim : fitBasis === 'max' ? maxDim : fitBasis === 'width' ? w : fitBasis === 'height' ? h : w / h >= 1.3 ? w : minDim;
      const radius = clamp(Math.min(basis * fit, h * 1.35), minRadius, maxRadius);
      root.style.setProperty('--radius', `${Math.round(radius)}px`);
      applyTransform(rotationRef.current.x, rotationRef.current.y);
      startIntro();
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [fit, fitBasis, minRadius, maxRadius, applyTransform, startIntro]);

  useEffect(
    () => () => {
      if (inertiaRAF.current) cancelAnimationFrame(inertiaRAF.current);
      if (introRAF.current) cancelAnimationFrame(introRAF.current);
    },
    [],
  );

  const stopInertia = useCallback(() => {
    if (inertiaRAF.current) cancelAnimationFrame(inertiaRAF.current);
    inertiaRAF.current = null;
  }, []);

  const startInertia = useCallback(
    (vx: number, vy: number) => {
      const MAX_V = 1.4;
      let vX = clamp(vx, -MAX_V, MAX_V) * 80;
      let vY = clamp(vy, -MAX_V, MAX_V) * 80;
      let frames = 0;
      const d = clamp(dragDampening, 0, 1);
      const frictionMul = 0.94 + 0.055 * d;
      const stopThreshold = 0.015 - 0.01 * d;
      const maxFrames = Math.round(90 + 270 * d);
      const step = () => {
        vX *= frictionMul;
        vY *= frictionMul;
        if ((Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) || ++frames > maxFrames) {
          inertiaRAF.current = null;
          return;
        }
        const nextX = clamp(rotationRef.current.x - vY / 200, -maxTilt, maxTilt);
        const nextY = wrapAngleSigned(rotationRef.current.y + vX / 200);
        rotationRef.current = { x: nextX, y: nextY };
        applyTransform(nextX, nextY);
        inertiaRAF.current = requestAnimationFrame(step);
      };
      stopInertia();
      inertiaRAF.current = requestAnimationFrame(step);
    },
    [dragDampening, maxTilt, stopInertia, applyTransform],
  );

  const openFromTile = (tile: HTMLElement) => {
    const index = Number(tile.parentElement?.dataset.index);
    if (Number.isInteger(index) && index >= 0) onOpenRef.current?.(index, tile);
  };

  useGesture(
    {
      onDragStart: ({ event }) => {
        stopInertia();
        stopIntro();
        const evt = event as PointerEvent;
        pointerTypeRef.current = evt.pointerType || 'mouse';
        if (pointerTypeRef.current === 'touch' && !touchPanY) evt.preventDefault();
        draggingRef.current = true;
        movedRef.current = false;
        startRotRef.current = { ...rotationRef.current };
        startPosRef.current = { x: evt.clientX, y: evt.clientY };
        tapTargetRef.current = ((evt.target as Element).closest?.('.item__image') as HTMLElement | null) ?? null;
        rootRef.current?.setAttribute('data-dragging', 'true');
      },
      onDrag: ({ event, last, velocity: velArr = [0, 0], direction: dirArr = [0, 0], movement }) => {
        if (!draggingRef.current || !startPosRef.current) return;
        const evt = event as PointerEvent;
        if (pointerTypeRef.current === 'touch' && !touchPanY) evt.preventDefault();

        const dxTotal = evt.clientX - startPosRef.current.x;
        const dyTotal = evt.clientY - startPosRef.current.y;
        if (!movedRef.current && dxTotal * dxTotal + dyTotal * dyTotal > 16) movedRef.current = true;

        const nextX = clamp(startRotRef.current.x - dyTotal / dragSensitivity, -maxTilt, maxTilt);
        const nextY = startRotRef.current.y + dxTotal / dragSensitivity;
        if (rotationRef.current.x !== nextX || rotationRef.current.y !== nextY) {
          rotationRef.current = { x: nextX, y: nextY };
          applyTransform(nextX, nextY);
        }

        if (!last) return;
        draggingRef.current = false;
        rootRef.current?.setAttribute('data-dragging', 'false');
        const tapThreshold = pointerTypeRef.current === 'touch' ? 10 : 6;
        const isTap = dxTotal * dxTotal + dyTotal * dyTotal <= tapThreshold * tapThreshold;

        let vx = velArr[0] * dirArr[0];
        let vy = velArr[1] * dirArr[1];
        if (!isTap && Math.abs(vx) < 0.001 && Math.abs(vy) < 0.001 && Array.isArray(movement)) {
          vx = (movement[0] / dragSensitivity) * 0.02;
          vy = (movement[1] / dragSensitivity) * 0.02;
        }
        if (inertia && !isTap && (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005)) startInertia(vx, vy);

        startPosRef.current = null;
        if (isTap && tapTargetRef.current) {
          lastOpenAt.current = evt.timeStamp;
          openFromTile(tapTargetRef.current);
        }
        tapTargetRef.current = null;
        if (movedRef.current) lastDragEndAt.current = evt.timeStamp;
        movedRef.current = false;
      },
    },
    { target: mainRef, enabled: !frozen, eventOptions: { passive: !touchPanY ? false : true } },
  );

  const imageStyle: CSSProperties =
    tone === 'duotone' ? { mixBlendMode: 'luminosity' } : tone === 'grayscale' ? { filter: 'grayscale(1)' } : {};
  const tileBackground = tone === 'duotone' ? '#4A8DB7' : overlayBlurColor;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div
        ref={rootRef}
        data-dragging="false"
        className="sphere-root relative h-full w-full cursor-grab data-[dragging=true]:cursor-grabbing"
        style={{ ['--segments-x' as string]: segments, ['--segments-y' as string]: segments, ['--tile-radius' as string]: imageBorderRadius } as CSSProperties}
      >
        <div
          ref={mainRef}
          className="absolute inset-0 grid place-items-center overflow-hidden select-none"
          style={{ touchAction: touchPanY ? 'pan-y' : 'none', WebkitUserSelect: 'none', backgroundColor: overlayBlurColor }}
        >
          <div className="stage">
            <div ref={sphereRef} className="sphere">
              {items.map((it, i) => (
                <div
                  key={`${it.x},${it.y},${i}`}
                  className="sphere-item absolute m-auto"
                  data-index={it.index}
                  style={
                    {
                      ['--offset-x' as string]: it.x,
                      ['--offset-y' as string]: it.y,
                      ['--item-size-x' as string]: it.sizeX,
                      ['--item-size-y' as string]: it.sizeY,
                    } as CSSProperties
                  }
                >
                  <div
                    className="item__image absolute block cursor-pointer overflow-hidden"
                    tabIndex={-1}
                    onClick={e => {
                      // Taps open from the drag handler; this covers clicks that never started a drag.
                      if (frozenRef.current || draggingRef.current || movedRef.current) return;
                      if (e.timeStamp - lastDragEndAt.current < 80 || e.timeStamp - lastOpenAt.current < 400) return;
                      openFromTile(e.currentTarget);
                    }}
                    style={{ inset: '10px', borderRadius: `var(--tile-radius, ${imageBorderRadius})`, backfaceVisibility: 'hidden', backgroundColor: tileBackground }}
                  >
                    {it.src && (
                      // A plain <img>: the tiles are sized by the sphere, and the 9 URLs are preloaded and cached.
                      <img src={it.src} draggable={false} alt="" className="pointer-events-none h-full w-full object-cover" style={{ backfaceVisibility: 'hidden', ...imageStyle }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-0 z-[3] m-auto"
            style={{ backgroundImage: `radial-gradient(rgba(13, 13, 13, 0) 65%, ${overlayBlurColor} 100%)` }}
          />
          {edgeBlur && (
            <div
              className="pointer-events-none absolute inset-0 z-[3] m-auto"
              style={{
                WebkitMaskImage: `radial-gradient(rgba(13, 13, 13, 0) 70%, ${overlayBlurColor} 90%)`,
                maskImage: `radial-gradient(rgba(13, 13, 13, 0) 70%, ${overlayBlurColor} 90%)`,
                backdropFilter: 'blur(3px)',
              }}
            />
          )}
          <div
            className="pointer-events-none absolute left-0 right-0 top-0 z-[5] h-[120px] rotate-180"
            style={{ background: `linear-gradient(to bottom, transparent, ${overlayBlurColor})` }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-[5] h-[120px]"
            style={{ background: `linear-gradient(to bottom, transparent, ${overlayBlurColor})` }}
          />
        </div>
      </div>
    </>
  );
}

const CSS = `
  .sphere-root {
    --radius: 520px;
    --circ: calc(var(--radius) * 3.14);
    --rot-y: calc((360deg / var(--segments-x)) / 2);
    --rot-x: calc((360deg / var(--segments-y)) / 2);
    --item-width: calc(var(--circ) / var(--segments-x));
    --item-height: calc(var(--circ) / var(--segments-y));
  }
  .sphere-root * { box-sizing: border-box; }
  .sphere, .sphere-item, .item__image { transform-style: preserve-3d; }
  .stage {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    position: absolute;
    inset: 0;
    margin: auto;
    perspective: calc(var(--radius) * 2);
    perspective-origin: 50% 50%;
  }
  .sphere {
    transform: translateZ(calc(var(--radius) * -1));
    will-change: transform;
    position: absolute;
  }
  .sphere-item {
    width: calc(var(--item-width) * var(--item-size-x));
    height: calc(var(--item-height) * var(--item-size-y));
    position: absolute;
    top: -999px;
    bottom: -999px;
    left: -999px;
    right: -999px;
    margin: auto;
    transform-origin: 50% 50%;
    backface-visibility: hidden;
    transform: rotateY(calc(var(--rot-y) * (var(--offset-x) + ((var(--item-size-x) - 1) / 2)) + var(--rot-y-delta, 0deg)))
               rotateX(calc(var(--rot-x) * (var(--offset-y) - ((var(--item-size-y) - 1) / 2)) + var(--rot-x-delta, 0deg)))
               translateZ(var(--radius));
  }
  .item__image {
    position: absolute;
    inset: 10px;
    border-radius: var(--tile-radius, 10px);
    overflow: hidden;
    cursor: pointer;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    pointer-events: auto;
    transform: translateZ(0);
  }
`;
