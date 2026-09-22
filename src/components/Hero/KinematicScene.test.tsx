import ReactThreeTestRenderer from '@react-three/test-renderer';
import { describe, expect, it } from 'vitest';
import type * as THREE from 'three';
import { SceneContents } from './KinematicScene';

describe('KinematicScene', () => {
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

  it('gear meshes use torus geometry per the spec', async () => {
    const renderer = await ReactThreeTestRenderer.create(<SceneContents />);
    const gearMeshes = renderer.scene.findAllByProps({ 'data-gear': true });
    const geometryTypes = gearMeshes.map((mesh) => (mesh.instance as THREE.Mesh).geometry.type);
    expect(geometryTypes.every((type) => type === 'TorusGeometry')).toBe(true);
  });
});
