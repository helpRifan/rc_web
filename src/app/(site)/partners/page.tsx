import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { PageIntro } from '@/components/site/PageIntro';
import { getPublishedPartners } from '@/lib/data/partners';
import { safe } from '@/lib/data/safe';
import { usableLogo } from '@/lib/partners';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Partners',
  description: 'Companies and groups that work with Robotics Club at VIT Chennai.',
};

/** Hidden (404) until the owner publishes a real partner (spec 6.7, Q8). */
export default async function PartnersPage() {
  const partners = await safe('partners', () => getPublishedPartners(), []);
  if (partners.length === 0) notFound();

  return (
    <section aria-labelledby="partners-title" className="site-gutter pb-20 pt-28 sm:pb-24 lg:pb-28">
      <div className="max-w-[80rem]">
        <PageIntro title="Partners" lead="Companies and groups that work with Robotics Club at VIT Chennai." />
        <ul role="list" className="mt-12 lg:mt-16">
          {partners.map(partner => {
            const logo = usableLogo(partner);
            return (
              <li key={partner.id} className="flex flex-col gap-4 py-10 sm:flex-row sm:items-start sm:gap-10">
                <div className="flex h-10 w-40 shrink-0 items-center">
                  {logo ? (
                    <Image src={logo} alt="" width={160} height={40} unoptimized className="h-10 w-auto brightness-0 invert opacity-80" />
                  ) : (
                    <span aria-hidden="true" className="type-ui text-[17px] text-rc-text [font-stretch:112%]">
                      {partner.name}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="type-section text-rc-ink">{partner.name}</h2>
                  {partner.relationship && <p className="mt-3 max-w-[56ch] text-rc-muted">{partner.relationship}</p>}
                  {partner.website_url && (
                    <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="text-link mt-4">
                      Visit {partner.name}’s website
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
