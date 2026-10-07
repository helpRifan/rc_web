'use client';

/*
 * FaultyTerminal from React Bits (https://reactbits.dev/r/FaultyTerminal-TS-TW).
 * Copyright (c) 2026 David Haz, MIT + Commons Clause. See THIRD_PARTY_NOTICES.md.
 *
 * The shaders, uniforms and hexToRgb are the registry's. The loop wiring is ported from
 * the owner-approved prototype; additions are marked "port-only": layout-driven uniforms,
 * a still frame for reduced motion, pausing when hidden or off-screen, window pointer
 * listeners, a lost-context fallback, a non-blocking shader warm-up, and pause/initialMouse
 * read through refs so they never rebuild the WebGL context.
 */

import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import React, { useEffect, useRef, useMemo, useCallback } from 'react';

type Vec2 = [number, number];

export interface FaultyTerminalProps extends React.HTMLAttributes<HTMLDivElement> {
  scale?: number;
  gridMul?: Vec2;
  digitSize?: number;
  timeScale?: number;
  pause?: boolean;
  scanlineIntensity?: number;
  glitchAmount?: number;
  flickerAmount?: number;
  noiseAmp?: number;
  chromaticAberration?: number;
  dither?: number | boolean;
  curvature?: number;
  tint?: string;
  mouseReact?: boolean;
  mouseStrength?: number;
  dpr?: number;
  pageLoadAnimation?: boolean;
  brightness?: number;
  lightMode?: boolean;
  /** Recomputes dpr, scale and gridMul from the container size on each resize. Uniforms only; no context rebuild. */
  layout?: (width: number, height: number) => { dpr: number; scale: number; gridMul: Vec2 };
  /** Render one frame and never loop (reduced motion). */
  stillFrame?: boolean;
  /** Where the cursor halo starts, in 0 to 1 container coordinates (y up). */
  initialMouse?: { x: number; y: number };
  /** port-only: something opaque covers the whole field (the home reel), so stop drawing. */
  covered?: boolean;
}

// Module-scope defaults: an inline `[2, 1]` default is a new array on every render, which
// re-ran the effect and rebuilt the WebGL context.
const DEFAULT_GRID_MUL: Vec2 = [2, 1];
const DEFAULT_INITIAL_MOUSE = { x: 0.5, y: 0.5 };

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision mediump float;

varying vec2 vUv;

uniform float iTime;
uniform vec3  iResolution;
uniform float uScale;

uniform vec2  uGridMul;
uniform float uDigitSize;
uniform float uScanlineIntensity;
uniform float uGlitchAmount;
uniform float uFlickerAmount;
uniform float uNoiseAmp;
uniform float uChromaticAberration;
uniform float uDither;
uniform float uCurvature;
uniform vec3  uTint;
uniform vec2  uMouse;
uniform float uMouseStrength;
uniform float uUseMouse;
uniform float uPageLoadProgress;
uniform float uUsePageLoadAnimation;
uniform float uBrightness;
uniform float uLightMode;

float time;

float hash21(vec2 p){
  p = fract(p * 234.56);
  p += dot(p, p + 34.56);
  return fract(p.x * p.y);
}

float noise(vec2 p)
{
  return sin(p.x * 10.0) * sin(p.y * (3.0 + sin(time * 0.090909))) + 0.2; 
}

mat2 rotate(float angle)
{
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c);
}

float fbm(vec2 p)
{
  p *= 1.1;
  float f = 0.0;
  float amp = 0.5 * uNoiseAmp;
  
  mat2 modify0 = rotate(time * 0.02);
  f += amp * noise(p);
  p = modify0 * p * 2.0;
  amp *= 0.454545;
  
  mat2 modify1 = rotate(time * 0.02);
  f += amp * noise(p);
  p = modify1 * p * 2.0;
  amp *= 0.454545;
  
  mat2 modify2 = rotate(time * 0.08);
  f += amp * noise(p);
  
  return f;
}

float pattern(vec2 p, out vec2 q, out vec2 r) {
  vec2 offset1 = vec2(1.0);
  vec2 offset0 = vec2(0.0);
  mat2 rot01 = rotate(0.1 * time);
  mat2 rot1 = rotate(0.1);
  
  q = vec2(fbm(p + offset1), fbm(rot01 * p + offset1));
  r = vec2(fbm(rot1 * q + offset0), fbm(q + offset0));
  return fbm(p + r);
}

float digit(vec2 p){
    vec2 grid = uGridMul * 15.0;
    vec2 s = floor(p * grid) / grid;
    p = p * grid;
    vec2 q, r;
    float intensity = pattern(s * 0.1, q, r) * 1.3 - 0.03;
    
    if(uUseMouse > 0.5){
        vec2 mouseWorld = uMouse * uScale;
        float distToMouse = distance(s, mouseWorld);
        float mouseInfluence = exp(-distToMouse * 8.0) * uMouseStrength * 10.0;
        intensity += mouseInfluence;
        
        float ripple = sin(distToMouse * 20.0 - iTime * 5.0) * 0.1 * mouseInfluence;
        intensity += ripple;
    }
    
    if(uUsePageLoadAnimation > 0.5){
        float cellRandom = fract(sin(dot(s, vec2(12.9898, 78.233))) * 43758.5453);
        float cellDelay = cellRandom * 0.8;
        float cellProgress = clamp((uPageLoadProgress - cellDelay) / 0.2, 0.0, 1.0);
        
        float fadeAlpha = smoothstep(0.0, 1.0, cellProgress);
        intensity *= fadeAlpha;
    }
    
    p = fract(p);
    p *= uDigitSize;
    
    float px5 = p.x * 5.0;
    float py5 = (1.0 - p.y) * 5.0;
    float x = fract(px5);
    float y = fract(py5);
    
    float i = floor(py5) - 2.0;
    float j = floor(px5) - 2.0;
    float n = i * i + j * j;
    float f = n * 0.0625;
    
    float isOn = step(0.1, intensity - f);
    float brightness = isOn * (0.2 + y * 0.8) * (0.75 + x * 0.25);
    
    return step(0.0, p.x) * step(p.x, 1.0) * step(0.0, p.y) * step(p.y, 1.0) * brightness;
}

float onOff(float a, float b, float c)
{
  return step(c, sin(iTime + a * cos(iTime * b))) * uFlickerAmount;
}

float displace(vec2 look)
{
    float y = look.y - mod(iTime * 0.25, 1.0);
    float window = 1.0 / (1.0 + 50.0 * y * y);
    return sin(look.y * 20.0 + iTime) * 0.0125 * onOff(4.0, 2.0, 0.8) * (1.0 + cos(iTime * 60.0)) * window;
}

vec3 getColor(vec2 p){
    
    float bar = step(mod(p.y + time * 20.0, 1.0), 0.2) * 0.4 + 1.0;
    bar *= uScanlineIntensity;
    
    float displacement = displace(p);
    p.x += displacement;

    if (uGlitchAmount != 1.0) {
      float extra = displacement * (uGlitchAmount - 1.0);
      p.x += extra;
    }

    float middle = digit(p);
    
    const float off = 0.002;
    float sum = digit(p + vec2(-off, -off)) + digit(p + vec2(0.0, -off)) + digit(p + vec2(off, -off)) +
                digit(p + vec2(-off, 0.0)) + digit(p + vec2(0.0, 0.0)) + digit(p + vec2(off, 0.0)) +
                digit(p + vec2(-off, off)) + digit(p + vec2(0.0, off)) + digit(p + vec2(off, off));
    
    vec3 baseColor = vec3(0.9) * middle + sum * 0.1 * vec3(1.0) * bar;
    return baseColor;
}

vec2 barrel(vec2 uv){
  vec2 c = uv * 2.0 - 1.0;
  float r2 = dot(c, c);
  c *= 1.0 + uCurvature * r2;
  return c * 0.5 + 0.5;
}

void main() {
    time = iTime * 0.333333;
    vec2 uv = vUv;

    if(uCurvature != 0.0){
      uv = barrel(uv);
    }
    
    vec2 p = uv * uScale;
    vec3 col = getColor(p);

    if(uChromaticAberration != 0.0){
      vec2 ca = vec2(uChromaticAberration) / iResolution.xy;
      col.r = getColor(p + ca).r;
      col.b = getColor(p - ca).b;
    }

    col *= uTint;
    col *= uBrightness;

    if(uDither > 0.0){
      float rnd = hash21(gl_FragCoord.xy);
      col += (rnd - 0.5) * (uDither * 0.003922);
    }

    if (uLightMode > 0.5) {
      float energy = max(max(col.r, col.g), col.b);
      float coverage = clamp(smoothstep(0.0, 0.72, energy) * 0.9, 0.0, 0.9);
      vec3 ink = clamp(col * 0.42, 0.0, 0.76);
      col = mix(vec3(1.0), ink, coverage);
    }

    gl_FragColor = vec4(col, 1.0);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '').trim();
  if (h.length === 3)
    h = h
      .split('')
      .map(c => c + c)
      .join('');
  const num = parseInt(h.slice(0, 6), 16);
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

type ParallelCompile = { COMPLETION_STATUS_KHR: number };

/**
 * port-only: compile and link the field's program on the GPU's worker threads first
 * (KHR_parallel_shader_compile), polling without blocking, then call `ready`. On a cold
 * shader cache, ogl's blocking link took about 1.9s of main thread on an Intel iGPU and froze
 * the headline mid-scramble; the real Program built afterwards links from the browser's
 * program cache. Without the extension (or a real context) `ready` runs synchronously.
 */
function warmUpShaders(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  vertex: string,
  fragment: string,
  ready: () => void
): () => void {
  const ext =
    typeof gl.createProgram === 'function'
      ? (gl.getExtension('KHR_parallel_shader_compile') as ParallelCompile | null)
      : null;
  const program = ext ? gl.createProgram() : null;
  if (!ext || !program) {
    ready();
    return () => {};
  }
  const shaders = (
    [
      [gl.VERTEX_SHADER, vertex],
      [gl.FRAGMENT_SHADER, fragment]
    ] as const
  ).map(([type, source]) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
    return shader;
  });
  gl.linkProgram(program);

  let timer = 0;
  const release = () => {
    shaders.forEach(shader => shader && gl.deleteShader(shader));
    gl.deleteProgram(program);
  };
  const poll = () => {
    if (gl.isContextLost() || gl.getProgramParameter(program, ext.COMPLETION_STATUS_KHR)) {
      release();
      ready();
    } else {
      timer = window.setTimeout(poll, 32);
    }
  };
  timer = window.setTimeout(poll, 32);
  return () => {
    window.clearTimeout(timer);
    release();
  };
}

export default function FaultyTerminal({
  scale = 1,
  gridMul = DEFAULT_GRID_MUL,
  digitSize = 1.5,
  timeScale = 0.3,
  pause = false,
  scanlineIntensity = 0.3,
  glitchAmount = 1,
  flickerAmount = 1,
  noiseAmp = 1,
  chromaticAberration = 0,
  dither = 0,
  curvature = 0.2,
  tint = '#ffffff',
  mouseReact = true,
  mouseStrength = 0.2,
  dpr,
  pageLoadAnimation = true,
  brightness = 1,
  lightMode = false,
  layout,
  stillFrame = false,
  initialMouse,
  covered = false,
  className,
  style,
  ...rest
}: FaultyTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const programRef = useRef<Program>(null);
  const rendererRef = useRef<Renderer>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });
  const frozenTimeRef = useRef(0);
  const rafRef = useRef<number>(0);
  const loadAnimationStartRef = useRef<number>(0);
  const timeOffsetRef = useRef<number>(0);
  // port-only: read inside the loop, so toggling them never rebuilds the WebGL context.
  const pauseRef = useRef(pause);
  const initialMouseRef = useRef(initialMouse);
  const coveredRef = useRef(covered);
  const syncLoopRef = useRef<() => void>(() => {});

  useEffect(() => {
    pauseRef.current = pause;
  }, [pause]);

  useEffect(() => {
    initialMouseRef.current = initialMouse;
  }, [initialMouse]);

  useEffect(() => {
    coveredRef.current = covered;
    syncLoopRef.current();
  }, [covered]);

  const tintVec = useMemo(() => hexToRgb(tint), [tint]);

  const ditherValue = useMemo(() => (typeof dither === 'boolean' ? (dither ? 1 : 0) : dither), [dither]);

  // The original listens on the container. Here the container sits behind the page content,
  // so the same handler listens on window (pointer events cover touch too).
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const ctn = containerRef.current;
    if (!ctn) return;
    const rect = ctn.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1 - (e.clientY - rect.top) / rect.height;
    mouseRef.current = { x, y };
  }, []);

  useEffect(() => {
    const ctn = containerRef.current;
    if (!ctn) return;

    const start = initialMouseRef.current ?? DEFAULT_INITIAL_MOUSE;
    mouseRef.current = { x: start.x, y: start.y };
    smoothMouseRef.current = { x: start.x, y: start.y };
    timeOffsetRef.current = Math.random() * 100;

    const startDpr = layout
      ? layout(ctn.offsetWidth, ctn.offsetHeight).dpr
      : (dpr ?? Math.min(window.devicePixelRatio || 1, 2));
    const renderer = new Renderer({ dpr: startDpr });
    rendererRef.current = renderer;
    const gl = renderer.gl;
    gl.clearColor(lightMode ? 1 : 0, lightMode ? 1 : 0, lightMode ? 1 : 0, 1);

    // Everything below runs once the shaders are ready. It returns its own cleanup.
    const startField = (): (() => void) => {
      const geometry = new Triangle(gl);

      const program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
          iTime: { value: 0 },
          iResolution: {
            value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height)
          },
          uScale: { value: scale },

          uGridMul: { value: new Float32Array(gridMul) },
          uDigitSize: { value: digitSize },
          uScanlineIntensity: { value: scanlineIntensity },
          uGlitchAmount: { value: glitchAmount },
          uFlickerAmount: { value: flickerAmount },
          uNoiseAmp: { value: noiseAmp },
          uChromaticAberration: { value: chromaticAberration },
          uDither: { value: ditherValue },
          uCurvature: { value: curvature },
          uTint: { value: new Color(tintVec[0], tintVec[1], tintVec[2]) },
          uMouse: {
            value: new Float32Array([smoothMouseRef.current.x, smoothMouseRef.current.y])
          },
          uMouseStrength: { value: mouseStrength },
          uUseMouse: { value: mouseReact ? 1 : 0 },
          uPageLoadProgress: { value: pageLoadAnimation ? 0 : 1 },
          uUsePageLoadAnimation: { value: pageLoadAnimation ? 1 : 0 },
          uBrightness: { value: brightness },
          uLightMode: { value: lightMode ? 1 : 0 }
        }
      });
      programRef.current = program;

      const mesh = new Mesh(gl, { geometry, program });

      // port-only: reduced motion renders a single frame, picked at a moment when the
      // travelling glitch band (onOff(4.0, 2.0, 0.8) in displace()) is idle.
      let stillRaf = 0;
      const renderStill = () => {
        cancelAnimationFrame(stillRaf);
        stillRaf = requestAnimationFrame(() => {
          let elapsed = timeOffsetRef.current * timeScale;
          for (let k = 0; k < 64 && Math.sin(elapsed + 4 * Math.cos(elapsed * 2)) >= 0.8; k++) elapsed += 0.173;
          program.uniforms.iTime.value = elapsed;
          program.uniforms.uPageLoadProgress.value = 1; // a still frame is the settled field
          frozenTimeRef.current = elapsed;
          renderer.render({ scene: mesh });
        });
      };

      const resize = () => {
        const w = ctn.offsetWidth;
        const h = ctn.offsetHeight;
        if (layout) {
          const l = layout(w, h);
          renderer.dpr = l.dpr;
          program.uniforms.uScale.value = l.scale;
          const grid = program.uniforms.uGridMul.value as Float32Array;
          grid[0] = l.gridMul[0];
          grid[1] = l.gridMul[1];
        }
        renderer.setSize(w, h);
        program.uniforms.iResolution.value = new Color(
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height
        );
        if (stillFrame) renderStill();
      };

      const resizeObserver = new ResizeObserver(() => resize());
      resizeObserver.observe(ctn);
      resize();

      const update = (t: number) => {
        rafRef.current = requestAnimationFrame(update);

        if (pageLoadAnimation && loadAnimationStartRef.current === 0) {
          loadAnimationStartRef.current = t;
        }

        if (!pauseRef.current) {
          const elapsed = (t * 0.001 + timeOffsetRef.current) * timeScale;
          program.uniforms.iTime.value = elapsed;
          frozenTimeRef.current = elapsed;
        } else {
          program.uniforms.iTime.value = frozenTimeRef.current;
        }

        if (pageLoadAnimation && loadAnimationStartRef.current > 0) {
          const animationDuration = 2000;
          const animationElapsed = t - loadAnimationStartRef.current;
          const progress = Math.min(animationElapsed / animationDuration, 1);
          program.uniforms.uPageLoadProgress.value = progress;
        }

        if (mouseReact) {
          const dampingFactor = 0.08;
          const smoothMouse = smoothMouseRef.current;
          const mouse = mouseRef.current;
          smoothMouse.x += (mouse.x - smoothMouse.x) * dampingFactor;
          smoothMouse.y += (mouse.y - smoothMouse.y) * dampingFactor;

          const mouseUniform = program.uniforms.uMouse.value as Float32Array;
          mouseUniform[0] = smoothMouse.x;
          mouseUniform[1] = smoothMouse.y;
        }

        renderer.render({ scene: mesh });
      };

      // port-only: run the loop only while the tab is visible and the canvas is on screen.
      let inView = true;
      let lost = false;
      const syncLoop = () => {
        const shouldRun = !stillFrame && !lost && !document.hidden && inView && !coveredRef.current;
        if (shouldRun && !rafRef.current) {
          rafRef.current = requestAnimationFrame(update);
        } else if (!shouldRun && rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
        }
      };
      const visibilityObserver = new IntersectionObserver(entries => {
        inView = entries[entries.length - 1].isIntersecting;
        syncLoop();
      });
      visibilityObserver.observe(ctn);
      document.addEventListener('visibilitychange', syncLoop);
      window.addEventListener('resize', resize); // DPR/zoom changes that ResizeObserver misses

      // port-only: a lost context (GPU reset, driver crash) stops the loop and takes the
      // canvas out, so whatever sits underneath (the site's poster) shows instead.
      const onContextLost = () => {
        lost = true;
        syncLoop();
        cancelAnimationFrame(stillRaf);
        if (gl.canvas.parentElement === ctn) ctn.removeChild(gl.canvas);
      };
      gl.canvas.addEventListener('webglcontextlost', onContextLost);

      syncLoopRef.current = syncLoop;
      syncLoop();
      ctn.appendChild(gl.canvas);

      if (mouseReact) {
        window.addEventListener('pointermove', handleMouseMove, { passive: true });
        window.addEventListener('pointerdown', handleMouseMove, { passive: true });
      }

      return () => {
        syncLoopRef.current = () => {};
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
        cancelAnimationFrame(stillRaf);
        resizeObserver.disconnect();
        visibilityObserver.disconnect();
        document.removeEventListener('visibilitychange', syncLoop);
        window.removeEventListener('resize', resize);
        gl.canvas.removeEventListener('webglcontextlost', onContextLost);
        if (mouseReact) {
          window.removeEventListener('pointermove', handleMouseMove);
          window.removeEventListener('pointerdown', handleMouseMove);
        }
      };
    };

    let stopField: (() => void) | undefined;
    const cancelWarmUp = warmUpShaders(gl, vertexShader, fragmentShader, () => {
      // A context lost during the warm-up never starts the field; the poster stays.
      if (!gl.isContextLost?.()) stopField = startField();
    });

    return () => {
      cancelWarmUp();
      stopField?.();
      if (gl.canvas.parentElement === ctn) ctn.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      loadAnimationStartRef.current = 0;
    };
  }, [
    dpr,
    timeScale,
    scale,
    gridMul,
    digitSize,
    scanlineIntensity,
    glitchAmount,
    flickerAmount,
    noiseAmp,
    chromaticAberration,
    ditherValue,
    curvature,
    tintVec,
    mouseReact,
    mouseStrength,
    pageLoadAnimation,
    brightness,
    lightMode,
    handleMouseMove,
    layout,
    stillFrame
  ]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden ${className ?? ''}`}
      style={style}
      {...rest}
    />
  );
}
