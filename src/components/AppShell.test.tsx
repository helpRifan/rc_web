import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppShell } from './AppShell';

const NOOP = () => {};

describe('AppShell', () => {
  it('renders children between the TopBar and Footer', () => {
    render(
      <AppShell activeTab="home" onNavigate={NOOP} authUser={null} onLoginClick={NOOP} onLogoutClick={NOOP}>
        <p>page content</p>
      </AppShell>,
    );
    expect(screen.getByText('page content')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Homepage' })).toBeInTheDocument();
  });

  it('opens the mobile drawer when the menu button is clicked', async () => {
    render(
      <AppShell activeTab="home" onNavigate={NOOP} authUser={null} onLoginClick={NOOP} onLogoutClick={NOOP}>
        <p>page content</p>
      </AppShell>,
    );
    expect(screen.queryByLabelText('Close menu')).not.toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Open menu'));
    expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
  });

  it('wires auth props through to the mobile drawer login control', async () => {
    const onLoginClick = vi.fn();
    render(
      <AppShell activeTab="home" onNavigate={NOOP} authUser={null} onLoginClick={onLoginClick} onLogoutClick={NOOP}>
        <p>page content</p>
      </AppShell>,
    );
    await userEvent.click(screen.getByLabelText('Open menu'));
    const drawerNav = screen.getAllByRole('navigation')[1];
    await userEvent.click(within(drawerNav).getByRole('button', { name: /student login/i }));
    expect(onLoginClick).toHaveBeenCalledOnce();
  });

  it('wires auth props through to the mobile drawer logout control when logged in', async () => {
    const onLogoutClick = vi.fn();
    render(
      <AppShell
        activeTab="home"
        onNavigate={NOOP}
        authUser={{ name: 'Karthik' }}
        onLoginClick={NOOP}
        onLogoutClick={onLogoutClick}
      >
        <p>page content</p>
      </AppShell>,
    );
    await userEvent.click(screen.getByLabelText('Open menu'));
    const drawerNav = screen.getAllByRole('navigation')[1];
    await userEvent.click(within(drawerNav).getByRole('button', { name: /sign out/i }));
    expect(onLogoutClick).toHaveBeenCalledOnce();
  });

  it('opens the command palette on Ctrl+K', async () => {
    render(
      <AppShell activeTab="home" onNavigate={NOOP} authUser={null} onLoginClick={NOOP} onLogoutClick={NOOP}>
        <p>page content</p>
      </AppShell>,
    );
    expect(screen.queryByPlaceholderText('Search or jump to...')).not.toBeInTheDocument();
    await userEvent.keyboard('{Control>}k{/Control}');
    expect(screen.getByPlaceholderText('Search or jump to...')).toBeInTheDocument();
  });
});
