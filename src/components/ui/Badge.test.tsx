import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge>Upcoming</Badge>);
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
  });

  it('defaults to the neutral tone', () => {
    render(<Badge>Upcoming</Badge>);
    expect(screen.getByText('Upcoming')).toHaveClass('bg-bg-card');
  });

  it('applies the gold tone for warnings/achievements', () => {
    render(<Badge tone="gold">Winner</Badge>);
    expect(screen.getByText('Winner')).toHaveClass('text-accent-gold');
  });
});
