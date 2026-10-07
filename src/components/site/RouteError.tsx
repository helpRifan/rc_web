'use client';

import { ButtonLink } from './ButtonLink';

type Props = { title: string; body: string; reset: () => void };

/** The body of a route's error.tsx: what happened, a retry and a way home. Never a stack trace. */
export function RouteError({ title, body, reset }: Props) {
  return (
    <section className="site-gutter flex min-h-[80svh] flex-col justify-center gap-6 pt-28 pb-16">
      <h1 className="type-display max-w-[14ch] text-balance text-rc-ink">{title}</h1>
      <p className="max-w-[34em] text-lg text-rc-text">{body}</p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="type-ui inline-flex min-h-12 items-center justify-center rounded-md bg-rc-accent px-6 text-rc-bg transition-colors hover:bg-rc-accent-deep"
        >
          Try again
        </button>
        <ButtonLink href="/" variant="secondary">
          Go to the homepage
        </ButtonLink>
      </div>
    </section>
  );
}
