'use client';

import { useEffect, useState } from 'react';

/** True once the browser has been idle after first paint, so heavy WebGL loads after the page does. */
export function useAfterIdle(timeout = 1200): boolean {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setIdle(true), { timeout });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(() => setIdle(true), 600);
    return () => clearTimeout(id);
  }, [timeout]);
  return idle;
}
