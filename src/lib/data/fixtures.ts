// Real-content fixtures, served when DATA_FIXTURES=1 (local builds, screenshots, e2e) while the
// database can't be read. Every row here is true: event titles from the TechnoVIT '26
// certificates, the club's own photos already on ImageKit (captions are DRAFTS from the gallery
// brief, for owner approval), and the roster's first names and roles (inventory 2.3). Nothing is
// invented to fill gaps; the same rows are seeded into rcweb-dev by supabase/dev/fixtures.sql.
import type { PublicEvent, PublicMember, PublicPartner, PublicPhoto, VerifiedCertificate } from './types';

const IK = 'https://ik.imagekit.io/Rifan/robotics-club';
const CREATED = '2026-10-01T00:00:00Z';

function event(n: number, slug: string, title: string): PublicEvent {
  return {
    id: `00000000-0000-4000-8000-0000000000${String(n).padStart(2, '0')}`,
    slug,
    title,
    summary: null,
    description: null,
    category: null,
    status: 'completed',
    starts_on: null,
    date_label: null,
    series: "TechnoVIT '26",
    cover_url: null,
    registration_url: null,
    recap_url: null,
  };
}

export const FIXTURE_EVENTS: PublicEvent[] = [
  event(1, 'line-follower', 'Line Follower'),
  event(2, 'obstacle-race', 'Obstacle Race'),
  event(3, 'robo-race', 'Robo Race'),
  event(4, 'robo-soccer', 'Robo Soccer'),
  event(5, 'robo-sumo', 'Robo Sumo'),
];

function photo(n: number, file: string, caption: string, width: number, height: number, transform?: string): PublicPhoto {
  return {
    id: `00000000-0000-4000-9000-0000000000${String(n).padStart(2, '0')}`,
    image_url: `${IK}/gallery/${file}${transform ? `?tr=${transform}` : ''}`,
    caption,
    taken_on: null,
    sort_order: n,
    width,
    height,
    created_at: CREATED,
    event: null,
  };
}

// gallery/4.jpg (an unrelated school event) is dropped. gallery/6.jpg has black bars, cut away by
// an ImageKit extract transform until the cropped file is uploaded.
export const FIXTURE_PHOTOS: PublicPhoto[] = [
  photo(1, '10.jpg', 'Club group photo on the steps, with the core team in club polos at the front.', 1600, 1200),
  photo(2, '5.jpg', 'Students soldering at an outdoor workbench.', 1280, 853),
  photo(3, '2.jpg', 'Workshop group photo, each student holding a small robot car.', 1280, 720),
  photo(4, '3.jpg', "ROBOTICA-25, Otomatiks' national inter-school robotics competition, at VIT Chennai in February 2025.", 1600, 1066),
  photo(5, '9.jpg', 'Prize-giving on stage, with trophies.', 1600, 1066),
  photo(6, '7.jpg', 'A build at night: an RC transmitter, a controller board and a small robot arm.', 1200, 1600),
  photo(7, '6.jpg', 'A packed computer-lab session.', 589, 780, 'cm-extract,x-0,y-250,w-589,h-780'),
  photo(8, '8.jpg', 'An electronics trainer kit and a multimeter.', 1600, 1066),
  photo(9, '1.jpg', "Group photo at the RIACT '26 conference in a VIT Chennai auditorium.", 1280, 576),
];

type Seat = [slug: string, fullName: string, role: string, level: PublicMember['level'], division: PublicMember['division']];

const ROSTER: Seat[] = [
  ['ihsan', 'Ihsan', 'Vice-Chair', 'board', 'none'],
  ['grace', 'Grace', 'Secretary', 'board', 'none'],
  ['vinayak', 'Vinayak', 'Co-Secretary', 'board', 'none'],
  ['karthik', 'Karthik', 'Projects Head', 'head', 'projects'],
  ['akshaj', 'Akshaj', 'Projects Lead', 'lead', 'projects'],
  ['tarun', 'Tarun', 'Projects Lead', 'lead', 'projects'],
  ['pranjal', 'Pranjal', 'Technical Head', 'head', 'webdev'],
  ['aurka', 'Aurka', 'Teaching Lead', 'lead', 'teaching'],
  ['basil', 'Basil', 'Design / Creative Head', 'head', 'media'],
  ['leni', 'Leni', 'Design / Creative Lead', 'lead', 'media'],
  ['goutham', 'Goutham', 'Management Head', 'head', 'operations'],
  ['akshita', 'Akshita', 'Management Lead', 'lead', 'operations'],
  ['aditya', 'Aditya', 'Management Lead', 'lead', 'operations'],
  ['gurudeep', 'Gurudeep', 'Outreach Head', 'head', 'marketing'],
  ['madhava', 'Madhava', 'Outreach Lead', 'lead', 'marketing'],
  ['ashton', 'Ashton', 'Publicity Head', 'head', 'marketing'],
  ['daksh', 'Daksh', 'Publicity Lead', 'lead', 'marketing'],
];

function member(slug: string, full_name: string, role_title: string, level: PublicMember['level'], division: PublicMember['division'], sort_order: number): PublicMember {
  return {
    slug,
    full_name,
    role_title,
    level,
    division,
    year_of_study: null,
    degree: null,
    joined_year: null,
    about: null,
    tags: [],
    currently_building: null,
    fun_fact: null,
    photo_url: null,
    github_url: null,
    linkedin_url: null,
    instagram_url: null,
    portfolio_url: null,
    sort_order,
  };
}

export const FIXTURE_MEMBERS: PublicMember[] = [
  {
    ...member('arockia-selvakumar', 'Dr. Arockia Selvakumar', 'Faculty Coordinator', 'faculty', 'none', 0),
    photo_url: `${IK}/faculty/fc.jpg`,
    portfolio_url: 'https://chennai.vit.ac.in/member/dr-arockia-selvakumar/',
  },
  ...ROSTER.map(([slug, name, role, level, division], i) => member(slug, name, role, level, division, (i + 1) * 10)),
];

export const FIXTURE_PARTNERS: PublicPartner[] = [];

/**
 * The one exception to "every row is true": two SYNTHETIC certificates, so the certificate pages
 * can be tried locally (certificates brief, tests). Nobody is called "Test Participant", the IDs
 * spell TEST, and there's no PDF behind them. Never seeded anywhere.
 */
export const FIXTURE_CERTIFICATES: Array<VerifiedCertificate & { contactEmail: string }> = [
  {
    publicId: 'RC26-TEST000001',
    name: 'Test Participant',
    type: 'participation',
    place: null,
    issuedOn: '2026-09-17',
    status: 'issued',
    event: { slug: 'robo-sumo', title: 'Robo Sumo', series: "TechnoVIT '26" },
    contactEmail: 'test.participant@example.com',
  },
  {
    publicId: 'RC26-TEST000002',
    name: 'Test Revoked',
    type: 'winner',
    place: 1,
    issuedOn: '2026-09-18',
    status: 'revoked',
    event: { slug: 'robo-race', title: 'Robo Race', series: "TechnoVIT '26" },
    contactEmail: 'test.participant@example.com',
  },
];

export const FIXTURE_SETTINGS = {
  recruitment: { open: false },
  divisions: {},
} as const;
