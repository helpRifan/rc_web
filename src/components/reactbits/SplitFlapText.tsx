'use client';

/*
 * Split Flap Text, from React Bits (https://reactbits.dev/r/SplitFlapText-TS-TW).
 * Copyright (c) 2026 David Haz, MIT + Commons Clause. See THIRD_PARTY_NOTICES.md.
 * Forked for the home page's numbers: one phrase, flipped through once when it scrolls into view
 * (the registry cycles through words forever). The server HTML is the settled text, characters
 * outside the charset (a "+") never flip, the styles live in globals.css in the club palette,
 * and the face is the page's own (the registry used monospace).
 */

import { useEffect, useRef, useState, type CSSProperties } from 'react';

type Tile = { current: string; next: string; flipping: boolean; tick: number };

export interface SplitFlapTextProps {
  text: string;
  charset?: string;
  /** Seconds per flip. */
  flipDuration?: number;
  /** Seconds between neighbouring tiles starting. */
  stagger?: number;
  /** Flips the first tile makes; each tile after it makes a few more. */
  flipsPerChar?: number;
  className?: string;
}

const settled = (text: string): Tile[] => Array.from(text).map(char => ({ current: char, next: char, flipping: false, tick: 0 }));
const pick = (charset: string) => charset.charAt(Math.floor(Math.random() * charset.length));
const visible = (char: string) => (char === ' ' ? ' ' : char);

export default function SplitFlapText({ text, charset = '0123456789', flipDuration = 0.07, stagger = 0.09, flipsPerChar = 8, className = '' }: SplitFlapTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [tiles, setTiles] = useState(() => settled(text));

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const target = Array.from(text);
    const flipMs = Math.max(40, flipDuration * 1000);
    let raf = 0;

    const run = () => {
      const plans = target.map((char, i) => ({
        sequence: charset.includes(char) ? [...Array.from({ length: flipsPerChar + i * 3 }, () => pick(charset)), char] : [],
        start: i * stagger * 1000,
        step: -1,
        done: !charset.includes(char)
      }));
      const startedAt = performance.now();
      const tick = (now: number) => {
        const elapsed = now - startedAt;
        const updates: { i: number; current: string; next: string; flipping: boolean }[] = [];
        let more = false;
        plans.forEach((plan, i) => {
          if (plan.done) return;
          const local = elapsed - plan.start;
          if (local < 0) {
            more = true;
            return;
          }
          const step = Math.floor(local / flipMs);
          if (step < plan.sequence.length) {
            more = true;
            if (step !== plan.step) {
              plan.step = step;
              updates.push({ i, current: step === 0 ? target[i] : plan.sequence[step - 1], next: plan.sequence[step], flipping: true });
            }
          } else {
            plan.done = true;
            updates.push({ i, current: target[i], next: target[i], flipping: false });
          }
        });
        if (updates.length) {
          setTiles(previous => {
            const next = [...previous];
            for (const u of updates) next[u.i] = { current: u.current, next: u.next, flipping: u.flipping, tick: previous[u.i].tick + 1 };
            return next;
          });
        }
        raf = more ? requestAnimationFrame(tick) : 0;
      };
      raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        run();
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [text, charset, flipDuration, stagger, flipsPerChar]);

  return (
    <span ref={ref} className={`split-flap ${className}`.trim()} style={{ '--split-flap-duration': `${flipDuration}s` } as CSSProperties}>
      <span className="sr-only">{text}</span>
      {tiles.map((tile, i) => (
        <span className="split-flap-tile" aria-hidden="true" key={i}>
          <span className="split-flap-half split-flap-half--top">
            <span className="split-flap-char">{visible(tile.current)}</span>
          </span>
          <span className="split-flap-half split-flap-half--bottom">
            <span className="split-flap-char">{visible(tile.flipping ? tile.next : tile.current)}</span>
          </span>
          {tile.flipping && (
            <>
              <span className="split-flap-flap split-flap-flap--front" key={`front-${tile.tick}`}>
                <span className="split-flap-char">{visible(tile.current)}</span>
              </span>
              <span className="split-flap-flap split-flap-flap--back" key={`back-${tile.tick}`}>
                <span className="split-flap-char">{visible(tile.next)}</span>
              </span>
            </>
          )}
        </span>
      ))}
    </span>
  );
}
