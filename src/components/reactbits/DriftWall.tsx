'use client';

/*
 * Drift Wall, from React Bits (https://reactbits.dev/r/DriftWall-TS-TW).
 * Copyright (c) 2026 David Haz, MIT + Commons Clause. See THIRD_PARTY_NOTICES.md.
 * Forked for the home page's latest photos:
 * - A tile opens the photo (`onOpen`) instead of linking out. Each photo is one button in the tab
 *   order; the repeats that fill the loop are hidden from assistive tech and the keyboard, and a
 *   focused tile's column scrolls it into the middle of the wall.
 * - `onActiveChange` reports the photo under the pointer or focus, so a caption can follow it.
 * - The loop stops while the wall is off screen; reduced motion (and the server HTML) hold the
 *   columns still with no parallax. Edges fade on four sides instead of an oval vignette, so a
 *   wide wall fills its width. Colours are the club palette.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from 'react';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

export interface DriftWallItem {
  key: string;
  image: string;
  /** The accessible name of the tile's button. */
  label: string;
}

export interface DriftWallProps {
  items: DriftWallItem[];
  columns?: number;
  tileWidth?: number;
  tileHeight?: number;
  gap?: number;
  radius?: number;
  tilt?: number;
  turn?: number;
  roll?: number;
  perspective?: number;
  depth?: number;
  speed?: number;
  direction?: 'up' | 'down';
  variance?: number;
  parallax?: number;
  lift?: number;
  fade?: number;
  dim?: number;
  overlayColor?: string;
  /** A tile was chosen (click, Enter or Space); `el` is the tile, for the viewer's opening origin. */
  onOpen?: (index: number, el: HTMLElement) => void;
  /** The photo under the pointer or keyboard focus changed (null for none). */
  onActiveChange?: (index: number | null) => void;
  label?: string;
  className?: string;
  style?: CSSProperties;
}

interface ColumnMeta {
  copyHeight: number;
  copies: number;
}

type Tile = { item: DriftWallItem; index: number };

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');

const columnFactor = (index: number, variance: number): number => {
  const pseudo = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1;
  return 1 + variance * pseudo;
};

const DriftWall = ({
  items,
  columns = 5,
  tileWidth = 200,
  tileHeight = 132,
  gap = 18,
  radius = 14,
  tilt = 16,
  turn = -14,
  roll = 0,
  perspective = 1200,
  depth = 120,
  speed = 42,
  direction = 'up',
  variance = 0.45,
  parallax = 0.6,
  lift = 64,
  fade = 0.6,
  dim = 0.55,
  overlayColor = '#0D0D0D',
  onOpen,
  onActiveChange,
  label = 'Photos',
  className = '',
  style
}: DriftWallProps) => {
  const reduced = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const offsetsRef = useRef<number[]>([]);
  const velocitiesRef = useRef<number[]>([]);
  const hoveredColRef = useRef<number>(-1);
  const pointerRef = useRef({ x: 0, y: 0 });
  const pointerDampedRef = useRef({ x: 0, y: 0 });
  const activeIdRef = useRef<string | null>(null);
  const activeChangeRef = useRef(onActiveChange);

  const [containerHeight, setContainerHeight] = useState(600);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    activeChangeRef.current = onActiveChange;
  }, [onActiveChange]);

  const columnTiles = useMemo<Tile[][]>(() => {
    const cols: Tile[][] = Array.from({ length: columns }, () => []);
    items.forEach((item, index) => cols[index % columns].push({ item, index }));
    return cols.map(col => (col.length ? col : items.slice(0, 1).map(item => ({ item, index: 0 }))));
  }, [items, columns]);

  const columnMeta = useMemo<ColumnMeta[]>(() => {
    const unit = tileHeight + gap;
    return columnTiles.map(col => {
      const copyHeight = Math.max(unit, col.length * unit);
      const copies = Math.max(2, Math.ceil((containerHeight * 1.6) / copyHeight) + 1);
      return { copyHeight, copies };
    });
  }, [columnTiles, tileHeight, gap, containerHeight]);

  useLayoutEffect(() => {
    if (!containerRef.current) return undefined;
    const ro = new ResizeObserver(([entry]) => setContainerHeight(entry.contentRect.height || 600));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const baseVelocities = useMemo<number[]>(() => {
    const dirSign = direction === 'up' ? 1 : -1;
    return columnTiles.map((_, c) => speed * columnFactor(c, variance) * dirSign * (c % 2 === 0 ? 1 : -1));
  }, [columnTiles, speed, direction, variance]);

  useEffect(() => {
    offsetsRef.current = columnMeta.map((meta, c) => meta.copyHeight * ((c * 0.37) % 1));
    velocitiesRef.current = columnTiles.map(() => 0);
    trackRefs.current.forEach((el, c) => {
      if (el) el.style.transform = `translate3d(0, ${-(offsetsRef.current[c] ?? 0)}px, 0)`;
    });
  }, [columnMeta, columnTiles]);

  const applyPlaneTransform = useCallback(
    (px: number, py: number) => {
      const plane = planeRef.current;
      if (!plane) return;
      plane.style.transform = `translate(-50%, -50%) scale(1.18) rotateX(${tilt + py}deg) rotateY(${turn + px}deg) rotateZ(${roll}deg) translateZ(${-depth}px)`;
    },
    [tilt, turn, roll, depth]
  );

  useEffect(() => {
    const container = containerRef.current;
    applyPlaneTransform(0, 0);
    if (!container || reduced) return undefined;
    let raf = 0;
    let last: number | null = null;
    const animate = (ts: number) => {
      if (last === null) last = ts;
      const dt = Math.min(0.05, Math.max(0, ts - last) / 1000);
      last = ts;

      const maxTilt = parallax * 8;
      const damp = 1 - Math.exp(-dt / 0.12);
      const damped = pointerDampedRef.current;
      damped.x += (pointerRef.current.x * maxTilt - damped.x) * damp;
      damped.y += (-pointerRef.current.y * maxTilt - damped.y) * damp;
      applyPlaneTransform(damped.x, damped.y);

      for (let c = 0; c < trackRefs.current.length; c++) {
        const meta = columnMeta[c];
        if (!meta) continue;
        const target = hoveredColRef.current === c ? 0 : baseVelocities[c];
        const ease = 1 - Math.exp(-dt / (target === 0 ? 0.16 : 0.28));
        velocitiesRef.current[c] += (target - velocitiesRef.current[c]) * ease;
        let next = (offsetsRef.current[c] ?? 0) + velocitiesRef.current[c] * dt;
        next = ((next % meta.copyHeight) + meta.copyHeight) % meta.copyHeight;
        offsetsRef.current[c] = next;
        const el = trackRefs.current[c];
        if (el) el.style.transform = `translate3d(0, ${-next}px, 0)`;
      }
      raf = requestAnimationFrame(animate);
    };
    // Only drift while some of the wall is on screen.
    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      raf = 0;
      last = null;
      if (entry.isIntersecting) raf = requestAnimationFrame(animate);
    });
    observer.observe(container);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [baseVelocities, columnMeta, parallax, reduced, applyPlaneTransform]);

  const setActive = useCallback((id: string | null, col: number, index: number | null) => {
    if (id === activeIdRef.current) return;
    activeIdRef.current = id;
    hoveredColRef.current = col;
    setActiveId(id);
    activeChangeRef.current?.(index);
  }, []);

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (parallax > 0 && !reduced) {
      pointerRef.current = { x: (e.clientX - rect.left) / rect.width - 0.5, y: (e.clientY - rect.top) / rect.height - 0.5 };
    }
    if (e.pointerType !== 'mouse') return;
    const hit = document.elementFromPoint(e.clientX, e.clientY);
    const tile = hit?.closest<HTMLElement>('[data-tile-id]');
    if (tile) setActive(tile.dataset.tileId ?? null, Number(tile.dataset.col), Number(tile.dataset.index));
  };

  const onPointerLeave = () => {
    pointerRef.current = { x: 0, y: 0 };
    setActive(null, -1, null);
  };

  // One click handler for every tile, repeats included (they're not buttons themselves).
  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const tile = (e.target as HTMLElement).closest<HTMLElement>('[data-tile-id]');
    if (tile) onOpen?.(Number(tile.dataset.index), tile);
  };

  // A focused tile brings its column to rest with that tile in the middle of the wall.
  const onTileFocus = (id: string, col: number, index: number, el: HTMLElement) => {
    const meta = columnMeta[col];
    if (meta) {
      const wanted = el.offsetTop + (tileHeight + gap) / 2 - containerHeight / 2;
      offsetsRef.current[col] = ((wanted % meta.copyHeight) + meta.copyHeight) % meta.copyHeight;
      const track = trackRefs.current[col];
      if (track) track.style.transform = `translate3d(0, ${-offsetsRef.current[col]}px, 0)`;
    }
    setActive(id, col, index);
  };

  // Soft edges on all four sides (the registry's oval vignette left the corners and sides empty).
  const maskStyle =
    'linear-gradient(to right, transparent, #0D0D0D var(--dw-side), #0D0D0D calc(100% - var(--dw-side)), transparent), linear-gradient(to bottom, transparent, #0D0D0D var(--dw-end), #0D0D0D calc(100% - var(--dw-end)), transparent)';

  const cssVars = {
    '--dw-tile-w': `${tileWidth}px`,
    '--dw-tile-h': `${tileHeight}px`,
    '--dw-gap': `${gap}px`,
    '--dw-radius': `${radius}px`,
    '--dw-lift': `${lift}px`,
    '--dw-dim': dim,
    '--dw-overlay': overlayColor,
    '--dw-side': `${(fade * 12).toFixed(1)}%`,
    '--dw-end': `${(fade * 22).toFixed(1)}%`,
    perspective: `${perspective}px`,
    perspectiveOrigin: '50% 50%',
    WebkitMaskImage: maskStyle,
    maskImage: maskStyle,
    WebkitMaskComposite: 'source-in',
    maskComposite: 'intersect',
    ...style
  } as CSSProperties;

  const tileClass = 'group/tile relative block w-full flex-none cursor-pointer outline-none h-[calc(var(--dw-tile-h)+var(--dw-gap))] [transform-style:preserve-3d]';
  const innerClass = cx(
    'pointer-events-none absolute inset-[calc(var(--dw-gap)/2)] block overflow-hidden bg-rc-surface',
    'rounded-[var(--dw-radius)] opacity-[var(--dw-dim)] [transform:translateZ(0)]',
    'transition-[transform,opacity,box-shadow] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
    'group-[.is-active]/tile:opacity-100 group-[.is-active]/tile:[transform:translateZ(var(--dw-lift))]',
    'group-[.is-active]/tile:shadow-[0_24px_60px_-18px_rgba(13,13,13,0.8)]',
    'group-focus-visible/tile:opacity-100 group-focus-visible/tile:[transform:translateZ(var(--dw-lift))]',
    'group-focus-visible/tile:shadow-[0_24px_60px_-18px_rgba(13,13,13,0.8),0_0_0_2px_#FFFFFF]'
  );
  const imgClass = cx(
    'block h-full w-full select-none object-cover [filter:saturate(0.92)]',
    'transition-[filter] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
    'group-[.is-active]/tile:[filter:saturate(1.05)] group-focus-visible/tile:[filter:saturate(1.05)]'
  );
  const overlayClass = cx(
    'pointer-events-none absolute inset-0 bg-[var(--dw-overlay)] opacity-[0.24]',
    'transition-opacity duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
    'group-[.is-active]/tile:opacity-0 group-focus-visible/tile:opacity-0'
  );

  const renderTile = ({ item, index }: Tile, id: string, col: number, primary: boolean) => {
    const inner = (
      <span className={innerClass}>
        <img src={item.image} alt="" loading="lazy" decoding="async" draggable={false} className={imgClass} />
        <span className={overlayClass} aria-hidden="true" />
      </span>
    );
    const shared = {
      className: cx(tileClass, activeId === id && 'is-active'),
      'data-tile-id': id,
      'data-col': col,
      'data-index': index
    };
    return primary ? (
      <button
        key={id}
        type="button"
        aria-label={item.label}
        {...shared}
        onFocus={e => onTileFocus(id, col, index, e.currentTarget)}
        onBlur={() => setActive(null, -1, null)}
      >
        {inner}
      </button>
    ) : (
      <span key={id} aria-hidden="true" {...shared}>
        {inner}
      </span>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cx('relative h-full w-full overflow-hidden', className)}
      style={cssVars}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
      role="group"
      aria-label={label}
    >
      <div ref={planeRef} className="absolute left-1/2 top-1/2 flex flex-row [transform-style:preserve-3d] [transform-origin:50%_50%] will-change-transform">
        {columnTiles.map((col, c) => {
          const meta = columnMeta[c];
          return (
            <div className="relative w-[calc(var(--dw-tile-w)+var(--dw-gap))] [transform-style:preserve-3d]" key={`col-${c}`}>
              <div
                className="flex flex-col [transform-style:preserve-3d] will-change-transform"
                ref={el => {
                  trackRefs.current[c] = el;
                }}
              >
                {Array.from({ length: meta.copies }, (_, copy) =>
                  // The first copy in a photo's own column is its button; every other copy is a repeat.
                  col.map((tile, row) => renderTile(tile, `${c}-${copy}-${row}`, c, copy === 0 && tile.index % columns === c))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DriftWall;
