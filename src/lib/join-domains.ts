// Email domains the Join form accepts (JOIN_EMAIL_DOMAINS, comma-separated). Not a secret: the
// server page passes the list to the client form so both validate the same way.
const DOMAIN = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;

export function joinDomains(raw: string | undefined = process.env.JOIN_EMAIL_DOMAINS): string[] {
  const domains = (raw ?? '')
    .split(',')
    .map(d => d.trim().toLowerCase().replace(/^@/, ''))
    .filter(d => DOMAIN.test(d));
  return domains.length ? domains : ['vitstudent.ac.in'];
}

/** "@vitstudent.ac.in", or "@vitstudent.ac.in or @vit.ac.in". */
export function domainList(domains: readonly string[]): string {
  return new Intl.ListFormat('en-GB', { type: 'disjunction' }).format(domains.map(d => `@${d}`));
}
