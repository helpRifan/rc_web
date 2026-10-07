import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const nav = vi.hoisted(() => ({ pathname: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => nav.pathname }));

import { SiteHeader } from './SiteHeader';

describe('SiteHeader', () => {
  beforeEach(() => { nav.pathname = '/'; });

  it('marks the current section with aria-current', () => {
    nav.pathname = '/events/robo-sumo';
    render(<SiteHeader />);
    const links = screen.getAllByRole('link', { name: 'Events' });
    expect(links[0]).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByRole('link', { name: 'Team' })[0]).not.toHaveAttribute('aria-current');
  });

  it('opens and closes the mobile menu with the button and Escape, returning focus', async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);
    const button = screen.getByRole('button', { name: 'Open menu' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById('mobile-nav')).toBeInTheDocument();
    // Move focus into the menu first, so focus can only end on the button if Escape returns it.
    document.querySelector<HTMLAnchorElement>('#mobile-nav a')!.focus();
    expect(button).not.toHaveFocus();
    await user.keyboard('{Escape}');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById('mobile-nav')).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });

  it('closes the mobile menu when the route changes', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<SiteHeader />);
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    nav.pathname = '/team';
    rerender(<SiteHeader />);
    expect(document.getElementById('mobile-nav')).not.toBeInTheDocument();
  });

  // The open menu covers the page below the bar, so the page behind it mustn't scroll.
  it('locks page scroll while the mobile menu is open', async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(document.documentElement.style.overflow).toBe('hidden');
    await user.keyboard('{Escape}');
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('closes the mobile menu when the viewport grows to the desktop nav', async () => {
    const listeners: ((event: { matches: boolean }) => void)[] = [];
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      ...original(query),
      addEventListener: (_type: string, listener: (event: { matches: boolean }) => void) => {
        if (query === '(min-width: 48rem)') listeners.push(listener);
      },
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia;
    try {
      const user = userEvent.setup();
      render(<SiteHeader />);
      await user.click(screen.getByRole('button', { name: 'Open menu' }));
      expect(listeners).toHaveLength(1);
      act(() => listeners[0]({ matches: true }));
      expect(document.getElementById('mobile-nav')).not.toBeInTheDocument();
      expect(document.documentElement.style.overflow).toBe('');
    } finally {
      window.matchMedia = original;
    }
  });
});

describe('SiteHeader partners item', () => {
  it('shows Partners after Gallery only when a partner is published', () => {
    const { rerender } = render(<SiteHeader />);
    expect(screen.queryByRole('link', { name: 'Partners' })).toBeNull();
    rerender(<SiteHeader showPartners />);
    const labels = screen.getAllByRole('link').map(link => link.textContent);
    expect(labels.indexOf('Partners')).toBe(labels.indexOf('Gallery') + 1);
  });
});
