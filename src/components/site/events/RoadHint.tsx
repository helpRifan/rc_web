'use client';

import { useSyncExternalStore } from 'react';
import { useRoadLive } from './RoadStage';

const COARSE = '(pointer: coarse)';
const subscribe = (onChange: () => void) => {
  const mql = window.matchMedia(COARSE);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
};

/** The quiet hold-to-boost hint. Its space is always reserved, so showing it never shifts the layout. */
export function RoadHint() {
  const live = useRoadLive();
  const coarse = useSyncExternalStore(subscribe, () => window.matchMedia(COARSE).matches, () => false);
  return (
    <p
      aria-hidden="true"
      className={`mt-5 min-h-5 text-[14px] text-rc-muted transition-opacity duration-300 motion-reduce:transition-none ${live ? 'opacity-100' : 'opacity-0'}`}
    >
      {coarse ? 'Touch and hold to speed up.' : 'Press and hold to speed up.'}
    </p>
  );
}
