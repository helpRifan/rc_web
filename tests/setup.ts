import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Vitest runs without globals, so Testing Library can't register its own auto-cleanup.
afterEach(() => cleanup());

// Browser stubs for jsdom. Files that opt into `@vitest-environment node` have no window.
if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList;
  }

  class IO {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
    root = null;
    rootMargin = '';
    thresholds = [];
  }
  if (!('IntersectionObserver' in window)) {
    (window as unknown as { IntersectionObserver: typeof IO }).IntersectionObserver = IO;
  }

  class RO {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  if (!('ResizeObserver' in window)) {
    (window as unknown as { ResizeObserver: typeof RO }).ResizeObserver = RO;
  }

  // jsdom has no canvas backend: getContext already returns null, but it also logs
  // "Not implemented" on every call. Return null quietly (no WebGL, as in jsdom).
  HTMLCanvasElement.prototype.getContext = (() => null) as HTMLCanvasElement['getContext'];
}
