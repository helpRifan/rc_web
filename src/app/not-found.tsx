import type { Metadata } from 'next';
import { ButtonLink } from '@/components/site/ButtonLink';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { HeroField } from '@/components/site/home/HeroField';

export const metadata: Metadata = {
  title: 'Page not found',
};

// The root not-found doesn't get the (site) layout, so it renders the header and footer itself.
// The homepage field, dimmed, says "still on our site"; the copy stays calm (no scramble).
export default function NotFound() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-rc-bg focus:px-4 focus:py-3 focus:text-rc-ink">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <section className="site-gutter relative isolate flex min-h-svh items-center overflow-x-clip pt-28 pb-16">
          <HeroField dim />
          <div className="hero-scrim z-10 flex max-w-full flex-col gap-6">
            <h1 className="type-display max-w-[14ch] text-rc-ink">Page not found</h1>
            <p className="max-w-[34em] text-lg text-rc-text">That page doesn’t exist or has moved.</p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/">Go to the homepage</ButtonLink>
              <ButtonLink href="/events" variant="secondary">See events</ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
