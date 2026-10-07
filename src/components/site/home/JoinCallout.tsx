import { ButtonLink } from '@/components/site/ButtonLink';

export const JOIN_CALLOUT = {
  open: { heading: 'Recruitment is open.', body: 'Add your name on the Join page and we’ll email you when intake starts. New members begin with beginner workshops.' },
  closed: { heading: 'Build robots with us.', body: 'Recruitment opens each semester. Leave your email on the Join page and we’ll tell you when it does.' },
} as const;

/** The page's last word: how to get in, worded by whether recruitment is open. */
export function JoinCallout({ open }: { open: boolean }) {
  const copy = open ? JOIN_CALLOUT.open : JOIN_CALLOUT.closed;
  return (
    <section aria-labelledby="home-join" className="site-gutter relative isolate overflow-x-clip py-24 sm:py-28 lg:py-36">
      <div aria-hidden="true" className="field-poster absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(70%_80%_at_80%_50%,#0D0D0D,transparent_75%)]" />
      <div className="max-w-[80rem]">
        <h2 id="home-join" className="type-display max-w-[13ch] text-balance text-rc-ink">
          {copy.heading}
        </h2>
        <p className="mt-6 max-w-[40em] text-lg text-rc-text">{copy.body}</p>
        <ButtonLink href="/join" className="mt-9 w-full sm:w-auto">
          Join the club
        </ButtonLink>
      </div>
    </section>
  );
}
