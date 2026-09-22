import { render, screen } from '@testing-library/react';
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
});
