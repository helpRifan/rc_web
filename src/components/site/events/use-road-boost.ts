'use client';

import { type RefObject, useEffect } from 'react';
import type { HyperspeedHandle } from '@/components/reactbits/Hyperspeed';

// Interactive things inside the hero keep their own clicks; holding anywhere else revs the road.
const INTERACTIVE = 'a, button, input, select, textarea, label, [data-no-boost]';
const TEXT = 'h1, h2, p, li, a';
const TOUCH_DELAY_MS = 120;
const TOUCH_SLOP_PX = 10;

/**
 * Press and hold on the hero section to speed the road up. Mouse boosts at once; touch and pen
 * only after a still 120 ms hold, so a scroll swipe never revs it. Active only while `live`.
 */
export function useRoadBoost(sectionRef: RefObject<HTMLElement | null>, roadRef: RefObject<HyperspeedHandle | null>, live: boolean) {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !live) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let start: { x: number; y: number } | null = null;
    let boosting = false;

    const setBoost = (on: boolean) => {
      if (boosting === on) return;
      boosting = on;
      roadRef.current?.setBoost(on);
    };
    const end = () => {
      clearTimeout(timer);
      start = null;
      setBoost(false);
    };

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0 || (event.target as Element | null)?.closest(INTERACTIVE)) return;
      if (event.pointerType === 'mouse') {
        setBoost(true);
        return;
      }
      start = { x: event.clientX, y: event.clientY };
      clearTimeout(timer);
      timer = setTimeout(() => setBoost(true), TOUCH_DELAY_MS);
    };
    const onMove = (event: PointerEvent) => {
      if (!start || boosting) return;
      if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > TOUCH_SLOP_PX) end();
    };
    const onContextMenu = (event: MouseEvent) => {
      // A long press on the road shouldn't open a menu, but text stays selectable.
      if (!(event.target as Element | null)?.closest(TEXT)) event.preventDefault();
    };

    section.addEventListener('pointerdown', onDown, { passive: true });
    section.addEventListener('pointermove', onMove, { passive: true });
    section.addEventListener('pointerleave', end);
    section.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    window.addEventListener('blur', end);
    return () => {
      end();
      section.removeEventListener('pointerdown', onDown);
      section.removeEventListener('pointermove', onMove);
      section.removeEventListener('pointerleave', end);
      section.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      window.removeEventListener('blur', end);
    };
  }, [sectionRef, roadRef, live]);
}
