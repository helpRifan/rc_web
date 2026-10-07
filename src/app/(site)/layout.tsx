import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { getPublishedPartners } from '@/lib/data/partners';
import { safe } from '@/lib/data/safe';

export default async function SiteLayout({ children }: LayoutProps<'/'>) {
  // The Partners nav item exists only while a partner is published (spec 6.7). A failed query just hides it.
  const partners = await safe('partners (nav)', () => getPublishedPartners(), []);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-rc-bg focus:px-4 focus:py-3 focus:text-rc-ink">
        Skip to content
      </a>
      <SiteHeader showPartners={partners.length > 0} />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
