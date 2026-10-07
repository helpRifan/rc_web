export const SITE = {
  name: 'Robotics Club, VIT Chennai',
  shortName: 'Robotics Club',
  email: 'robotics.club@vit.ac.in',
  instagram: 'https://www.instagram.com/robotics_club_vitc/',
  linkedin: 'https://in.linkedin.com/company/robotics-club-vitc',
  /** VIT's event registration portal (inventory 2.1). Event pages tell visitors what to search for there. */
  eventHub: 'https://eventhubcc.vit.ac.in/EventHub/',
} as const;

/**
 * The faculty coordinator (inventory 2.2; owner's update 2026-10-08). VIT's own profile photo, used
 * with its link (Q13). The profile facts are from his VIT Faculty Directory page; his message is
 * the one the owner sent, word for word (too long for a member bio, so it lives here until the
 * admin can edit it).
 */
export const FACULTY = {
  name: 'Dr. Arockia Selvakumar Arockia Doss',
  role: 'Faculty Coordinator',
  designation: 'Professor, VIT Chennai',
  education: 'PhD in Mechanical Engineering (robotic manipulator design), MIT Campus, Anna University, Chennai',
  specialisations: ['Robotics and automation', 'CAD/CAM/CAE'],
  /** His profile's short bio (the members table caps bios at 300 characters). */
  bio: 'Professor at VIT Chennai. His PhD, at MIT Campus, Anna University, was on robotic manipulator design, and his specialisations are robotics and automation, and CAD/CAM/CAE.',
  figures: [
    { value: '10', label: 'h-index (Scopus)' },
    { value: '21', label: 'i10-index' },
    { value: '1', label: 'patent granted' },
  ],
  photo: 'https://ik.imagekit.io/Rifan/robotics-club/faculty/fc.jpg',
  profileUrl: 'https://directorycc.vit.ac.in/faculty/50444-dr-arockia-selvakumar',
  links: [
    { label: 'VIT profile', href: 'https://directorycc.vit.ac.in/faculty/50444-dr-arockia-selvakumar' },
    { label: 'Google Scholar', href: 'https://scholar.google.com/citations?user=viGND0MAAAAJ&hl=en' },
    { label: 'ORCID', href: 'https://orcid.org/0000-0002-7810-6994' },
    { label: 'Scopus', href: 'https://www.scopus.com/authid/detail.uri?authorId=56962707900' },
  ],
  message:
    'As the faculty coordinator of the Robotics Club, it is my privilege to introduce our dynamic and vibrant community. Our club is a hub of creativity, innovation, and collaborative learning. We provide a platform for students to explore their passion for robotics, expand their technical skills, and cultivate a problem-solving mindset. Through engaging workshops, exciting projects, and competitive events, we aim to inspire and empower our members to excel in the world of robotics. Our club fosters a supportive environment where students can network, share ideas, and work together to push the boundaries of technological advancement. With a dedicated team of mentors and enthusiastic members, we strive to create a transformative experience that prepares students for future challenges and opportunities in the field of robotics.',
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
