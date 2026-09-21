import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TopBar } from './TopBar';

const NOOP = () => {};

describe('TopBar', () => {
  it('renders all seven nav items', () => {
    render(
      <TopBar
        activeTab="home"
        onNavigate={NOOP}
        authUser={null}
        onLoginClick={NOOP}
        onLogoutClick={NOOP}
        onMenuToggle={NOOP}
      />,
    );
    for (const label of ['Home', 'About', 'Achievements', 'Departments', 'Members', 'Activities', 'Certificates']) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
  });

  it('marks the active tab with aria-current', () => {
    render(
      <TopBar
        activeTab="members"
        onNavigate={NOOP}
        authUser={null}
        onLoginClick={NOOP}
        onLogoutClick={NOOP}
        onMenuToggle={NOOP}
      />,
    );
    expect(screen.getByRole('link', { name: 'Members' })).toHaveAttribute('aria-current', 'page');
  });

  it('calls onNavigate with the tab id when a nav item is clicked', async () => {
    const onNavigate = vi.fn();
    render(
      <TopBar
        activeTab="home"
        onNavigate={onNavigate}
        authUser={null}
        onLoginClick={NOOP}
        onLogoutClick={NOOP}
        onMenuToggle={NOOP}
      />,
    );
    await userEvent.click(screen.getByRole('link', { name: 'About' }));
    expect(onNavigate).toHaveBeenCalledWith('about');
  });

  it('shows a login button when logged out and calls onLoginClick', async () => {
    const onLoginClick = vi.fn();
    render(
      <TopBar
        activeTab="home"
        onNavigate={NOOP}
        authUser={null}
        onLoginClick={onLoginClick}
        onLogoutClick={NOOP}
        onMenuToggle={NOOP}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /student login/i }));
    expect(onLoginClick).toHaveBeenCalledOnce();
  });

  it('shows the student name when logged in', () => {
    render(
      <TopBar
        activeTab="home"
        onNavigate={NOOP}
        authUser={{ name: 'Karthik' }}
        onLoginClick={NOOP}
        onLogoutClick={NOOP}
        onMenuToggle={NOOP}
      />,
    );
    expect(screen.getByText('Karthik')).toBeInTheDocument();
  });

  it('calls onMenuToggle when the mobile menu button is clicked', async () => {
    const onMenuToggle = vi.fn();
    render(
      <TopBar
        activeTab="home"
        onNavigate={NOOP}
        authUser={null}
        onLoginClick={NOOP}
        onLogoutClick={NOOP}
        onMenuToggle={onMenuToggle}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /open menu/i }));
    expect(onMenuToggle).toHaveBeenCalledOnce();
  });
});
