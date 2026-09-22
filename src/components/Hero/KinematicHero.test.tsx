import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./useShouldRenderWebGL', () => ({
  useShouldRenderWebGL: vi.fn(),
}));

// Stands in for the real scene: signals readiness on mount, the way the real Canvas's onCreated
// does once its WebGL renderer exists.
vi.mock('./KinematicScene', async () => {
  const { useEffect } = await import('react');
  return {
    default: ({ onReady }: { onReady?: () => void }) => {
      useEffect(() => {
        onReady?.();
      }, [onReady]);
      return <div data-testid="kinematic-scene-stub">3D scene</div>;
    },
  };
});

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

  it('fades the fallback layer out once the 3D scene reports it is ready', async () => {
    vi.mocked(useShouldRenderWebGL).mockReturnValue(true);
    render(<KinematicHero />);
    const fallbackLayer = screen.getByTestId('hero-fallback-layer');
    // Before the scene is ready the fallback is fully shown.
    expect(fallbackLayer).toHaveStyle({ opacity: '1' });
    await waitFor(() => {
      expect(screen.getByTestId('kinematic-scene-stub')).toBeInTheDocument();
    });
    await waitFor(
      () => {
        expect(fallbackLayer).toHaveStyle({ opacity: '0' });
      },
      { timeout: 3000 },
    );
  });
});
