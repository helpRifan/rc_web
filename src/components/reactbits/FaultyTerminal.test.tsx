import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const gl = vi.hoisted(() => ({ renderers: 0, renders: 0 }));
vi.mock('ogl', () => {
  class Renderer {
    dpr: number;
    gl = {
      canvas: document.createElement('canvas'),
      clearColor() {},
      getExtension() { return { loseContext() {} }; },
    };
    constructor(options: { dpr: number }) { gl.renderers++; this.dpr = options.dpr; }
    setSize() {}
    render() { gl.renders++; }
  }
  class Program { uniforms: Record<string, { value: unknown }>; constructor(_: unknown, o: { uniforms: Record<string, { value: unknown }> }) { this.uniforms = o.uniforms; } }
  class Mesh {}
  class Triangle {}
  class Color { constructor(...values: number[]) { return values as unknown as Color; } }
  return { Renderer, Program, Mesh, Triangle, Color };
});

import FaultyTerminal from './FaultyTerminal';

let frames: Array<FrameRequestCallback | null> = [];
let io: IntersectionObserverCallback | undefined;
const flush = (n = 3) => {
  for (let i = 0; i < n; i++) {
    const batch = frames; frames = [];
    batch.forEach(cb => cb?.(performance.now()));
  }
};

beforeEach(() => {
  gl.renderers = 0; gl.renders = 0; frames = []; io = undefined;
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb));
  vi.stubGlobal('cancelAnimationFrame', (id: number) => { frames[id - 1] = null; });
  vi.stubGlobal('IntersectionObserver', class {
    constructor(cb: IntersectionObserverCallback) { io = cb; }
    observe() {} unobserve() {} disconnect() {}
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('FaultyTerminal (ported loop)', () => {
  it('keeps one WebGL context while pause toggles', () => {
    const { rerender } = render(<FaultyTerminal pause={false} />);
    rerender(<FaultyTerminal pause />);
    rerender(<FaultyTerminal pause={false} />);
    expect(gl.renderers).toBe(1);
  });

  it('renders exactly one frame in still mode', () => {
    render(<FaultyTerminal stillFrame />);
    flush(5);
    expect(gl.renders).toBe(1);
  });

  it('stops rendering when the canvas leaves the viewport', () => {
    render(<FaultyTerminal />);
    flush(2);
    const before = gl.renders;
    expect(before).toBeGreaterThan(0);
    io?.([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver);
    flush(5);
    expect(gl.renders).toBe(before);
  });
});
