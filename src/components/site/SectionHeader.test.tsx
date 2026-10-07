import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageIntro } from './PageIntro';
import { SectionHeader, SectionLinkMobile } from './SectionHeader';

describe('SectionHeader', () => {
  it('renders the h2 with its id, and the optional link', () => {
    render(<SectionHeader id="coming-up-title" title="Coming up" link={{ href: '/events', label: 'See all events' }} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Coming up' })).toHaveAttribute('id', 'coming-up-title');
    expect(screen.getByRole('link', { name: 'See all events' })).toHaveAttribute('href', '/events');
  });

  it('renders no link when none is given', () => {
    render(<SectionHeader id="x" title="Past events" />);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('has a mobile copy of the link', () => {
    render(<SectionLinkMobile href="/gallery" label="See the gallery" />);
    expect(screen.getByRole('link', { name: 'See the gallery' })).toHaveAttribute('href', '/gallery');
  });
});

describe('PageIntro', () => {
  it('renders the page h1 and the lead', () => {
    render(<PageIntro title="Events" lead="Competitions and workshops run by Robotics Club at VIT Chennai." />);
    expect(screen.getByRole('heading', { level: 1, name: 'Events' })).toBeInTheDocument();
    expect(screen.getByText(/Competitions and workshops/)).toBeInTheDocument();
  });
});
