import Image from 'next/image';
import { SectionHeader, SectionLinkMobile } from '@/components/site/SectionHeader';
import type { PublicPartner } from '@/lib/data/types';
import { usableLogo } from '@/lib/partners';

const LINK = { href: '/partners', label: 'See our partners' };

/** Real, published partners as white silhouettes (or their names). Not links: /partners has the websites. */
export function PartnersStrip({ partners }: { partners: PublicPartner[] }) {
  if (!partners.length) return null;
  return (
    <section aria-labelledby="home-partners" className="site-gutter py-20 sm:py-24 lg:py-28">
      <div className="max-w-[80rem]">
        <SectionHeader id="home-partners" title="Partners" link={LINK} />
        <ul role="list" className="mt-10 flex flex-wrap items-center gap-x-14 gap-y-8 lg:mt-12">
          {partners.map(partner => {
            const logo = usableLogo(partner);
            return (
              <li key={partner.id}>
                {logo ? (
                  <Image src={logo} alt={partner.name} width={160} height={32} unoptimized className="h-8 w-auto opacity-80 brightness-0 invert" />
                ) : (
                  <span className="type-ui text-[17px] text-rc-text [font-stretch:112%]">{partner.name}</span>
                )}
              </li>
            );
          })}
        </ul>
        <SectionLinkMobile {...LINK} />
      </div>
    </section>
  );
}
