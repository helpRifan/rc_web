import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ScrambleHeading } from './ScrambleHeading';

const TEXT = 'We build robots at VIT Chennai.';

afterEach(() => vi.restoreAllMocks());

describe('ScrambleHeading', () => {
  it('exposes the real text as the heading name, with the scramble hidden from assistive tech', () => {
    const { container } = render(<ScrambleHeading as="h1" text={TEXT} />);
    expect(screen.getByRole('heading', { level: 1, name: TEXT })).toBeInTheDocument();
    expect(container.querySelector('[data-scramble]')).not.toBeNull();
    expect(container.querySelector('[data-scramble]')?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('renders plain text and no scramble under reduced motion', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(query => ({
      matches: query.includes('reduce'), media: query, onchange: null,
      addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false,
    }) as MediaQueryList);
    const { container } = render(<ScrambleHeading as="h1" text={TEXT} />);
    expect(screen.getByRole('heading', { level: 1, name: TEXT })).toBeInTheDocument();
    expect(container.querySelector('[data-scramble]')).toBeNull();
  });
});
