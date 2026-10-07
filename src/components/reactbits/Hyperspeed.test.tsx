import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Three.js and postprocessing can't run in jsdom, so both are stubbed. A universal stub stands in
// for everything the scene builds (geometries, materials, meshes); the few classes the port's loop
// logic depends on get real stubs that count what happens.
const gl = vi.hoisted(() => ({ renderers: 0, renders: 0, throwOnCreate: false }));

vi.mock('three', () => {
  function stub(): unknown {
    const target = function () {} as unknown as Record<PropertyKey, unknown>;
    return new Proxy(target, {
      get(t, prop) {
        if (prop === Symbol.toPrimitive) return () => 1;
        if (prop === 'then') return undefined;
        if (!(prop in t)) t[prop] = stub();
        return t[prop];
      },
      set(t, prop, value) {
        t[prop] = value;
        return true;
      },
      apply: () => stub(),
      construct: () => stub() as object,
    });
  }
  class WebGLRenderer {
    domElement = document.createElement('canvas');
    private ratio = 1;
    constructor() {
      if (gl.throwOnCreate) throw new Error('no WebGL');
      gl.renderers++;
    }
    setPixelRatio(r: number) { this.ratio = r; }
    getPixelRatio() { return this.ratio; }
    setSize() {}
    dispose() {}
    forceContextLoss() {}
  }
  class Timer {
    connect() {}
    update() {}
    reset() {}
    dispose() {}
    getDelta() { return 1 / 60; }
    getElapsed() { return 1; }
  }
  class LoadingManager {
    private started = 0;
    constructor(private onLoad: () => void) {}
    itemStart() { this.started++; }
    itemEnd() { if (--this.started === 0) this.onLoad(); }
  }
  // Vitest exposes only the names a mock lists, so every other name the scene uses is stubbed explicitly.
  const scene = ['Color', 'Fog', 'InstancedBufferAttribute', 'InstancedBufferGeometry', 'LineCurve3', 'Mesh', 'PerspectiveCamera', 'PlaneGeometry', 'Scene', 'ShaderMaterial', 'TubeGeometry', 'Vector2', 'Vector3', 'Vector4'];
  return {
    ...Object.fromEntries(scene.map(name => [name, stub()])),
    WebGLRenderer,
    Timer,
    LoadingManager,
    DoubleSide: 2,
    ShaderChunk: { fog_vertex: '', fog_fragment: '', fog_pars_vertex: '', fog_pars_fragment: '' },
  };
});

vi.mock('postprocessing', () => {
  class EffectComposer {
    addPass() {}
    setSize() {}
    dispose() {}
    render() { gl.renders++; }
  }
  class Pass { renderToScreen = false; }
  class SMAAEffect { static searchImageDataURL = 'data:search'; static areaImageDataURL = 'data:area'; }
  return { EffectComposer, RenderPass: Pass, EffectPass: Pass, BloomEffect: class {}, SMAAEffect, SMAAPreset: { MEDIUM: 2 } };
});

import Hyperspeed from './Hyperspeed';

let frames: Array<FrameRequestCallback | null> = [];
let io: IntersectionObserverCallback | undefined;
const flush = (n = 3) => {
  for (let i = 0; i < n; i++) {
    const batch = frames;
    frames = [];
    batch.forEach(cb => cb?.(performance.now()));
  }
};
// SMAA's lookup images "load" on the next microtask.
const settle = () => act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });

class FakeImage extends EventTarget {
  set src(_value: string) {
    queueMicrotask(() => this.dispatchEvent(new Event('load')));
  }
}

// jsdom lays nothing out, and the port (rightly) never renders into a 0x0 container.
const sized = (name: 'offsetWidth' | 'offsetHeight', value: number) =>
  Object.defineProperty(HTMLElement.prototype, name, { configurable: true, get: () => value });

beforeEach(() => {
  gl.renderers = 0;
  gl.renders = 0;
  gl.throwOnCreate = false;
  frames = [];
  io = undefined;
  sized('offsetWidth', 1440);
  sized('offsetHeight', 900);
  vi.stubGlobal('Image', FakeImage);
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb));
  vi.stubGlobal('cancelAnimationFrame', (id: number) => { frames[id - 1] = null; });
  vi.stubGlobal('IntersectionObserver', class {
    constructor(cb: IntersectionObserverCallback) { io = cb; }
    observe() {}
    unobserve() {}
    disconnect() {}
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
  sized('offsetWidth', 0);
  sized('offsetHeight', 0);
});

describe('Hyperspeed (ported loop)', () => {
  it('keeps one WebGL context while stillFrame and timeScale change', async () => {
    const { rerender } = render(<Hyperspeed />);
    await settle();
    rerender(<Hyperspeed stillFrame />);
    rerender(<Hyperspeed stillFrame timeScale={0.35} />);
    rerender(<Hyperspeed timeScale={1} />);
    expect(gl.renderers).toBe(1);
  });

  it('renders exactly one frame in still mode and never loops', async () => {
    const onReady = vi.fn();
    render(<Hyperspeed stillFrame onReady={onReady} />);
    await settle();
    flush(5);
    expect(gl.renders).toBe(1);
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('stops rendering when the road leaves the viewport', async () => {
    render(<Hyperspeed />);
    await settle();
    flush(3);
    const before = gl.renders;
    expect(before).toBeGreaterThan(0);
    act(() => io?.([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver));
    flush(5);
    expect(gl.renders).toBe(before);
  });

  it('calls onFail when the renderer cannot be created', () => {
    gl.throwOnCreate = true;
    const onFail = vi.fn();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Hyperspeed onFail={onFail} />);
    expect(onFail).toHaveBeenCalledTimes(1);
  });
});
