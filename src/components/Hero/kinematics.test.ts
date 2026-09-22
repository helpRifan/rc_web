import { describe, expect, it } from 'vitest';
import {
  buildGearLayout,
  buildNeuralEdges,
  buildNeuralNodes,
  computeCameraZ,
  computeGearRotation,
  computeParallaxOffset,
} from './kinematics';

describe('computeGearRotation', () => {
  it('scales rotation speed by the gear ratio', () => {
    const slow = computeGearRotation(1, 2, 1);
    const fast = computeGearRotation(3, 2, 1);
    expect(fast).toBeCloseTo(slow * 3, 5);
  });

  it('is zero at elapsedSeconds = 0', () => {
    expect(computeGearRotation(2, 0, 1)).toBe(0);
  });
});

describe('computeParallaxOffset', () => {
  it('returns zero offset for a centered pointer', () => {
    expect(computeParallaxOffset(0, 0, 0.5)).toEqual({ x: 0, y: 0 });
  });

  it('scales offset by strength', () => {
    const weak = computeParallaxOffset(1, 1, 0.1);
    const strong = computeParallaxOffset(1, 1, 0.5);
    expect(Math.abs(strong.x)).toBeGreaterThan(Math.abs(weak.x));
    expect(Math.abs(strong.y)).toBeGreaterThan(Math.abs(weak.y));
  });
});

describe('computeCameraZ', () => {
  it('equals baseZ at scrollProgress 0', () => {
    expect(computeCameraZ(0, 10, 5)).toBe(10);
  });

  it('pulls back by the full distance at scrollProgress 1', () => {
    expect(computeCameraZ(1, 10, 5)).toBe(15);
  });

  it('clamps scrollProgress outside [0, 1]', () => {
    expect(computeCameraZ(-1, 10, 5)).toBe(10);
    expect(computeCameraZ(2, 10, 5)).toBe(15);
  });
});

describe('buildGearLayout', () => {
  it('returns the requested number of gears within the spec range', () => {
    const gears = buildGearLayout(5);
    expect(gears).toHaveLength(5);
    for (const gear of gears) {
      expect(gear.radius).toBeGreaterThan(0);
      expect(gear.ratio).toBeGreaterThan(0);
    }
  });

  it('cycles ratios through 1:2:3', () => {
    const gears = buildGearLayout(5);
    expect(gears.map((g) => g.ratio)).toEqual([1, 2, 3, 1, 2]);
  });
});

describe('buildNeuralNodes', () => {
  it('is deterministic for a given seed', () => {
    const gears = buildGearLayout(3);
    const a = buildNeuralNodes(gears, 10, 42);
    const b = buildNeuralNodes(gears, 10, 42);
    expect(a).toEqual(b);
  });

  it('produces nodesPerGear * gears.length nodes', () => {
    const gears = buildGearLayout(3);
    const nodes = buildNeuralNodes(gears, 10, 42);
    expect(nodes).toHaveLength(30);
  });

  it('produces different output for a different seed', () => {
    const gears = buildGearLayout(3);
    const a = buildNeuralNodes(gears, 10, 1);
    const b = buildNeuralNodes(gears, 10, 2);
    expect(a).not.toEqual(b);
  });
});

describe('buildNeuralEdges', () => {
  it('only connects nodes within maxDistance', () => {
    const nodes = [{ position: [0, 0, 0] as [number, number, number] }, { position: [100, 100, 100] as [number, number, number] }];
    const edges = buildNeuralEdges(nodes, 1);
    expect(edges).toHaveLength(0);
  });

  it('connects nearby nodes', () => {
    const nodes = [{ position: [0, 0, 0] as [number, number, number] }, { position: [0.1, 0, 0] as [number, number, number] }];
    const edges = buildNeuralEdges(nodes, 1);
    expect(edges.length).toBeGreaterThan(0);
  });
});
