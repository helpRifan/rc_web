import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// next/dynamic loads the field asynchronously, and jsdom has no WebGL, so a real render could never
// show a canvas. Swap in a synchronous marker that records the props HeroField passes, so these
// tests fail if the field mounts when WebGL is missing (Review Focus 1).
const dynamicCalls = vi.hoisted(() => [] as { ssr?: boolean }[]);
vi.mock('next/dynamic', () => ({
  default: (_load: unknown, options: { ssr?: boolean }) => {
    dynamicCalls.push(options);
    return function FieldMarker(props: { stillFrame?: boolean; mouseReact?: boolean; pageLoadAnimation?: boolean }) {
      return (
        <div
          data-testid="field-canvas"
          data-still={String(props.stillFrame)}
          data-mouse={String(props.mouseReact)}
          data-load-animation={String(props.pageLoadAnimation)}
        />
      );
    };
  },
}));

const originalGetContext = HTMLCanvasElement.prototype.getContext;
const originalMatchMedia = window.matchMedia;

function fakeWebGL() {
  HTMLCanvasElement.prototype.getContext = (() => ({ getExtension: () => null })) as unknown as HTMLCanvasElement['getContext'];
}

function preferReducedMotion() {
  window.matchMedia = ((query: string) => ({
    ...originalMatchMedia(query),
    matches: query === '(prefers-reduced-motion: reduce)',
  })) as typeof window.matchMedia;
}

// use-field-mode caches WebGL support at module scope, so each case gets fresh modules.
async function renderField() {
  vi.resetModules();
  const { HeroField } = await import('./HeroField');
  return render(<HeroField />);
}

describe('HeroField', () => {
  beforeEach(() => {
    dynamicCalls.length = 0;
  });
  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    window.matchMedia = originalMatchMedia;
  });

  it('shows only the poster when WebGL is unavailable', async () => {
    const { container } = await renderField();
    expect(screen.getByTestId('field-poster')).toBeInTheDocument();
    expect(screen.queryByTestId('field-canvas')).toBeNull();
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('mounts the live, mouse-reactive field over the poster when WebGL works', async () => {
    fakeWebGL();
    await renderField();
    expect(screen.getByTestId('field-poster')).toBeInTheDocument();
    const field = screen.getByTestId('field-canvas');
    expect(field).toHaveAttribute('data-still', 'false');
    expect(field).toHaveAttribute('data-mouse', 'true');
    expect(field).toHaveAttribute('data-load-animation', 'true');
  });

  it('renders a still frame with no mouse reaction under reduced motion', async () => {
    fakeWebGL();
    preferReducedMotion();
    await renderField();
    const field = screen.getByTestId('field-canvas');
    expect(field).toHaveAttribute('data-still', 'true');
    expect(field).toHaveAttribute('data-mouse', 'false');
    expect(field).toHaveAttribute('data-load-animation', 'false');
  });

  it('loads the WebGL field on the client only', async () => {
    await renderField();
    expect(dynamicCalls).toEqual([expect.objectContaining({ ssr: false })]);
  });
});
