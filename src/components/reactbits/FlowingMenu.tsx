'use client';

/*
 * Flowing Menu, from React Bits (https://reactbits.dev/r/FlowingMenu-TS-TW).
 * Copyright (c) 2026 David Haz, MIT + Commons Clause. See THIRD_PARTY_NOTICES.md.
 * Forked for the home page's "What we do":
 * - Rows are Next links with a line of description, left-aligned, styled in globals.css.
 * - The marquee cycles through several photos per row, and runs on CSS (transitions for the
 *   edge-aware slide, a keyframe loop for the flow), so no GSAP.
 * - Keyboard focus opens a row like hover does. Touch screens have no hover, so the row crossing
 *   the middle of the screen flows instead. Reduced motion keeps every row still.
 */

import Link from 'next/link';
import { Fragment, useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';

export interface FlowingMenuItem {
  href: string;
  label: string;
  description: string;
  images: { src: string; alt: string }[];
}

type Edge = 'top' | 'bottom';

const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function parts(row: HTMLElement | null) {
  const marquee = row?.querySelector<HTMLElement>('[data-marquee]');
  const inner = row?.querySelector<HTMLElement>('[data-marquee-inner]');
  return marquee && inner && row ? { row, marquee, inner } : null;
}

function slide(row: HTMLElement | null, edge: Edge, open: boolean) {
  const p = parts(row);
  if (!p || (open && still())) return;
  const out = edge === 'top' ? -101 : 101;
  if (open) {
    // Jump to the entry edge without a transition, then glide in from it.
    p.marquee.style.transition = p.inner.style.transition = 'none';
    p.marquee.style.transform = `translateY(${out}%)`;
    p.inner.style.transform = `translateY(${-out}%)`;
    void p.marquee.offsetHeight;
    p.marquee.style.transition = p.inner.style.transition = '';
    p.marquee.style.transform = p.inner.style.transform = 'translateY(0%)';
    p.row.dataset.open = 'true';
  } else {
    p.marquee.style.transform = `translateY(${out}%)`;
    p.inner.style.transform = `translateY(${-out}%)`;
    delete p.row.dataset.open;
  }
}

const closestEdge = (event: ReactPointerEvent<HTMLElement>): Edge => {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left - rect.width / 2;
  const top = x * x + (event.clientY - rect.top) ** 2;
  const bottom = x * x + (event.clientY - rect.bottom) ** 2;
  return top < bottom ? 'top' : 'bottom';
};

function Row({ item }: { item: FlowingMenuItem }) {
  const rowRef = useRef<HTMLLIElement>(null);
  const sequence = (copy: number) => (
    <div className="flowing-menu-sequence" key={copy}>
      {item.images.map(image => (
        <Fragment key={image.src}>
          <span className="flowing-menu-word">{item.label}</span>
          <img src={image.src} alt="" width={640} height={427} loading="lazy" decoding="async" className="flowing-menu-image" />
        </Fragment>
      ))}
    </div>
  );

  return (
    <li ref={rowRef} data-row className="flowing-menu-row">
      <Link
        href={item.href}
        className="flowing-menu-link"
        onPointerEnter={event => event.pointerType === 'mouse' && slide(rowRef.current, closestEdge(event), true)}
        onPointerLeave={event => event.pointerType === 'mouse' && slide(rowRef.current, closestEdge(event), false)}
        onFocus={() => slide(rowRef.current, 'top', true)}
        onBlur={() => slide(rowRef.current, 'bottom', false)}
      >
        <span className="flowing-menu-label">{item.label}</span>
        <span className="flowing-menu-description">{item.description}</span>
      </Link>
      <div data-marquee aria-hidden="true" className="flowing-menu-marquee">
        <div data-marquee-inner className="flowing-menu-marquee-inner">
          <div className="flowing-menu-track">{[0, 1].map(sequence)}</div>
        </div>
      </div>
    </li>
  );
}

export default function FlowingMenu({ items, className = '' }: { items: FlowingMenuItem[]; className?: string }) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list || !window.matchMedia('(hover: none)').matches) return undefined;
    // A band through the middle of the screen: the row inside it flows as you scroll past.
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          const row = entry.target as HTMLElement;
          const below = entry.boundingClientRect.top > window.innerHeight / 2;
          slide(row, below ? 'bottom' : 'top', entry.isIntersecting);
        }
      },
      { rootMargin: '-46% 0px -46% 0px' }
    );
    list.querySelectorAll('[data-row]').forEach(row => observer.observe(row));
    return () => observer.disconnect();
  }, []);

  return (
    <ul ref={listRef} role="list" className={`flowing-menu ${className}`.trim()}>
      {items.map(item => (
        <Row key={item.href + item.label} item={item} />
      ))}
    </ul>
  );
}
