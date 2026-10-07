'use client';
// ChromaGrid, from React Bits (https://reactbits.dev, MIT + Commons Clause; see THIRD_PARTY_NOTICES.md).
// Forked for the Team list (team brief 5.12): the cards are the club's people as Next links, the
// grid fills its width, the colour spotlight follows keyboard focus too, coarse pointers get true
// colour (no hover to reveal it), and reduced motion snaps the spotlight instead of easing it.
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export interface ChromaItem {
  key: string;
  href: string;
  name: string;
  role: string | null;
  divisionLabel: string | null;
  /** A face-cropped photo URL, or null for the monogram tile. */
  photo: string | null;
  initials: string;
  /** The card's gradient angle, by division. */
  gradientAngle: number;
}

export interface ChromaGridProps {
  items: ChromaItem[];
  className?: string;
  radius?: number;
  damping?: number;
  fadeOut?: number;
  ease?: string;
  /** Touch: no grayscale layers, since there's no hover to lift them. */
  coarse?: boolean;
  /** Reduced motion: the spotlight jumps to the pointer. */
  still?: boolean;
}

type SetterFn = (v: number | string) => void;

const GRAY_MASK =
  'radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0%,transparent 15%,rgba(13,13,13,0.10) 30%,rgba(13,13,13,0.22)45%,rgba(13,13,13,0.35)60%,rgba(13,13,13,0.50)75%,rgba(13,13,13,0.68)88%,white 100%)';
const FADE_MASK =
  'radial-gradient(circle var(--r) at var(--x) var(--y),white 0%,white 15%,rgba(255,255,255,0.90)30%,rgba(255,255,255,0.78)45%,rgba(255,255,255,0.65)60%,rgba(255,255,255,0.50)75%,rgba(255,255,255,0.32)88%,transparent 100%)';

const ChromaGrid: React.FC<ChromaGridProps> = ({
  items,
  className = '',
  radius = 300,
  damping = 0.45,
  fadeOut = 0.6,
  ease = 'power3.out',
  coarse = false,
  still = false
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const setX = useRef<SetterFn | null>(null);
  const setY = useRef<SetterFn | null>(null);
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setX.current = gsap.quickSetter(el, '--x', 'px') as SetterFn;
    setY.current = gsap.quickSetter(el, '--y', 'px') as SetterFn;
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);
  }, []);

  const moveTo = (x: number, y: number) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: still ? 0 : damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true
    });
  };

  const handleMove = (e: React.PointerEvent) => {
    const r = rootRef.current!.getBoundingClientRect();
    moveTo(e.clientX - r.left, e.clientY - r.top);
    gsap.to(fadeRef.current, { opacity: 0, duration: still ? 0 : 0.25, overwrite: true });
  };

  const handleLeave = () => {
    gsap.to(fadeRef.current, { opacity: 1, duration: still ? 0 : fadeOut, overwrite: true });
  };

  // Keyboard: the focused card is the lit one.
  const handleFocus = (e: React.FocusEvent<HTMLElement>) => {
    const root = rootRef.current?.getBoundingClientRect();
    const card = e.currentTarget.getBoundingClientRect();
    if (!root) return;
    moveTo(card.left - root.left + card.width / 2, card.top - root.top + card.height / 2);
    gsap.to(fadeRef.current, { opacity: 0, duration: still ? 0 : 0.25, overwrite: true });
  };

  const handleCardMove: React.MouseEventHandler<HTMLElement> = e => {
    const c = e.currentTarget as HTMLElement;
    const rect = c.getBoundingClientRect();
    c.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    c.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={rootRef}
      onPointerMove={coarse ? undefined : handleMove}
      onPointerLeave={coarse ? undefined : handleLeave}
      className={`chroma-grid relative grid w-full gap-3 ${className}`}
      style={{ '--r': `${radius}px`, '--x': '50%', '--y': '50%' } as React.CSSProperties}
    >
      {items.map(c => (
        <Link
          key={c.key}
          href={c.href}
          onMouseMove={handleCardMove}
          onFocus={coarse ? undefined : handleFocus}
          onBlur={coarse ? undefined : handleLeave}
          className="group relative flex flex-col overflow-hidden rounded-[20px] border border-[rgba(191,199,206,0.16)] transition-colors duration-300 hover:border-[var(--card-border)] focus-visible:border-[var(--card-border)]"
          style={
            {
              '--card-border': '#619AC3',
              background: `linear-gradient(${c.gradientAngle}deg, rgba(74,141,183,0.55), #0D0D0D 70%)`,
              '--spotlight-color': 'rgba(255,255,255,0.3)'
            } as React.CSSProperties
          }
        >
          <div
            className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: 'radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 70%)' }}
          />
          <div className="relative z-10 p-[10px]">
            {c.photo ? (
              <span className="relative block aspect-[4/4.2] overflow-hidden rounded-xl">
                <Image src={c.photo} alt="" fill sizes="(min-width: 768px) 240px, 45vw" className="object-cover" />
              </span>
            ) : (
              <span aria-hidden="true" className="monotile @container flex aspect-[4/4.2] items-center justify-center rounded-xl">
                <span className="text-[50cqw] font-extrabold leading-none text-rc-text [font-stretch:125%]">{c.initials}</span>
              </span>
            )}
          </div>
          <div className="relative z-10 px-3 pb-4 pt-1">
            <h3 className="w-[110%] text-[17px] font-bold leading-snug text-rc-ink">{c.name}</h3>
            {c.role && <p className="mt-1 text-[14.5px] leading-snug text-rc-text">{c.role}</p>}
            {c.divisionLabel && <p className="mt-0.5 text-[13.5px] leading-snug text-rc-muted">{c.divisionLabel}</p>}
          </div>
        </Link>
      ))}
      {!coarse && (
        <>
          <div
            className="pointer-events-none absolute inset-0 z-30"
            style={{
              backdropFilter: 'grayscale(1) brightness(0.78)',
              WebkitBackdropFilter: 'grayscale(1) brightness(0.78)',
              background: 'rgba(13,13,13,0.001)',
              maskImage: GRAY_MASK,
              WebkitMaskImage: GRAY_MASK
            }}
          />
          <div
            ref={fadeRef}
            className="pointer-events-none absolute inset-0 z-40 transition-opacity duration-[250ms]"
            style={{
              backdropFilter: 'grayscale(1) brightness(0.78)',
              WebkitBackdropFilter: 'grayscale(1) brightness(0.78)',
              background: 'rgba(13,13,13,0.001)',
              maskImage: FADE_MASK,
              WebkitMaskImage: FADE_MASK,
              opacity: 1
            }}
          />
        </>
      )}
    </div>
  );
};

export default ChromaGrid;
