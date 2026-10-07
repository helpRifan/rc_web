'use client';

import { CircleCheck, CircleX } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import DecryptedText from '@/components/reactbits/DecryptedText';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { TerminalPanel } from './TerminalPanel';

export type RevealRow = { label: string; value: string; status?: 'issued' | 'revoked' };

const STAGGER_MS = 120;

/** One value, decrypting word by word inside boxes sized by the real words, so nothing re-wraps. */
function Decrypting({ text, active }: { text: string; active: boolean }) {
  const words = text.split(' ');
  return (
    <span aria-hidden="true">
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="relative inline-block whitespace-nowrap">
            <span className="invisible">{word}</span>
            {active && (
              <span data-scramble className="absolute inset-0">
                <DecryptedText text={word} animateOn="view" speed={34} maxIterations={10} className="text-rc-ink" encryptedClassName="text-rc-accent" />
              </span>
            )}
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  );
}

/**
 * The verify page's terminal reveal (certificates brief 2): the details resolve line by line over
 * the glyph field, 120ms apart. The <dl> always holds the real text, so screen readers (and
 * reduced motion) get it straight away.
 */
export function VerifyReveal({ rows }: { rows: RevealRow[] }) {
  const still = usePrefersReducedMotion();
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (still || shown >= rows.length) return;
    const timer = window.setTimeout(() => setShown(n => n + 1), shown === 0 ? 200 : STAGGER_MS);
    return () => window.clearTimeout(timer);
  }, [still, shown, rows.length]);

  return (
    <TerminalPanel className="max-w-[56rem] sm:min-h-[26rem]">
      <dl className="grid gap-x-10 gap-y-5 p-6 sm:grid-cols-[9rem_minmax(0,1fr)] sm:p-10 lg:p-12">
        {rows.map((row, i) => (
          <Fragment key={row.label}>
            <dt className="text-[15px] text-rc-muted sm:pt-1">{row.label}</dt>
            <dd className="-mt-4 text-xl font-semibold text-rc-ink [font-stretch:110%] sm:mt-0">
              {row.status ? (
                <span className="inline-flex items-center gap-2">
                  {row.status === 'issued' ? (
                    <CircleCheck aria-hidden="true" className="size-5 text-rc-accent" strokeWidth={2} />
                  ) : (
                    <CircleX aria-hidden="true" className="size-5 text-rc-muted" strokeWidth={2} />
                  )}
                  {row.value}
                </span>
              ) : still ? (
                row.value
              ) : (
                <>
                  <span className="sr-only">{row.value}</span>
                  <Decrypting text={row.value} active={i < shown} />
                </>
              )}
            </dd>
          </Fragment>
        ))}
      </dl>
    </TerminalPanel>
  );
}
