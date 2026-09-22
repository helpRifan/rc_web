import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MobileDrawer } from './MobileDrawer';

const NOOP = () => {};

describe('MobileDrawer', () => {
  it('renders nothing when closed', () => {
    render(<MobileDrawer open={false} activeTab="home" onNavigate={NOOP} onClose={NOOP} />);
    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument();
  });

  it('renders nav items when open', () => {
    render(<MobileDrawer open activeTab="home" onNavigate={NOOP} onClose={NOOP} />);
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Certificates' })).toBeInTheDocument();
  });

  it('calls onNavigate and onClose when a link is clicked', async () => {
    const onNavigate = vi.fn();
    const onClose = vi.fn();
    render(<MobileDrawer open activeTab="home" onNavigate={onNavigate} onClose={onClose} />);
    await userEvent.click(screen.getByRole('link', { name: 'Members' }));
    expect(onNavigate).toHaveBeenCalledWith('members');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn();
    render(<MobileDrawer open activeTab="home" onNavigate={NOOP} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: /close menu/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
