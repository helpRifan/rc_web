'use client';

import { createContext, type ReactNode, useCallback, useContext, useRef, useState } from 'react';
import type { HyperspeedHandle } from '@/components/reactbits/Hyperspeed';
import { EventsRoad } from './EventsRoad';
import { useRoadBoost } from './use-road-boost';

const RoadContext = createContext(false);

/** True while the road behind this hero is animating. */
export const useRoadLive = () => useContext(RoadContext);

type Props = {
  pace: 'live' | 'calm';
  className: string;
  labelledBy: string;
  /** calm stages (event detail) have no press-and-hold boost. */
  boost?: boolean;
  children: ReactNode;
};

/** A hero section with the Hyperspeed road behind server-rendered copy. */
export function RoadStage({ pace, className, labelledBy, boost = true, children }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const roadRef = useRef<HyperspeedHandle>(null);
  const [live, setLive] = useState(false);
  const onLiveChange = useCallback((value: boolean) => setLive(value), []);
  useRoadBoost(sectionRef, roadRef, boost && live);

  return (
    <section ref={sectionRef} aria-labelledby={labelledBy} className={`relative isolate overflow-x-clip ${className}`}>
      <EventsRoad pace={pace} controlRef={roadRef} onLiveChange={onLiveChange} />
      <RoadContext.Provider value={boost && live}>{children}</RoadContext.Provider>
    </section>
  );
}
