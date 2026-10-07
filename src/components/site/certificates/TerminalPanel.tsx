'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import { FieldBoundary } from '@/components/site/FieldBoundary';
import { fieldLayout } from '@/components/site/home/field-layout';
import { useFieldMode } from '@/hooks/use-field-mode';
import { PALETTE } from '@/lib/palette';

const FaultyTerminal = dynamic(() => import('@/components/reactbits/FaultyTerminal'), { ssr: false });

const layout = (w: number, h: number) => fieldLayout(w, h, window.matchMedia('(pointer: coarse)').matches);

/**
 * The homepage's glyph field in a small rounded panel, dimmed behind a scrim (certificates brief
 * 5): no pointer reaction and no load animation. A still frame under reduced motion; the dot
 * poster without WebGL.
 */
export function TerminalPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  const mode = useFieldMode();
  return (
    <div className={`field-host relative isolate overflow-hidden rounded-2xl bg-rc-bg ring-1 ring-inset ring-rc-line ${className}`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="field-poster absolute inset-0 opacity-70" />
        {mode !== 'poster' && (
          <FieldBoundary>
            <FaultyTerminal
              className="absolute inset-0 mix-blend-lighten"
              layout={layout}
              stillFrame={mode === 'still'}
              mouseReact={false}
              pageLoadAnimation={false}
              tint={PALETTE.accent}
              digitSize={1.2}
              timeScale={0.5}
              scanlineIntensity={0.5}
              curvature={0.1}
              noiseAmp={1}
              brightness={0.35}
            />
          </FieldBoundary>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,13,13,0.86),rgba(13,13,13,0.62)_70%,rgba(13,13,13,0.4))]" />
      </div>
      {children}
    </div>
  );
}
