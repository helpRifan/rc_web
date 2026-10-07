'use client';

import dynamic from 'next/dynamic';
import { type Ref, useEffect, useRef, useState } from 'react';
import type { HyperspeedHandle } from '@/components/reactbits/Hyperspeed';
import { FieldBoundary } from '@/components/site/FieldBoundary';
import { useAfterIdle } from '@/hooks/use-after-idle';
import { useFieldMode } from '@/hooks/use-field-mode';
import { useNearViewport } from '@/hooks/use-near-viewport';
import { roadLayout } from './road-layout';
import { ROAD_OPTIONS } from './road-options';

const Hyperspeed = dynamic(() => import('@/components/reactbits/Hyperspeed'), { ssr: false });

type Props = {
  /** live: the approved pace; calm: slower, for an event's own page. */
  pace: 'live' | 'calm';
  controlRef: Ref<HyperspeedHandle>;
  /** True while the road is actually animating (so the boost and its hint make sense). */
  onLiveChange: (live: boolean) => void;
};

/**
 * The Hyperspeed road behind an events hero. The CSS poster is always underneath; WebGL mounts
 * after idle and near the viewport, fades in once its first frame is drawn, and falls back to the
 * poster on any failure, or to a still frame under reduced motion or on a slow GPU.
 */
export function EventsRoad({ pace, controlRef, onLiveChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mode = useFieldMode();
  const near = useNearViewport(ref);
  const idle = useAfterIdle();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [slow, setSlow] = useState(false);

  const effective = failed ? 'poster' : slow && mode === 'webgl' ? 'still' : mode;
  const live = effective === 'webgl' && ready;

  useEffect(() => {
    onLiveChange(live);
  }, [live, onLiveChange]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 select-none [-webkit-touch-callout:none] [mask-image:linear-gradient(to_bottom,#0D0D0D_72%,transparent)]"
    >
      <div data-testid="road-poster" className="road-poster absolute inset-0 overflow-hidden" />
      {effective !== 'poster' && near && idle && (
        <FieldBoundary>
          {/* An event's own page keeps the road faint (70%), so its title leads. */}
          <div className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none ${!ready ? 'opacity-0' : pace === 'calm' ? 'opacity-70' : 'opacity-100'}`}>
            <Hyperspeed
              effectOptions={ROAD_OPTIONS}
              layout={roadLayout}
              stillFrame={effective === 'still'}
              timeScale={pace === 'calm' ? 0.35 : 1}
              controlRef={controlRef}
              onReady={() => setReady(true)}
              onFail={() => setFailed(true)}
              onSlow={() => setSlow(true)}
            />
          </div>
        </FieldBoundary>
      )}
    </div>
  );
}
