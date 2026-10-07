import { render, screen, within } from '@testing-library/react';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PhotoGrid } from '@/components/site/PhotoGrid';
import { FIXTURE_EVENTS, FIXTURE_PHOTOS } from '@/lib/data/fixtures';
import type { PublicPartner } from '@/lib/data/types';
import { AboutClub, STATS } from './AboutClub';
import { CertificatePrompt } from './CertificatePrompt';
import { certificatePromptCopy } from './copy';
import { JOIN_CALLOUT, JoinCallout } from './JoinCallout';
import { LatestPhotos } from './LatestPhotos';
import { WALL_HINT } from './PhotoWall';
import { PartnersStrip } from './PartnersStrip';
import { UpcomingEvents } from './UpcomingEvents';
import { ACTIVITIES, WhatWeDo } from './WhatWeDo';

const upcoming = { ...FIXTURE_EVENTS[0], status: 'registration_open' as const, starts_on: '2027-03-14' };
const partner = (name: string, logo_url: string | null): PublicPartner => ({
  id: `00000000-0000-4000-a000-${name.length.toString().padStart(12, '0')}`,
  name,
  website_url: null,
  logo_url,
  relationship: null,
  sort_order: 0,
});

describe('home sections without data', () => {
  it('render nothing', () => {
    const { container } = render(
      <>
        <UpcomingEvents events={[]} />
        <CertificatePrompt prompt={null} />
        <LatestPhotos photos={[]} />
        <PartnersStrip partners={[]} />
      </>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe('UpcomingEvents', () => {
  it('links each row to its event and the section to /events', () => {
    render(<UpcomingEvents events={[upcoming]} />);
    const section = screen.getByRole('region', { name: 'Coming up' });
    expect(within(section).getByRole('link', { name: upcoming.title })).toHaveAttribute('href', `/events/${upcoming.slug}`);
    expect(within(section).getAllByRole('link', { name: 'See all events' })[0]).toHaveAttribute('href', '/events');
  });
});

describe('CertificatePrompt', () => {
  it('names the events, joined plainly', () => {
    expect(certificatePromptCopy({ label: 'Robo Sumo', titles: ['Robo Sumo'] }).body).toBe(
      'Certificates for Robo Sumo are ready. Find yours with the email address your team registered with.',
    );
    expect(certificatePromptCopy({ label: "TechnoVIT '26", titles: ['A', 'B', 'C', 'D'] })).toEqual({
      heading: "Took part in TechnoVIT '26?",
      body: 'Certificates for A, B, C and D are ready. Find yours with the email address your team registered with.',
    });
    expect(certificatePromptCopy({ label: "TechnoVIT '26", titles: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] }).body).toBe(
      "Certificates for every TechnoVIT '26 event are ready. Find yours with the email address your team registered with.",
    );
  });

  it('sends people to the certificate finder', () => {
    render(<CertificatePrompt prompt={{ label: "TechnoVIT '26", titles: ['Robo Race'] }} />);
    expect(screen.getByRole('heading', { level: 2, name: "Took part in TechnoVIT '26?" })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Find your certificate' })).toHaveAttribute('href', '/certificates');
  });
});

describe('AboutClub', () => {
  it('states each figure as text beside its label', () => {
    render(<AboutClub />);
    const section = screen.getByRole('region', { name: 'About the club' });
    for (const stat of STATS) {
      const label = within(section).getByText(stat.label);
      expect(label.parentElement).toHaveTextContent(stat.value);
    }
    expect(within(section).getByRole('heading', { level: 3, name: 'About VIT Chennai' })).toBeInTheDocument();
  });
});

describe('WhatWeDo', () => {
  it('lists what the club does, each row one link with its description', () => {
    render(<WhatWeDo />);
    const links = within(screen.getByRole('region', { name: 'What we do' })).getAllByRole('link');
    expect(links.map(link => link.getAttribute('href'))).toEqual(ACTIVITIES.map(item => item.href));
    expect(links[0]).toHaveTextContent(`Workshops${ACTIVITIES[0].description}`);
  });

  it('only uses photos that ship with the site', () => {
    for (const item of ACTIVITIES) {
      for (const image of item.images) expect(existsSync(join(process.cwd(), 'public', image.src)), image.src).toBe(true);
    }
  });
});

describe('LatestPhotos', () => {
  it('gives each photo on the wall one button, every gallery photo among them', () => {
    render(<LatestPhotos photos={FIXTURE_PHOTOS} />);
    const section = screen.getByRole('region', { name: 'Latest photos' });
    const buttons = within(section).getAllByRole('button', { name: /^Open photo/ });
    expect(new Set(buttons.map(b => b.getAttribute('data-index'))).size).toBe(buttons.length);
    for (const photo of FIXTURE_PHOTOS) expect(within(section).getByRole('button', { name: `Open photo: ${photo.caption}` })).toBeInTheDocument();
    expect(within(section).getByText(WALL_HINT)).toBeInTheDocument();
    expect(within(section).getAllByRole('link', { name: 'See the gallery' })[0]).toHaveAttribute('href', '/gallery');
  });
});

describe('JoinCallout', () => {
  it('words the call by whether recruitment is open, and always links to Join', () => {
    const { rerender } = render(<JoinCallout open={false} />);
    expect(screen.getByRole('heading', { level: 2, name: JOIN_CALLOUT.closed.heading })).toBeInTheDocument();
    rerender(<JoinCallout open />);
    expect(screen.getByRole('heading', { level: 2, name: JOIN_CALLOUT.open.heading })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Join the club' })).toHaveAttribute('href', '/join');
  });
});

describe('PhotoGrid', () => {
  it('falls back from the caption to the event to a plain label', () => {
    const [withCaption] = FIXTURE_PHOTOS;
    const fromEvent = { ...withCaption, id: 'b', caption: null, event: { slug: 'robo-sumo', title: 'Robo Sumo' } };
    const plain = { ...withCaption, id: 'c', caption: null, event: null };
    render(<PhotoGrid photos={[withCaption, fromEvent, plain]} variant="even" />);
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAccessibleName(`Open photo: ${withCaption.caption}`);
    expect(links[1]).toHaveAccessibleName('Open photo from Robo Sumo');
    expect(links[2]).toHaveAccessibleName('Open photo');
    expect(screen.getByAltText('Photo from Robo Sumo')).toBeInTheDocument();
    expect(links[0]).toHaveAttribute('href', `/gallery?photo=${withCaption.id}`);
  });
});

describe('PartnersStrip', () => {
  it('shows transparent logos as images and anything else as the name', () => {
    render(<PartnersStrip partners={[partner('Alpha Labs', 'https://ik.imagekit.io/x/alpha.svg'), partner('Beta', 'https://ik.imagekit.io/x/beta.jpg')]} />);
    expect(screen.getByAltText('Alpha Labs')).toBeInTheDocument();
    expect(screen.queryByAltText('Beta')).toBeNull();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'See our partners' })[0]).toHaveAttribute('href', '/partners');
  });
});
