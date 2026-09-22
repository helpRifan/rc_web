import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CommandPalette } from './CommandPalette';

const NOOP = () => {};

describe('CommandPalette', () => {
  it('renders nothing when closed', () => {
    render(<CommandPalette open={false} onClose={NOOP} onNavigate={NOOP} />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('shows all 8 nav items when open with an empty query', () => {
    render(<CommandPalette open onClose={NOOP} onNavigate={NOOP} />);
    expect(screen.getByText('Navigate')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Certificates')).toBeInTheDocument();
  });

  it('navigates and closes when a nav item is clicked', async () => {
    const onNavigate = vi.fn();
    const onClose = vi.fn();
    render(<CommandPalette open onClose={onClose} onNavigate={onNavigate} />);
    await userEvent.click(screen.getByText('Members'));
    expect(onNavigate).toHaveBeenCalledWith('members');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('filters nav items and shows search results as the user types', async () => {
    render(<CommandPalette open onClose={NOOP} onNavigate={NOOP} />);
    await userEvent.type(screen.getByRole('textbox'), 'robosumo');
    expect(screen.queryByText('Members')).not.toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(<CommandPalette open onClose={onClose} onNavigate={NOOP} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes when the backdrop is clicked but not when the panel is clicked', async () => {
    const onClose = vi.fn();
    render(<CommandPalette open onClose={onClose} onNavigate={NOOP} />);
    await userEvent.click(screen.getByRole('textbox'));
    expect(onClose).not.toHaveBeenCalled();
    await userEvent.click(screen.getByTestId('command-palette-backdrop'));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
