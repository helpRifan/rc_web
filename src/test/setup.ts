import '@testing-library/jest-dom/vitest';

// jsdom does not implement IntersectionObserver. Several components (e.g. HomeView's
// scroll-triggered stats counter, and framer-motion's `whileInView`/viewport feature)
// use it in effects; without a stub, mounting them throws a ReferenceError that Vitest
// surfaces as an unhandled error and fails otherwise-passing tests.
class IntersectionObserverStub implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver;
}
