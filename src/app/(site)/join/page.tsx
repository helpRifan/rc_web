import type { Metadata } from 'next';
import { JoinView } from '@/components/site/join/JoinView';
import { getRecruitment } from '@/lib/data/settings';
import { joinDomains } from '@/lib/join-domains';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { open } = await getRecruitment();
  return {
    title: 'Join',
    description: open
      ? 'Join Robotics Club at VIT Chennai. Add your name to the list and we’ll email you when intake opens.'
      : 'Recruitment is closed right now. Leave your email and we’ll tell you when it opens.',
  };
}

export default async function JoinPage() {
  // A missing or broken setting means closed (spec Q10); getRecruitment never throws.
  const { open } = await getRecruitment();
  return (
    <>
      <link rel="preload" as="image" href="/join/fluid-1440.webp" media="(min-width: 768px)" fetchPriority="high" />
      <link rel="preload" as="image" href="/join/fluid-390.webp" media="(max-width: 767px)" fetchPriority="high" />
      <JoinView open={open} domains={joinDomains()} />
    </>
  );
}
