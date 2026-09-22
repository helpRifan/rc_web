import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MobileDrawer } from './MobileDrawer';

const NOOP = () => {};

describe('MobileDrawer', () => {
  it('renders nothing when closed', () => {
    render(<MobileDrawer open={false} activeTab="home" onNavigate={NOOP} onClose={NOOP} authUser={null} onLoginClick={NOOP} onLogoutClick={NOOP} />);
    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument();
  });

  it('renders nav items when open', () => {
    render(<MobileDrawer open activeTab="home" onNavigate={NOOP} onClose={NOOP} authUser={null} onLoginClick={NOOP} onLogoutClick={NOOP} />);
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Certificates' })).toBeInTheDocument();
  });

  it('calls onNavigate and onClose when a link is clicked', async () => {
    const onNavigate = vi.fn();
    const onClose = vi.fn();
    render(<MobileDrawer open activeTab="home" onNavigate={onNavigate} onClose={onClose} authUser={null} onLoginClick={NOOP} onLogoutClick={NOOP} />);
    await userEvent.click(screen.getByRole('link', { name: 'Members' }));
    expect(onNavigate).toHaveBeenCalledWith('members');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn();
    render(<MobileDrawer open activeTab="home" onNavigate={NOOP} onClose={onClose} authUser={null} onLoginClick={NOOP} onLogoutClick={NOOP} />);
    await userEvent.click(screen.getByRole('button', { name: /close menu/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn();
    render(<MobileDrawer open activeTab="home" onNavigate={NOOP} onClose={onClose} authUser={null} onLoginClick={NOOP} onLogoutClick={NOOP} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows a login control when logged out and calls onLoginClick then onClose', async () => {
    const onLoginClick = vi.fn();
    const onClose = vi.fn();
    render(<MobileDrawer open activeTab="home" onNavigate={NOOP} onClose={onClose} authUser={null} onLoginClick={onLoginClick} onLogoutClick={NOOP} />);
    await userEvent.click(screen.getByRole('button', { name: /student login/i }));
    expect(onLoginClick).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows the user name and a logout control when logged in, calling onLogoutClick then onClose', async () => {
    const onLogoutClick = vi.fn();
    const onClose = vi.fn();
    render(
      <MobileDrawer
        open
        activeTab="home"
        onNavigate={NOOP}
        onClose={onClose}
        authUser={{ name: 'Karthik' }}
        onLoginClick={NOOP}
        onLogoutClick={onLogoutClick}
      />,
    );
    expect(screen.getByText('Karthik')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /sign out/i }));
    expect(onLogoutClick).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
