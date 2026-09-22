export function computeGearRotation(ratio: number, elapsedSeconds: number, baseSpeedRadPerSec: number): number {
  return ratio * baseSpeedRadPerSec * elapsedSeconds;
}

export function computeParallaxOffset(
  pointerX: number,
  pointerY: number,
  strength: number,
): { x: number; y: number } {
  return { x: pointerX * strength, y: pointerY * strength };
}

export function computeCameraZ(scrollProgress: number, baseZ: number, pullbackDistance: number): number {
  const clamped = Math.max(0, Math.min(1, scrollProgress));
  return baseZ + clamped * pullbackDistance;
}

export interface GearSpec {
  position: [number, number, number];
  radius: number;
  ratio: number;
}

const RATIO_CYCLE = [1, 2, 3];

// Radii cycle on a period of 5, independent of RATIO_CYCLE's period of 3, so radius is never a
// function of the ratio. Values are ordered so that, in the default 5-gear layout (ratios
// [1, 2, 3, 1, 2]), larger gears get the slower ratios — as with real meshing gears — rather than
// the largest gear also spinning fastest.
const RADIUS_CYCLE = [0.9, 0.72, 0.6, 0.85, 0.7];

export function buildGearLayout(count: number): GearSpec[] {
  const gears: GearSpec[] = [];
  const spacing = 1.6;
  const startX = -((count - 1) * spacing) / 2;

  for (let i = 0; i < count; i++) {
    gears.push({
      position: [startX + i * spacing, i % 2 === 0 ? 0 : 0.4, -(i % 3) * 0.3],
      radius: RADIUS_CYCLE[i % RADIUS_CYCLE.length],
      ratio: RATIO_CYCLE[i % RATIO_CYCLE.length],
    });
  }

  return gears;
}

export interface NeuralNode {
  position: [number, number, number];
}

// Minimal deterministic PRNG (mulberry32) — no Math.random(), so node layout is reproducible in tests.
function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildNeuralNodes(gears: GearSpec[], nodesPerGear: number, seed: number): NeuralNode[] {
  const random = mulberry32(seed);
  const nodes: NeuralNode[] = [];

  for (const gear of gears) {
    for (let i = 0; i < nodesPerGear; i++) {
      const angle = random() * Math.PI * 2;
      const radiusJitter = gear.radius * (0.85 + random() * 0.3);
      nodes.push({
        position: [
          gear.position[0] + Math.cos(angle) * radiusJitter,
          gear.position[1] + Math.sin(angle) * radiusJitter,
          gear.position[2] + (random() - 0.5) * 0.2,
        ],
      });
    }
  }

  return nodes;
}

export interface NeuralEdge {
  fromIndex: number;
  toIndex: number;
}

function distance(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

export function buildNeuralEdges(nodes: NeuralNode[], maxDistance: number): NeuralEdge[] {
  const edges: NeuralEdge[] = [];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (distance(nodes[i].position, nodes[j].position) <= maxDistance) {
        edges.push({ fromIndex: i, toIndex: j });
      }
    }
  }

  return edges;
}
