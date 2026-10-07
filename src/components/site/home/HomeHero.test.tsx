import { render, screen } from '@testing-library/react';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { HERO, HomeHero, REEL } from './HomeHero';

it('names the page Robotics Club and keeps the copy and actions', () => {
  render(<HomeHero />);
  expect(screen.getByRole('heading', { level: 1, name: 'Robotics Club' })).toBeInTheDocument();
  expect(screen.getByText(HERO.body)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'See upcoming events' })).toHaveAttribute('href', '/events');
  expect(screen.getByRole('link', { name: 'Join the club' })).toHaveAttribute('href', '/join');
});

it('shows the title as text until the canvas has drawn it', () => {
  render(<HomeHero />);
  const title = screen.getByRole('heading', { level: 1 });
  expect(title).not.toHaveAttribute('data-ready');
  expect(title).toHaveTextContent('ROBOTICS CLUB');
});

it('ships both reels and their posters', () => {
  for (const reel of Object.values(REEL)) {
    for (const file of [reel.src, reel.av1, reel.poster]) expect(existsSync(join(process.cwd(), 'public', file)), file).toBe(true);
  }
});
