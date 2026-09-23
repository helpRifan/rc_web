import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  buildGearLayout,
  buildNeuralEdges,
  buildNeuralNodes,
  computeCameraZ,
  computeGearRotation,
  computeParallaxOffset,
} from './kinematics';

const GEAR_COUNT = 5;
const NODES_PER_GEAR = 100;
const NODE_SEED = 42;
const MAX_EDGE_DISTANCE = 0.3;
const BASE_ROTATION_SPEED = 0.25;
const PARALLAX_STRENGTH = 0.15;
const BASE_CAMERA_Z = 6;
const CAMERA_PULLBACK = 2.5;
const GEAR_TEETH = 10;

// Builds a 2D gear-tooth silhouette (with a center bore hole) around the origin, ready to be
// extruded into 3D. Alternates full-radius tooth tips with inner-radius roots around the rim so
// the outline actually reads as a gear rather than a smooth ring.
function createGearShape(radius: number, teeth: number, toothDepth: number): THREE.Shape {
  const shape = new THREE.Shape();
  const angleStep = (Math.PI * 2) / teeth;
  const innerRadius = radius - toothDepth;

  for (let i = 0; i < teeth; i++) {
    const angle = i * angleStep;
    const a1 = angle;
    const a2 = angle + angleStep * 0.25;
    const a3 = angle + angleStep * 0.5;
    const a4 = angle + angleStep * 0.75;

    const x1 = Math.cos(a1) * radius, y1 = Math.sin(a1) * radius;
    const x2 = Math.cos(a2) * radius, y2 = Math.sin(a2) * radius;
    const x3 = Math.cos(a3) * innerRadius, y3 = Math.sin(a3) * innerRadius;
    const x4 = Math.cos(a4) * innerRadius, y4 = Math.sin(a4) * innerRadius;

    if (i === 0) {
      shape.moveTo(x1, y1);
    } else {
      shape.lineTo(x1, y1);
    }
    shape.lineTo(x2, y2);
    shape.lineTo(x3, y3);
    shape.lineTo(x4, y4);
  }
  shape.closePath();

  const hole = new THREE.Path();
  hole.absarc(0, 0, radius * 0.32, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  return shape;
}

function GearMesh({
  index,
  position,
  radius,
  ratio,
}: {
  index: number;
  position: [number, number, number];
  radius: number;
  ratio: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  // Neighbouring gears counter-rotate, as meshed gears do.
  const direction = index % 2 === 0 ? 1 : -1;

  // Real gear teeth make both "this is a gear" and "it's rotating" obvious at a glance, so the
  // low-segment-count torus hack (faceted ring standing in for teeth) is no longer needed.
  const geometry = useMemo(() => {
    const shape = createGearShape(radius, GEAR_TEETH, radius * 0.18);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: radius * 0.35,
      bevelEnabled: true,
      bevelThickness: radius * 0.03,
      bevelSize: radius * 0.03,
      bevelSegments: 2,
    });
    // ExtrudeGeometry from a shape built around (0,0) should already be centered; center() is a
    // cheap correctness safeguard in case bevel/hole geometry skews the bounds.
    geo.center();
    return geo;
  }, [radius]);

  // Unlike a JSX <torusGeometry> child, R3F's reconciler didn't construct this geometry, so it
  // won't auto-dispose it on unmount or when `radius` changes — dispose it ourselves.
  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.z =
      direction * computeGearRotation(ratio, clock.getElapsedTime(), BASE_ROTATION_SPEED);
  });

  return (
    <mesh ref={meshRef} position={position} geometry={geometry} data-gear>
      <meshStandardMaterial color="#BFC7CE" metalness={0.35} roughness={0.45} />
    </mesh>
  );
}

function NeuralOverlay({ gears }: { gears: ReturnType<typeof buildGearLayout> }) {
  const nodes = useMemo(() => buildNeuralNodes(gears, NODES_PER_GEAR, NODE_SEED), [gears]);
  const edges = useMemo(() => buildNeuralEdges(nodes, MAX_EDGE_DISTANCE), [nodes]);

  const pointsGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(nodes.length * 3);
    nodes.forEach((node, i) => {
      positions[i * 3] = node.position[0];
      positions[i * 3 + 1] = node.position[1];
      positions[i * 3 + 2] = node.position[2];
    });
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [nodes]);

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(edges.length * 2 * 3);
    edges.forEach((edge, i) => {
      const from = nodes[edge.fromIndex].position;
      const to = nodes[edge.toIndex].position;
      positions[i * 6] = from[0];
      positions[i * 6 + 1] = from[1];
      positions[i * 6 + 2] = from[2];
      positions[i * 6 + 3] = to[0];
      positions[i * 6 + 4] = to[1];
      positions[i * 6 + 5] = to[2];
    });
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [edges, nodes]);

  return (
    <group>
      <points geometry={pointsGeometry} data-neural-points>
        <pointsMaterial
          color="#619AC3"
          size={0.035}
          sizeAttenuation
          transparent
          opacity={0.85}
          depthTest={false}
        />
      </points>
      <lineSegments geometry={lineGeometry} data-neural-edges>
        <lineBasicMaterial color="#4A8DB7" transparent opacity={0.25} depthTest={false} />
      </lineSegments>
    </group>
  );
}

export function SceneContents() {
  const gears = useMemo(() => buildGearLayout(GEAR_COUNT), []);
  const groupRef = useRef<THREE.Group>(null);
  // `pointer` is R3F's global normalized pointer, updated from DOM pointer events on the canvas's
  // event source without any raycasting, so reading it here costs nothing per pointer move.
  const { camera, pointer } = useThree();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const progress = Math.min(window.scrollY / window.innerHeight, 1);
      setScrollProgress(progress);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const offset = computeParallaxOffset(pointer.x, pointer.y, PARALLAX_STRENGTH);
    groupRef.current.position.x = offset.x;
    groupRef.current.position.y = offset.y;
    camera.position.z = computeCameraZ(scrollProgress, BASE_CAMERA_Z, CAMERA_PULLBACK);
  });

  return (
    <group ref={groupRef}>
      {/* R3F v9 / three r155+ lights are physically based: point lights decay with distance², so at
          these ~5–8 unit distances the old intensities contributed almost nothing and the gears
          rendered near-black. decay={0} keeps the intensities meaningful without an env map. */}
      <ambientLight intensity={0.8} />
      <pointLight position={[3, 3, 4]} intensity={2.5} decay={0} color="#E5E8EB" />
      <pointLight position={[-3, -2, 2]} intensity={1} decay={0} color="#4A8DB7" />

      {gears.map((gear, i) => (
        <GearMesh key={i} index={i} position={gear.position} radius={gear.radius} ratio={gear.ratio} />
      ))}

      <NeuralOverlay gears={gears} />
    </group>
  );
}

export default function KinematicScene({ onReady }: { onReady?: () => void }) {
  return (
    <Canvas
      camera={{ position: [0, 0, BASE_CAMERA_Z], fov: 45 }}
      gl={{ antialias: true, alpha: false }}
      // Fires once a real WebGL renderer exists — not merely when this chunk has loaded.
      onCreated={() => onReady?.()}
    >
      {/* Must be a direct child of the scene: `attach="background"` sets it on the parent object,
          so nested inside a <group> it would set group.background and have no effect. */}
      <color attach="background" args={['#0D0D0D']} />
      <SceneContents />
    </Canvas>
  );
}
