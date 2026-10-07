import { joinList } from '@/lib/dates';

const FIND = 'Find yours with the email address your team registered with.';

/** The certificate prompt's heading and body (home brief 4). */
export function certificatePromptCopy({ label, titles }: { label: string; titles: string[] }): { heading: string; body: string } {
  const which = titles.length > 5 ? `every ${label} event` : joinList(titles);
  return { heading: `Took part in ${label}?`, body: `Certificates for ${which} are ready. ${FIND}` };
}
