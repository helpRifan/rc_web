'use client';

// ScrollStack from React Bits (https://reactbits.dev), ported for this site (events brief 5.7).
// The stock component pinned cards by writing translateY from a Lenis-smoothed scroll value, which
// lags native scrolling, hijacks the page's scroll and never stops its rAF. Here cards pin with
// position: sticky (on the compositor, no lag), and JS writes only each card's scale and a dim
// amount. Removed: Lenis, the inner-scroller mode, rotation, blur, scaleEndPosition, scaleDuration
// and onStackComplete. The public API is still ScrollStack plus ScrollStackItem.
import { Children, type CSSProperties, isValidElement, type ReactElement, type ReactNode, useLayoutEffect, useRef } from 'react';

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

/** A marker: ScrollStack renders each item's <li>. */
export function ScrollStackItem({ children }: ScrollStackItemProps) {
  return <>{children}</>;
}

interface ScrollStackProps {
  children: ReactNode;
  /** Set the CSS variables below here, responsively: --stack-top, --stack-gap, --card-gap. */
  className?: string;
  /** false renders a plain list: no sticky, no transforms (reduced motion, or fewer than 3 cards). */
  enabled?: boolean;
  /** Scale of the first card once fully covered. */
  baseScale?: number;
  /** Each later card ends this much larger. */
  itemScale?: number;
  /** How dark a covered card gets, 0 to 1. */
  dimAmount?: number;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export default function ScrollStack({ children, className = '', enabled = true, baseScale = 0.88, itemScale = 0.025, dimAmount = 0.55 }: ScrollStackProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<ScrollStackItemProps>[];

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!enabled || !list) return;
    const cards = Array.from(list.querySelectorAll<HTMLElement>(':scope > li[data-card]'));
    let pins: number[] = [];
    let spans: number[] = [];
    const last = new Map<HTMLElement, { scale: number; depth: number }>();
    let raf = 0;

    const measure = () => {
      const stackGap = parseFloat(getComputedStyle(list).getPropertyValue('--stack-gap')) || 24;
      let natural = list.getBoundingClientRect().top + window.scrollY;
      pins = [];
      spans = [];
      for (const card of cards) {
        const style = getComputedStyle(card);
        const marginBottom = parseFloat(style.marginBottom) || 0;
        pins.push(natural - (parseFloat(style.top) || 0));
        spans.push(Math.max(card.offsetHeight + marginBottom - stackGap, 1));
        natural += card.offsetHeight + marginBottom;
      }
    };

    const update = () => {
      raf = 0;
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return; // the last card is never covered
        const p = clamp01((window.scrollY - pins[i]) / spans[i]);
        const scale = 1 - p * (1 - (baseScale + i * itemScale));
        const depth = p * dimAmount;
        const prev = last.get(card);
        if (prev && Math.abs(prev.scale - scale) < 0.001 && Math.abs(prev.depth - depth) < 0.001) return;
        last.set(card, { scale, depth });
        card.style.transform = `scale(${scale.toFixed(4)})`;
        card.style.setProperty('--depth', depth.toFixed(3));
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    // A keyboard-focused card goes to the top of the deck, never under the next one. Mouse clicks don't.
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.matches(':focus-visible')) return;
      const index = cards.findIndex(card => card.contains(target));
      if (index >= 0) window.scrollTo({ top: pins[index], behavior: 'instant' });
    };

    // The scroll listener is attached only while the list is near the viewport.
    let listening = false;
    const listen = (on: boolean) => {
      if (on === listening) return;
      listening = on;
      if (on) window.addEventListener('scroll', onScroll, { passive: true });
      else window.removeEventListener('scroll', onScroll);
    };
    const near = new IntersectionObserver(entries => listen(entries.some(e => e.isIntersecting)), { rootMargin: '100% 0px' });
    const resize = new ResizeObserver(() => {
      measure();
      update();
    });

    measure();
    update();
    near.observe(list);
    resize.observe(list);
    list.addEventListener('focusin', onFocusIn);
    return () => {
      cancelAnimationFrame(raf);
      listen(false);
      near.disconnect();
      resize.disconnect();
      list.removeEventListener('focusin', onFocusIn);
      for (const card of cards) {
        card.style.transform = '';
        card.style.removeProperty('--depth');
      }
    };
  }, [enabled, baseScale, itemScale, dimAmount, items.length]);

  return (
    // The geometry variables have fallbacks here, so the page's own values (set on className) always win.
    <ul ref={listRef} role="list" className={`relative ${className}`}>
      {items.map((item, i) => (
        <li
          key={item.key ?? i}
          data-card
          style={{ '--i': i } as CSSProperties}
          className={`${enabled ? 'sticky origin-top will-change-transform' : ''} top-[calc(var(--stack-top,max(6rem,14svh))+var(--i)*var(--stack-gap,24px))] [&:not(:last-of-type)]:mb-[var(--card-gap,6rem)] ${item.props.itemClassName ?? ''}`}
        >
          {item.props.children}
        </li>
      ))}
      {enabled && <li aria-hidden="true" className="h-[20svh]" />}
    </ul>
  );
}
