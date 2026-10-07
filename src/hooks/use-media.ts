'use client';

import { useSyncExternalStore } from 'react';

/** Whether a media query matches; false on the server and in the first client render. */
export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    onChange => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

const noop = () => () => {};

/** False on the server and during hydration, true after. */
export function useHydrated(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}

/** The URL's hash without the #, kept current; empty on the server. */
export function useHash(): string {
  return useSyncExternalStore(
    onChange => {
      window.addEventListener('hashchange', onChange);
      return () => window.removeEventListener('hashchange', onChange);
    },
    () => window.location.hash.replace(/^#/, ''),
    () => '',
  );
}

let webgl2Support: boolean | undefined;
/** Whether WebGL2 is available (checked once); false on the server. */
export function useWebGL2(): boolean {
  return useSyncExternalStore(
    noop,
    () => {
      if (webgl2Support === undefined) {
        try {
          const gl = document.createElement('canvas').getContext('webgl2');
          webgl2Support = Boolean(gl);
          gl?.getExtension('WEBGL_lose_context')?.loseContext();
        } catch {
          webgl2Support = false;
        }
      }
      return webgl2Support;
    },
    () => false,
  );
}
