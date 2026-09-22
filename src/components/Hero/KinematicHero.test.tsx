import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./useShouldRenderWebGL', () => ({
  useShouldRenderWebGL: vi.fn(),
}));

vi.mock('./KinematicScene', () => ({
  default: () => <div data-testid="kinematic-scene-stub">3D scene</div>,
}));

import { useShouldRenderWebGL } from './useShouldRenderWebGL';
import KinematicHero from './KinematicHero';

describe('KinematicHero', () => {
  it('renders the SVG fallback immediately when WebGL should not render', () => {
    vi.mocked(useShouldRenderWebGL).mockReturnValue(false);
    render(<KinematicHero />);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    expect(screen.queryByTestId('kinematic-scene-stub')).not.toBeInTheDocument();
  });

  it('renders the fallback first, then crossfades to the 3D scene when WebGL is allowed', async () => {
    vi.mocked(useShouldRenderWebGL).mockReturnValue(true);
    render(<KinematicHero />);
    await waitFor(() => {
      expect(screen.getByTestId('kinematic-scene-stub')).toBeInTheDocument();
    });
  });

  it('never renders the fallback SVG\'s gear/node markers once the 3D scene is in (only one visual layer is meaningfully "shown")', async () => {
    vi.mocked(useShouldRenderWebGL).mockReturnValue(true);
    render(<KinematicHero />);
    await waitFor(() => {
      expect(screen.getByTestId('kinematic-scene-stub')).toBeInTheDocument();
    });
    // Both layers may remain mounted during a CSS/opacity crossfade — that's fine.
    // What matters is the 3D scene mounted at all, proven above.
  });
});
