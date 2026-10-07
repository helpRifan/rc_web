import type { Metadata } from 'next';
import Link from 'next/link';
import { ButtonLink } from '@/components/site/ButtonLink';
import { PageIntro } from '@/components/site/PageIntro';
import { badgeFaceOf } from '@/components/site/team/badge/badge-face';
import { BoardLanyards } from '@/components/site/team/BoardLanyards';
import { BoardUnits } from '@/components/site/team/BoardUnits';
import { CoreTeam } from '@/components/site/team/CoreTeam';
import { FacultySection } from '@/components/site/team/FacultySection';
import { coreItemOf } from '@/components/site/team/team-items';
import { getMembersByLevel } from '@/lib/data/members';
import { safe } from '@/lib/data/safe';
import { getDivisionLines } from '@/lib/data/settings';
import { FACULTY } from '@/lib/site';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Team',
  description: 'The students who run Robotics Club at VIT Chennai, and the faculty member who backs them.',
};

const INTRO = 'The students who run Robotics Club, and the faculty member who backs them.';
const SECTION = 'site-gutter py-20 sm:py-24 lg:py-28';

export default async function TeamPage() {
  const [team, divisionLines] = await Promise.all([
    safe('members', () => getMembersByLevel(), { faculty: [], board: [], core: [], alumni: [] }),
    safe('division lines', () => getDivisionLines(), {}),
  ]);
  const board = team.board.map(badgeFaceOf);
  const core = team.core.map(coreItemOf);
  // His own photo from the roster when it's there, else the one in FACULTY (team brief 6).
  const facultyPhoto = team.faculty.find(member => member.photo_url)?.photo_url ?? FACULTY.photo;
  const intro = <PageIntro id="team-title" title="The team" lead={INTRO} />;

  return (
    <>
      {/* No JavaScript: the live board can't start, so its HTML badges show. */}
      <noscript>
        <style>{'.badge-static-art{visibility:visible!important}'}</style>
      </noscript>

      {board.length > 0 ? (
        <BoardLanyards badges={board} intro={intro}>
          <BoardUnits badges={board} />
        </BoardLanyards>
      ) : (
        <section aria-labelledby="team-title" className="site-gutter pb-12 pt-28">
          {intro}
        </section>
      )}

      {core.length > 0 && (
        <section id="core-team" aria-labelledby="core-heading" className={`${SECTION} scroll-mt-16`}>
          <CoreTeam
            members={core}
            divisionLines={divisionLines}
            header={
              <div>
                <h2 id="core-heading" className="type-section text-rc-ink">
                  Core team
                </h2>
                <p className="mt-3 text-lg text-rc-text">Division heads and leads.</p>
              </div>
            }
          />
        </section>
      )}

      {board.length === 0 && core.length === 0 && (
        <p className="site-gutter pb-16 text-lg text-rc-text">Member profiles appear here once each person sends in their details.</p>
      )}

      <FacultySection photoUrl={facultyPhoto} />

      {team.alumni.length > 0 && (
        <section aria-labelledby="alumni-heading" className={SECTION}>
          <div className="max-w-[80rem]">
            <h2 id="alumni-heading" className="type-section text-rc-ink">
              Alumni
            </h2>
            <ul role="list" className="mt-10 grid gap-x-12 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              {team.alumni.map(member => (
                <li key={member.slug}>
                  <Link href={`/team/${member.slug}`} className="text-lg font-bold text-rc-ink underline decoration-rc-accent decoration-2 underline-offset-[6px] hover:decoration-rc-ink">
                    {member.full_name}
                  </Link>
                  {member.role_title && <p className="mt-1 text-rc-muted">{member.role_title}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section aria-label="Join the club" className="site-gutter pb-24 pt-8 lg:pb-28">
        <div className="flex max-w-[80rem] flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
          <p className="text-lg text-rc-text">Want to join? We take new members through recruitment.</p>
          <ButtonLink href="/join" className="w-full sm:w-auto">
            Join the club
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
