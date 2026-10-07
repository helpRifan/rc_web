'use client';

/*
 * Scroll Reveal, after React Bits (https://reactbits.dev/r/ScrollReveal-TS-TW).
 * Copyright (c) 2026 David Haz, MIT + Commons Clause. See THIRD_PARTY_NOTICES.md.
 * The same effect (each word clears from faint and blurred as the text scrolls up, the block
 * levelling from a slight tilt) scrubbed by one scroll listener instead of GSAP ScrollTrigger,
 * whose cleanup in the registry killed every trigger on the page. Server HTML and reduced motion
 * show the text plainly. It renders a paragraph; its classes come from the caller.
 */

import { useEffect, useMemo, useRef } from 'react';

type Props = {
  children: string;
  className?: string;
  baseOpacity?: number;
  blurStrength?: number;
  baseRotation?: number;
};

const clamp = (v: number) => Math.min(1, Math.max(0, v));
/** Words that are fading at once: higher is a softer, wider wave. */
const SPREAD = 5;

export default function ScrollReveal({ children, className = '', baseOpacity = 0.12, blurStrength = 4, baseRotation = 2 }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = useMemo(() => children.split(/(\s+)/), [children]);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const spans = Array.from(el.querySelectorAll<HTMLElement>('[data-word]'));
    const last = new Array<number>(spans.length).fill(-1);
    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Words start clearing when the block's top passes 88% of the screen and finish when its
      // bottom reaches 55%; the tilt levels out over the same stretch.
      const start = vh * 0.88;
      const end = vh * 0.55;
      const p = clamp((start - rect.top) / Math.max(1, start - end + rect.height));
      el.style.transform = `rotate(${(baseRotation * (1 - p)).toFixed(3)}deg)`;
      const steps = spans.length + SPREAD;
      spans.forEach((span, i) => {
        const t = Math.round(clamp((p * steps - i) / SPREAD) * 100) / 100;
        if (t === last[i]) return;
        last[i] = t;
        span.style.opacity = String(baseOpacity + (1 - baseOpacity) * t);
        span.style.filter = blurStrength && t < 1 ? `blur(${(blurStrength * (1 - t)).toFixed(2)}px)` : '';
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    el.style.transformOrigin = '0% 50%';
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      el.style.transform = '';
      spans.forEach(span => {
        span.style.opacity = '';
        span.style.filter = '';
      });
    };
  }, [words, baseOpacity, blurStrength, baseRotation]);

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) =>
        /^\s+$/.test(word) ? (
          word
        ) : (
          <span key={i} data-word className="inline-block">
            {word}
          </span>
        )
      )}
    </p>
  );
}
