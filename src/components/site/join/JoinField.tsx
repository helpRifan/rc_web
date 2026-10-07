'use client';

import dynamic from 'next/dynamic';
import { useRef, useState, useSyncExternalStore } from 'react';
import { FieldBoundary } from '@/components/site/FieldBoundary';
import { useFieldMode } from '@/hooks/use-field-mode';
import { useNearViewport } from '@/hooks/use-near-viewport';

const LiquidEther = dynamic(() => import('@/components/reactbits/LiquidEther'), { ssr: false });

// Module-level so the component's effect never sees new identities (that would rebuild WebGL).
const COLORS = ['#4A8DB7', '#619AC3', '#FFFFFF'];
const COARSE = '(pointer: coarse)';
const subscribeCoarse = (onChange: () => void) => {
  const mql = window.matchMedia(COARSE);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
};

/**
 * LiquidEther behind the Join form, in the approved prototype's values (no viscosity, mouse force
 * 32, cursor size 130). The poster image underneath is a real frame of the same fluid; the canvas
 * fades in on its first frame, pauses while a touch user is typing, and gives up on slow GPUs.
 */
export function JoinField({ typing }: { typing: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const mode = useFieldMode();
  const near = useNearViewport(ref);
  const coarse = useSyncExternalStore(subscribeCoarse, () => window.matchMedia(COARSE).matches, () => false);
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false);
  const show = mode !== 'poster' && near && !slow;

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      {show && (
        <FieldBoundary>
          <div className={`absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none ${ready ? 'opacity-100' : 'opacity-0'}`}>
            <LiquidEther
              className="absolute inset-0"
              colors={COLORS}
              mouseForce={32}
              cursorSize={130}
              isViscous={false}
              viscous={30}
              iterationsViscous={32}
              iterationsPoisson={coarse ? 20 : 32}
              dt={0.014}
              BFECC
              resolution={coarse ? 0.35 : 0.5}
              isBounce={false}
              autoDemo
              autoSpeed={0.5}
              autoIntensity={3}
              takeoverDuration={0.25}
              autoResumeDelay={500}
              autoRampDuration={0.6}
              maxDpr={coarse ? 1 : 1.5}
              staticFrame={mode === 'still'}
              paused={coarse && typing}
              onReady={() => setReady(true)}
              onSlow={() => setSlow(true)}
            />
          </div>
        </FieldBoundary>
      )}
    </div>
  );
}
