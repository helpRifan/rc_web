import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HeroFallback } from './HeroFallback';

describe('HeroFallback', () => {
  it('renders an svg with the expected accessible role', () => {
    render(<HeroFallback />);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('renders at least 3 gear shapes', () => {
    const { container } = render(<HeroFallback />);
    const gears = container.querySelectorAll('[data-hero-gear]');
    expect(gears.length).toBeGreaterThanOrEqual(3);
  });

  it('renders pulsing node dots', () => {
    const { container } = render(<HeroFallback />);
    const nodes = container.querySelectorAll('[data-hero-node]');
    expect(nodes.length).toBeGreaterThan(0);
  });
});
