import ReactThreeTestRenderer from '@react-three/test-renderer';
import type { RootState } from '@react-three/fiber';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type * as THREE from 'three';
import { SceneContents } from './KinematicScene';

type TestRenderer = Awaited<ReturnType<typeof ReactThreeTestRenderer.create>>;

// Renders SceneContents and captures R3F's root state (camera, clock, ...) via the documented
// onCreated option, since the test renderer only exposes the scene graph.
async function createScene(): Promise<{ renderer: TestRenderer; state: RootState }> {
  let captured: RootState | undefined;
  const renderer = await ReactThreeTestRenderer.create(<SceneContents />, {
    onCreated: (state) => {
      captured = state;
    },
  });
  if (!captured) throw new Error('onCreated did not fire');
  return { renderer, state: captured };
}

// The test renderer forces frameloop="never", which stops R3F's clock, and advanceFrames() only
// invokes the useFrame subscribers — it never moves clock time. Drive time the same way R3F's own
// advance(timestamp) does in frameloop="never" mode: set clock.elapsedTime, then run a frame.
async function advanceSeconds(renderer: TestRenderer, state: RootState, seconds: number, fps = 60) {
  const frames = Math.round(seconds * fps);
  for (let i = 0; i < frames; i++) {
    state.clock.elapsedTime += 1 / fps;
    await renderer.advanceFrames(1, 1 / fps);
  }
}

describe('KinematicScene', () => {
  afterEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true, writable: true });
  });

  it('renders between 3 and 5 gear meshes', async () => {
    const renderer = await ReactThreeTestRenderer.create(<SceneContents />);
    const gearMeshes = renderer.scene.findAllByProps({ 'data-gear': true });
    expect(gearMeshes.length).toBeGreaterThanOrEqual(3);
    expect(gearMeshes.length).toBeLessThanOrEqual(5);
  });

  it('renders a points object for the neural node overlay', async () => {
    const renderer = await ReactThreeTestRenderer.create(<SceneContents />);
    const points = renderer.scene.findAllByProps({ 'data-neural-points': true });
    expect(points.length).toBe(1);
  });

  it('renders line segments for the neural graph edges', async () => {
    const renderer = await ReactThreeTestRenderer.create(<SceneContents />);
    const lines = renderer.scene.findAllByProps({ 'data-neural-edges': true });
    expect(lines.length).toBe(1);
  });

  it('gear meshes use extruded gear-tooth geometry per the spec', async () => {
    const renderer = await ReactThreeTestRenderer.create(<SceneContents />);
    const gearMeshes = renderer.scene.findAllByProps({ 'data-gear': true });
    const geometryTypes = gearMeshes.map((mesh) => (mesh.instance as THREE.Mesh).geometry.type);
    expect(geometryTypes.every((type) => type === 'ExtrudeGeometry')).toBe(true);
  });

  it('registers and cleans up a scroll listener to drive the camera pull-back', async () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const renderer = await ReactThreeTestRenderer.create(<SceneContents />);
    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), expect.objectContaining({ passive: true }));
    await renderer.unmount();
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('pulls the camera back on scroll once frames run', async () => {
    const { renderer, state } = await createScene();

    await renderer.advanceFrames(1, 1 / 60);
    const baseZ = state.camera.position.z;

    Object.defineProperty(window, 'scrollY', { value: window.innerHeight, configurable: true, writable: true });
    await ReactThreeTestRenderer.act(async () => {
      window.dispatchEvent(new Event('scroll'));
    });
    await renderer.advanceFrames(1, 1 / 60);

    expect(state.camera.position.z).toBeGreaterThan(baseZ);
  });

  it('rotates the gears as frames advance, with neighbouring gears counter-rotating', async () => {
    const { renderer, state } = await createScene();
    const gears = renderer.scene
      .findAllByProps({ 'data-gear': true })
      .map((gear) => gear.instance as THREE.Mesh);
    expect(gears.every((gear) => gear.rotation.z === 0)).toBe(true);

    await advanceSeconds(renderer, state, 1);

    expect(gears.some((gear) => gear.rotation.z !== 0)).toBe(true);
    // Opposite signs (and both non-zero): gear 0 and gear 1 turn in opposite directions.
    expect(gears[0].rotation.z * gears[1].rotation.z).toBeLessThan(0);
  });
});
