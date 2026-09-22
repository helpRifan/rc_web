import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useCommandPaletteHotkeys } from './useCommandPaletteHotkeys';

function TestHost({ onNavigate }: { onNavigate: (tab: any) => void }) {
  const { open } = useCommandPaletteHotkeys(onNavigate);
  return (
    <div>
      <p>palette is {open ? 'open' : 'closed'}</p>
      <input aria-label="some field" />
    </div>
  );
}

describe('useCommandPaletteHotkeys', () => {
  it('toggles open on Ctrl+K', async () => {
    render(<TestHost onNavigate={vi.fn()} />);
    expect(screen.getByText('palette is closed')).toBeInTheDocument();
    await userEvent.keyboard('{Control>}k{/Control}');
    expect(screen.getByText('palette is open')).toBeInTheDocument();
    await userEvent.keyboard('{Control>}k{/Control}');
    expect(screen.getByText('palette is closed')).toBeInTheDocument();
  });

  it('navigates on a g-chord (g then h) without opening the palette', async () => {
    const onNavigate = vi.fn();
    render(<TestHost onNavigate={onNavigate} />);
    await userEvent.keyboard('gh');
    expect(onNavigate).toHaveBeenCalledWith('home');
    expect(screen.getByText('palette is closed')).toBeInTheDocument();
  });

  it('resolves the g-a collision: g then w is achievements, g then x is admin', async () => {
    const onNavigate = vi.fn();
    render(<TestHost onNavigate={onNavigate} />);
    await userEvent.keyboard('gw');
    expect(onNavigate).toHaveBeenLastCalledWith('achievements');
    await userEvent.keyboard('gx');
    expect(onNavigate).toHaveBeenLastCalledWith('admin');
  });

  it('ignores g-chords while typing in an input', async () => {
    const onNavigate = vi.fn();
    render(<TestHost onNavigate={onNavigate} />);
    await userEvent.click(screen.getByLabelText('some field'));
    await userEvent.keyboard('gh');
    expect(onNavigate).not.toHaveBeenCalled();
  });
});
