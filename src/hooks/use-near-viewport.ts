'use client';

import { type RefObject, useEffect, useState } from 'react';

/** True once the element has come within `margin` of the viewport (and stays true). */
export function useNearViewport(ref: RefObject<Element | null>, margin = '200px'): boolean {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: margin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, margin, near]);
  return near;
}
