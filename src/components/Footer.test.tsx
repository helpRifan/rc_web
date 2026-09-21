import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders the quick nav links', () => {
    render(<Footer onNavigate={vi.fn()} />);
    expect(screen.getByRole('link', { name: 'Homepage' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Events' })).toBeInTheDocument();
  });

  it('calls onNavigate with the tab id when a quick nav link is clicked', async () => {
    const onNavigate = vi.fn();
    render(<Footer onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole('link', { name: 'Homepage' }));
    expect(onNavigate).toHaveBeenCalledWith('home');
  });

  it('navigates to admin when the admin control button is clicked', async () => {
    const onNavigate = vi.fn();
    render(<Footer onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole('button', { name: /admin/i }));
    expect(onNavigate).toHaveBeenCalledWith('admin');
  });

  it('copies the club email to the clipboard', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn() } });
    render(<Footer onNavigate={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /robotics\.club@vit\.ac\.in/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('robotics.club@vit.ac.in');
  });
});
