'use client';

import type { ReactNode } from 'react';
import ScrollStack, { ScrollStackItem } from '@/components/reactbits/ScrollStack';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

/**
 * Past events arrive like cars pulling into a grid slot: each card parks on the one before.
 * Reduced motion, and any year with fewer than 3 events, get the plain list.
 */
export function PastEventsStack({ cards, className = '' }: { cards: Array<{ key: string; node: ReactNode }>; className?: string }) {
  const reduce = usePrefersReducedMotion();
  return (
    <ScrollStack
      enabled={!reduce && cards.length >= 3}
      baseScale={0.88}
      itemScale={0.025}
      dimAmount={0.55}
      className={`[--stack-top:max(5rem,11svh)] [--stack-gap:12px] [--card-gap:2.5rem] md:[--stack-top:max(6rem,14svh)] md:[--stack-gap:24px] md:[--card-gap:6rem] ${className}`}
    >
      {cards.map(card => (
        <ScrollStackItem key={card.key}>{card.node}</ScrollStackItem>
      ))}
    </ScrollStack>
  );
}
