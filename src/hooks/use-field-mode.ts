'use client';

import { useSyncExternalStore } from 'react';
import { usePrefersReducedMotion } from './use-prefers-reduced-motion';

export type FieldMode = 'webgl' | 'still' | 'poster';

export function resolveFieldMode({ webgl, reducedMotion }: { webgl: boolean; reducedMotion: boolean }): FieldMode {
  if (!webgl) return 'poster';
  return reducedMotion ? 'still' : 'webgl';
}

let webglSupport: boolean | undefined;
function hasWebGL(): boolean {
  if (webglSupport !== undefined) return webglSupport;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    webglSupport = Boolean(gl);
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

const noop = () => () => {};

/** 'poster' on the server and when WebGL is missing; 'still' under reduced motion; otherwise 'webgl'. */
export function useFieldMode(): FieldMode {
  const reducedMotion = usePrefersReducedMotion();
  const isClient = useSyncExternalStore(noop, () => true, () => false);
  if (!isClient) return 'poster';
  return resolveFieldMode({ webgl: hasWebGL(), reducedMotion });
}
