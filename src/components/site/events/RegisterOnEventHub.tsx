'use client';

import { Check, CircleAlert, Copy, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ButtonLink } from '@/components/site/ButtonLink';

type Props = { title: string; url: string; className?: string };

/** Registration happens on VIT's Event Hub, which has no deep links: say what to search for there. */
export function RegisterOnEventHub({ title, url, className = '' }: Props) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    if (state !== 'copied') return;
    const id = setTimeout(() => setState('idle'), 2000);
    return () => clearTimeout(id);
  }, [state]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(title);
      setState('copied');
    } catch {
      setState('failed');
    }
  }

  return (
    <div className={className}>
      <p className="max-w-[56ch] text-rc-text">Search for “{title}” on Event Hub to register.</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href={url} target="_blank" rel="noopener noreferrer" className="gap-2">
          Open VIT Event Hub
          <ExternalLink aria-hidden="true" className="size-4" />
          <span className="sr-only"> (opens in a new tab)</span>
        </ButtonLink>
        <button
          type="button"
          onClick={copy}
          className="type-ui inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-rc-line px-6 text-rc-ink transition-colors hover:border-rc-muted"
        >
          {state === 'copied' ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
          {state === 'copied' ? 'Copied' : 'Copy event name'}
        </button>
      </div>
      {state === 'failed' && (
        <p className="mt-3 flex items-start gap-2 text-rc-text">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Couldn’t copy. Select the name and copy it yourself.
        </p>
      )}
      <p aria-live="polite" className="sr-only">
        {state === 'copied' ? 'Event name copied.' : ''}
      </p>
    </div>
  );
}
