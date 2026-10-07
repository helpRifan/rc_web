import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const lanyard = vi.hoisted(() => ({ rendered: 0 }));
vi.mock('next/dynamic', () => ({
  default: () =>
    function DynamicStub() {
      lanyard.rendered++;
      return null;
    },
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }) }));

import type { PublicMember } from '@/lib/data/types';
import { BadgeStatic } from './badge/BadgeStatic';
import { badgeFaceOf } from './badge/badge-face';
import { BoardLanyards, resolveBoardMode } from './BoardLanyards';
import { BoardUnits } from './BoardUnits';
import { resolveCoreView, SPHERE_MIN } from './CoreTeam';
import { sphereKeyTarget } from './CoreSphere';
import { coreItemOf } from './team-items';
import { filterStatus, groupByDivision, rankInDivision, TeamList } from './TeamList';

function member(slug: string, full_name: string, role_title: string, level: PublicMember['level'], division: PublicMember['division']): PublicMember {
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
    sort_order: 0,
  };
}

// Synthetic people only.
const BOARD = [member('ana', 'Ana', 'Chair', 'board', 'none'), member('ben', 'Ben', 'Secretary', 'board', 'none')].map(badgeFaceOf);
const CORE = [
  member('cara', 'Cara', 'Projects Head', 'head', 'projects'),
  member('dev', 'Dev', 'Projects Lead', 'lead', 'projects'),
  member('eli', 'Eli', 'Teaching Lead', 'lead', 'teaching'),
  member('fay', 'Fay', 'Publicity Head', 'head', 'marketing'),
].map(coreItemOf);

describe('resolveBoardMode', () => {
  const base = { hydrated: true, wide: true, webgl: true, gaveUp: false, ready: false };
  it.each([
    [{ ...base, hydrated: false }, 'pending'],
    [{ ...base, wide: false }, 'static-rail'],
    [{ ...base, webgl: false }, 'static-row'],
    [{ ...base, gaveUp: true }, 'static-row'],
    [base, 'pending'],
    [{ ...base, ready: true }, 'live'],
  ] as const)('%o is %s', (state, mode) => {
    expect(resolveBoardMode(state)).toBe(mode);
  });
});

describe('BoardLanyards', () => {
  it('renders the HTML badges as profile links, and no WebGL board in jsdom', () => {
    lanyard.rendered = 0;
    render(
      <BoardLanyards badges={BOARD} intro={<h1 id="team-title">The team</h1>}>
        <BoardUnits badges={BOARD} />
      </BoardLanyards>,
    );
    const list = screen.getByRole('list', { name: 'The board' });
    const links = within(list).getAllByRole('link');
    expect(links.map(link => link.getAttribute('href'))).toEqual(['/team/ana', '/team/ben']);
    expect(links[0]).toHaveTextContent('AnaChair');
    expect(document.querySelector('canvas')).toBeNull();
    expect(lanyard.rendered).toBe(0);
    expect(document.querySelector('[data-board-stage]')).toHaveAttribute('data-mode', 'static-rail');
  });
});

describe('BadgeStatic', () => {
  it('prints the initials on the glyph print when there is no photo', () => {
    const { container } = render(<BadgeStatic badge={BOARD[0]} />);
    expect(container.querySelector('svg text')).toHaveTextContent('A');
    expect(container.querySelector('svg path')).toBeInTheDocument();
    expect(container).toHaveTextContent('Board');
  });
});

describe('TeamList', () => {
  const names = () => screen.getAllByRole('heading', { level: 4 }).map(h => h.textContent);
  const divisions = () => screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent);

  it('groups the team by division, in the site order, and filters to one', async () => {
    const user = userEvent.setup();
    render(<TeamList members={CORE} divisionLines={{ projects: 'We build the robots.' }} initialDivision={null} />);
    expect(divisions()).toEqual(['Projects', 'Teaching', 'Marketing & Sponsorship']);
    expect(names()).toEqual(['Cara', 'Dev', 'Eli', 'Fay']);
    expect(screen.getByRole('region', { name: 'Projects' })).toHaveTextContent('2 people');
    await user.click(screen.getByRole('button', { name: 'Projects' }));
    expect(divisions()).toEqual(['Projects']);
    expect(names()).toEqual(['Cara', 'Dev']);
    expect(screen.getByText('Showing 2 people in Projects.')).toBeInTheDocument();
    expect(screen.getByText('We build the robots.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'All' }));
    expect(screen.getByText('Showing all 4 people.')).toBeInTheDocument();
  });

  it('offers only divisions with people in them, with the division ids as chip ids', () => {
    render(<TeamList members={CORE} divisionLines={{}} initialDivision={null} />);
    const chips = within(screen.getByRole('group', { name: 'Filter by division' })).getAllByRole('button');
    expect(chips.map(chip => chip.textContent)).toEqual(['All', 'Projects', 'Teaching', 'Marketing & Sponsorship']);
    expect(chips.slice(1).map(chip => chip.id)).toEqual(['projects', 'teaching', 'marketing']);
  });

  it('starts on the division from the hash', () => {
    render(<TeamList members={CORE} divisionLines={{}} initialDivision="teaching" />);
    expect(screen.getByRole('button', { name: 'Teaching' })).toHaveAttribute('aria-pressed', 'true');
    expect(names()).toEqual(['Eli']);
  });

  it('links every card to its profile, in colour (no grayscale layers)', () => {
    const { container } = render(<TeamList members={CORE} divisionLines={{}} initialDivision={null} />);
    expect(screen.getByRole('link', { name: /^Cara/ })).toHaveAttribute('href', '/team/cara');
    expect([...container.querySelectorAll<HTMLElement>('*')].some(el => el.style.backdropFilter)).toBe(false);
  });
});

describe('groupByDivision', () => {
  it('puts heads before leads within a division, then keeps the roster order', () => {
    const items = [
      member('gil', 'Gil', 'Projects Lead', 'lead', 'projects'),
      member('hal', 'Hal', 'Member', 'lead', 'projects'),
      member('ivy', 'Ivy', 'Projects Head', 'head', 'projects'),
      member('jo', 'Jo', 'Projects Lead', 'lead', 'projects'),
    ].map(coreItemOf);
    expect(groupByDivision(items)[0].members.map(m => m.name)).toEqual(['Ivy', 'Gil', 'Jo', 'Hal']);
    expect([rankInDivision('Technical Head'), rankInDivision('Design / Creative Lead'), rankInDivision(null)]).toEqual([0, 1, 2]);
  });
});

describe('filterStatus', () => {
  it('says person for one', () => {
    expect(filterStatus(1, 'Web Dev')).toBe('Showing 1 person in Web Dev.');
    expect(filterStatus(14, null)).toBe('Showing all 14 people.');
  });
});

describe('resolveCoreView', () => {
  const base = { hydrated: true, wide: true, reducedMotion: false, webgl2: true, count: 14, chosen: null };
  it.each([
    ['under 768px', { ...base, wide: false }, { toggle: false, view: 'list' }],
    ['reduced motion', { ...base, reducedMotion: true }, { toggle: false, view: 'list' }],
    ['no WebGL2', { ...base, webgl2: false }, { toggle: false, view: 'list' }],
    ['too few people', { ...base, count: SPHERE_MIN - 1 }, { toggle: false, view: 'list' }],
    ['capable screen, the list by default', base, { toggle: true, view: 'list' }],
    ['the sphere, chosen', { ...base, chosen: 'sphere' as const }, { toggle: true, view: 'sphere' }],
    ['before hydration', { ...base, hydrated: false }, { toggle: false, view: 'list' }],
  ])('%s', (_, state, expected) => {
    expect(resolveCoreView(state)).toEqual(expected);
  });
});

describe('sphereKeyTarget', () => {
  it('moves through the list order and wraps', () => {
    expect(sphereKeyTarget('ArrowRight', 3, 4)).toBe(0);
    expect(sphereKeyTarget('ArrowDown', 0, 4)).toBe(1);
    expect(sphereKeyTarget('ArrowLeft', 0, 4)).toBe(3);
    expect(sphereKeyTarget('ArrowUp', 2, 4)).toBe(1);
    expect(sphereKeyTarget('Home', 2, 4)).toBe(0);
    expect(sphereKeyTarget('End', 0, 4)).toBe(3);
    expect(sphereKeyTarget('a', 0, 4)).toBeNull();
  });
});

describe('CoreSphere roster', () => {
  it('keeps every core member in a hidden list for screen readers', async () => {
    const { CoreSphere } = await import('./CoreSphere');
    await act(async () => {
      render(<CoreSphere members={CORE} onFail={() => {}} />);
    });
    for (const item of CORE) expect(screen.getAllByText(new RegExp(`^${item.name},`)).length).toBeGreaterThan(0);
  });
});
