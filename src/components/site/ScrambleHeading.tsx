'use client';

import { Fragment } from 'react';
import DecryptedText from '@/components/reactbits/DecryptedText';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

type Props = { text: string; as?: 'h1' | 'h2'; id?: string; className?: string };

/**
 * Page headline that decrypts once (at most 600ms). Each word's box is sized by its real
 * text, so scrambled glyphs never re-wrap the lines. The real text is always in the DOM.
 */
export function ScrambleHeading({ text, as: Tag = 'h1', id, className }: Props) {
  const still = usePrefersReducedMotion();
  const words = text.split(' ');
  return (
    <Tag id={id} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <Fragment key={i}>
            <span className="relative inline-block whitespace-nowrap">
              <span className={still ? undefined : 'invisible'}>{word}</span>
              {!still && (
                <span data-scramble className="absolute inset-0">
                  <DecryptedText text={word} animateOn="view" speed={40} maxIterations={12} className="text-rc-ink" encryptedClassName="text-rc-accent" />
                </span>
              )}
            </span>
            {i < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}
