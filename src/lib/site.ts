export const SITE = {
  name: 'Robotics Club, VIT Chennai',
  shortName: 'Robotics Club',
  email: 'robotics.club@vit.ac.in',
  instagram: 'https://www.instagram.com/robotics_club_vitc/',
  linkedin: 'https://in.linkedin.com/company/robotics-club-vitc',
  /** VIT's event registration portal (inventory 2.1). Event pages tell visitors what to search for there. */
  eventHub: 'https://eventhubcc.vit.ac.in/EventHub/',
} as const;

/** The faculty coordinator (inventory 2.2). VIT's own profile photo, used with its link (Q13). */
export const FACULTY = {
  name: 'Dr. Arockia Selvakumar',
  role: 'Faculty Coordinator',
  photo: 'https://ik.imagekit.io/Rifan/robotics-club/faculty/fc.jpg',
  profileUrl: 'https://chennai.vit.ac.in/member/dr-arockia-selvakumar/',
} as const;

/** Shown in the header after Gallery only while at least one partner is published (spec 6.7). */
export const PARTNERS_NAV_ITEM = { href: '/partners', label: 'Partners' } as const;

export function navItems(showPartners: boolean): ReadonlyArray<{ href: string; label: string }> {
  if (!showPartners) return NAV;
  const at = NAV.findIndex(item => item.href === '/gallery') + 1;
  return [...NAV.slice(0, at), PARTNERS_NAV_ITEM, ...NAV.slice(at)];
}

export const NAV = [
  { href: '/', label: 'Home' },
  { href: '/team', label: 'Team' },
  { href: '/events', label: 'Events' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/certificates', label: 'Certificates' },
  { href: '/join', label: 'Join' },
] as const;

export function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
