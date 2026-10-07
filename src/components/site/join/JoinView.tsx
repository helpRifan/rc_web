'use client';

import { useEffect, useRef, useState } from 'react';
import { ScrambleHeading } from '@/components/site/ScrambleHeading';
import { SITE } from '@/lib/site';
import { JoinField } from './JoinField';
import { WaitlistForm } from './WaitlistForm';

export const JOIN_LEDE = {
  open: 'Recruitment is open. Add your name to the list and we’ll email you when intake opens. New members start with beginner workshops.',
  closed: 'Recruitment is closed right now. Leave your email and we’ll tell you when it opens.',
} as const;

/** The whole Join page: the fluid, the copy and the form, which floats on the fluid with no card. */
export function JoinView({ open, domains }: { open: boolean; domains: string[] }) {
  const [typing, setTyping] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Pause the fluid 500ms after a field gains focus (the tap's splash plays out first).
  const onFocusChange = (inside: boolean) => {
    clearTimeout(typingTimer.current);
    if (inside) typingTimer.current = setTimeout(() => setTyping(true), 500);
    else setTyping(false);
  };
  useEffect(() => () => clearTimeout(typingTimer.current), []);

  return (
    <section aria-labelledby="join-title" className="site-gutter relative isolate flex min-h-svh flex-col justify-end pb-10 pt-28 md:justify-center md:pb-16">
      {/* The poster: a real frame of the same fluid, shown first and whenever WebGL can't run. */}
      <div aria-hidden="true" className="absolute inset-0 -z-20">
        <picture>
          <source media="(max-width: 767px)" srcSet="/join/fluid-390.webp" />
          {/* A plain img: a fixed-size local poster, and the LCP image, loaded at high priority. */}
          <img src="/join/fluid-1440.webp" alt="" fetchPriority="high" className="h-full w-full object-cover" />
        </picture>
      </div>
      <JoinField typing={typing} />
      <div
        data-join-content
        className="relative z-10 max-w-[48rem] before:absolute before:-inset-x-5 before:-inset-y-8 before:-z-10 before:rounded-[48px] before:bg-rc-bg/82 before:blur-[28px] before:content-[''] sm:before:-inset-x-12 sm:before:-inset-y-12"
      >
        <ScrambleHeading as="h1" id="join-title" text="Join the club" className="type-display text-balance text-rc-ink" />
        <p className="mt-6 max-w-[36em] text-lg text-rc-text">{open ? JOIN_LEDE.open : JOIN_LEDE.closed}</p>
        <div className="mt-10">
          <noscript>
            <p className="text-rc-text">
              This form needs JavaScript. To join the list without it, email{' '}
              <a href={`mailto:${SITE.email}`} className="underline underline-offset-4">
                {SITE.email}
              </a>
              .
            </p>
          </noscript>
          <WaitlistForm domains={domains} open={open} onFocusChange={onFocusChange} />
        </div>
      </div>
    </section>
  );
}
