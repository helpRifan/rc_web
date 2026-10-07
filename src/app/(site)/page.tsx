import { AboutClub } from '@/components/site/home/AboutClub';
import { CertificatePrompt } from '@/components/site/home/CertificatePrompt';
import { HomeHero } from '@/components/site/home/HomeHero';
import { JoinCallout } from '@/components/site/home/JoinCallout';
import { LatestPhotos } from '@/components/site/home/LatestPhotos';
import { PartnersStrip } from '@/components/site/home/PartnersStrip';
import { UpcomingEvents } from '@/components/site/home/UpcomingEvents';
import { WhatWeDo } from '@/components/site/home/WhatWeDo';
import { getRecentCertificatePrompt } from '@/lib/data/certificates-public';
import { getUpcomingEvents } from '@/lib/data/events';
import { getLatestPhotos } from '@/lib/data/gallery';
import { getPublishedPartners } from '@/lib/data/partners';
import { safe } from '@/lib/data/safe';
import { getRecruitment } from '@/lib/data/settings';

export const revalidate = 300;

/**
 * A summary of the club (owner's brief, 2026-10-07): the title and reel, who we are and the numbers,
 * what we do, then what's true this week (what's next, the certificate prompt after a competition,
 * photos and partners) and how to join. Data sections hide without data; a failed query hides
 * just that section.
 */
export default async function HomePage() {
  const [upcoming, prompt, photos, partners, recruitment] = await Promise.all([
    safe('upcoming events', () => getUpcomingEvents(3), []),
    safe('certificate prompt', () => getRecentCertificatePrompt(), null),
    safe('latest photos', () => getLatestPhotos(15), []),
    safe('partners', () => getPublishedPartners(), []),
    getRecruitment(),
  ]);
  return (
    <>
      <HomeHero />
      <AboutClub />
      <WhatWeDo />
      <UpcomingEvents events={upcoming} />
      <CertificatePrompt prompt={prompt} />
      <LatestPhotos photos={photos} />
      <PartnersStrip partners={partners} />
      <JoinCallout open={recruitment.open} />
    </>
  );
}
