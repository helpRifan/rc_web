import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useShouldRenderWebGL } from './useShouldRenderWebGL';

function mockMatchMedia(prefersReducedMotion: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)' ? prefersReducedMotion : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

function mockInnerWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
}

describe('useShouldRenderWebGL', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    // test-only cleanup of a property we may have deleted
    delete window.matchMedia;
  });

  it('returns true on a wide viewport with no reduced-motion preference', () => {
    mockMatchMedia(false);
    mockInnerWidth(1440);
    const { result } = renderHook(() => useShouldRenderWebGL());
    expect(result.current).toBe(true);
  });

  it('returns false when prefers-reduced-motion is set', () => {
    mockMatchMedia(true);
    mockInnerWidth(1440);
    const { result } = renderHook(() => useShouldRenderWebGL());
    expect(result.current).toBe(false);
  });

  it('returns false on a narrow (mobile) viewport', () => {
    mockMatchMedia(false);
    mockInnerWidth(375);
    const { result } = renderHook(() => useShouldRenderWebGL());
    expect(result.current).toBe(false);
  });

  it('returns false when matchMedia is unavailable', () => {
    // simulating an environment without matchMedia
    delete window.matchMedia;
    mockInnerWidth(1440);
    const { result } = renderHook(() => useShouldRenderWebGL());
    expect(result.current).toBe(false);
  });
});
