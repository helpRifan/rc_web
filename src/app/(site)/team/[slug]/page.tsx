import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ScrambleHeading } from '@/components/site/ScrambleHeading';
import { badgeFaceOf } from '@/components/site/team/badge/badge-face';
import { ProfileBadge } from '@/components/site/team/ProfileBadge';
import { getDivisionNeighbours, getMemberBySlug, getPublishedMembers } from '@/lib/data/members';
import { safe } from '@/lib/data/safe';
import { metaLine, profileDescription, profileLinks, profileTags } from '@/lib/members/profile';

export const revalidate = 300;

export async function generateStaticParams() {
  const members = await safe('members (params)', () => getPublishedMembers(), []);
  return members.map(member => ({ slug: member.slug }));
}

export async function generateMetadata({ params }: PageProps<'/team/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const member = await safe('member (metadata)', () => getMemberBySlug(slug), null);
  if (!member) return { title: 'Member not found' };
  return { title: member.full_name, description: profileDescription(member) };
}

function Block({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="type-ui text-[17px] text-rc-ink [font-stretch:112%]">{heading}</h2>
      <div className="mt-3 text-rc-text">{children}</div>
    </section>
  );
}

export default async function MemberPage({ params }: PageProps<'/team/[slug]'>) {
  const { slug } = await params;
  const member = await getMemberBySlug(slug);
  if (!member) notFound();
  const { previous, next } = await safe('member neighbours', () => getDivisionNeighbours(member), { previous: null, next: null });

  const meta = metaLine(member);
  const tags = profileTags(member);
  const links = profileLinks(member);
  // "About" needs its heading only when other sections follow it.
  const others = tags.length > 0 || member.currently_building || member.fun_fact || links.length > 0;

  return (
    <article aria-labelledby="member-name" className="md:grid md:grid-cols-2">
      {/* No JavaScript: the live badge can't start, so its HTML badge shows. */}
      <noscript>
        <style>{'.badge-static-art{visibility:visible!important}'}</style>
      </noscript>
      <div className="md:order-2">
        <ProfileBadge badge={badgeFaceOf(member)} />
      </div>

      <div className="site-gutter pb-20 pt-10 md:order-1 md:pb-28 md:pr-0 md:pt-28">
        <Link href="/team" className="text-link">
          All members
        </Link>
        <ScrambleHeading as="h1" id="member-name" text={member.full_name} className="type-display mt-8 max-w-[14ch] text-balance text-rc-ink" />
        {member.role_title && <p className="mt-5 text-xl text-rc-text">{member.role_title}</p>}
        {meta && <p className="mt-2 text-rc-muted">{meta}</p>}

        <div className="max-w-[34em]">
          {member.about &&
            (others ? (
              <Block heading="About">
                <p className="text-lg">{member.about}</p>
              </Block>
            ) : (
              <p className="mt-10 text-lg text-rc-text">{member.about}</p>
            ))}
          {tags.length > 0 && (
            <Block heading="What I work on">
              <ul role="list" className="space-y-1">
                {tags.map(tag => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </Block>
          )}
          {member.currently_building && (
            <Block heading="Currently building">
              <p>{member.currently_building}</p>
            </Block>
          )}
          {member.fun_fact && (
            <Block heading="Fun fact">
              <p>{member.fun_fact}</p>
            </Block>
          )}
          {links.length > 0 && (
            <Block heading="Find me online">
              <ul role="list" className="flex flex-wrap gap-x-6">
                {links.map(link => (
                  <li key={link.label}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-link">
                      <span className="sr-only">{member.full_name} on </span>
                      {link.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Block>
          )}
        </div>

        {(previous || next) && (
          <nav aria-label="More members" className="mt-16 flex flex-wrap justify-between gap-x-10 gap-y-4">
            {previous ? (
              <Link href={`/team/${previous.slug}`} className="text-link">
                Previous: {previous.full_name}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`/team/${next.slug}`} className="text-link">
                Next: {next.full_name}
              </Link>
            )}
          </nav>
        )}
      </div>
    </article>
  );
}
