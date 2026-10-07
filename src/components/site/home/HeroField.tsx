'use client';

import dynamic from 'next/dynamic';
import { FieldBoundary } from '@/components/site/FieldBoundary';
import { useFieldMode } from '@/hooks/use-field-mode';
import { PALETTE } from '@/lib/palette';
import { fieldLayout } from './field-layout';

const FaultyTerminal = dynamic(() => import('@/components/reactbits/FaultyTerminal'), { ssr: false });

const layout = (w: number, h: number) => fieldLayout(w, h, window.matchMedia('(pointer: coarse)').matches);

export function HeroField({ dim = false, covered = false }: { dim?: boolean; covered?: boolean }) {
  const mode = useFieldMode();
  const wide = typeof window !== 'undefined' && window.innerWidth >= 700;
  return (
    // The field fades into the page over its last 10rem, so the sections below start on a clean
    // page (home brief 5). The 404 passes `dim` and keeps its own look.
    <div
      aria-hidden="true"
      className={`field-host pointer-events-none absolute inset-0 z-0 bg-rc-bg ${dim ? 'opacity-40' : '[mask-image:linear-gradient(to_bottom,#0D0D0D_calc(100%-10rem),transparent)]'}`}
    >
      <div data-testid="field-poster" className="field-poster absolute inset-0" />
      {mode !== 'poster' && (
        <FieldBoundary>
          <FaultyTerminal
            className="absolute inset-0 mix-blend-lighten"
            layout={layout}
            stillFrame={mode === 'still'}
            mouseReact={mode === 'webgl'}
            pageLoadAnimation={mode === 'webgl'}
            tint={PALETTE.accent}
            digitSize={1.2}
            timeScale={0.5}
            scanlineIntensity={0.5}
            curvature={0.1}
            mouseStrength={0.5}
            noiseAmp={1}
            brightness={dim ? 0.35 : 0.6}
            initialMouse={wide ? { x: 0.78, y: 0.5 } : { x: 0.5, y: 0.14 }}
            covered={covered}
          />
        </FieldBoundary>
      )}
    </div>
  );
}
