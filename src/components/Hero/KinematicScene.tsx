import { useMemo, useRef, useState } from 'react';
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
const MAX_EDGE_DISTANCE = 0.9;
const BASE_ROTATION_SPEED = 0.25;
const PARALLAX_STRENGTH = 0.15;
const BASE_CAMERA_Z = 6;
const CAMERA_PULLBACK = 2.5;

function GearMesh({
  position,
  radius,
  ratio,
}: {
  position: [number, number, number];
  radius: number;
  ratio: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.z = computeGearRotation(ratio, clock.getElapsedTime(), BASE_ROTATION_SPEED);
  });

  return (
    <mesh ref={meshRef} position={position} data-gear>
      <torusGeometry args={[radius, radius * 0.22, 12, 24]} />
      <meshStandardMaterial color="#BFC7CE" metalness={0.75} roughness={0.32} />
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
        <pointsMaterial color="#619AC3" size={0.035} sizeAttenuation transparent opacity={0.85} />
      </points>
      <lineSegments geometry={lineGeometry} data-neural-edges>
        <lineBasicMaterial color="#4A8DB7" transparent opacity={0.25} />
      </lineSegments>
    </group>
  );
}

export function SceneContents() {
  const gears = useMemo(() => buildGearLayout(GEAR_COUNT), []);
  const pointer = useRef({ x: 0, y: 0 });
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const [scrollProgress, setScrollProgress] = useState(0);

  useFrame(() => {
    if (!groupRef.current) return;
    const offset = computeParallaxOffset(pointer.current.x, pointer.current.y, PARALLAX_STRENGTH);
    groupRef.current.position.x = offset.x;
    groupRef.current.position.y = offset.y;
    camera.position.z = computeCameraZ(scrollProgress, BASE_CAMERA_Z, CAMERA_PULLBACK);
  });

  return (
    <group
      ref={groupRef}
      onPointerMove={(e) => {
        pointer.current = { x: e.pointer.x, y: e.pointer.y };
      }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 3, 4]} intensity={1.2} color="#E5E8EB" />
      <pointLight position={[-3, -2, 2]} intensity={0.6} color="#4A8DB7" />

      {gears.map((gear, i) => (
        <GearMesh key={i} position={gear.position} radius={gear.radius} ratio={gear.ratio} />
      ))}

      <NeuralOverlay gears={gears} />
    </group>
  );
}

export default function KinematicScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, BASE_CAMERA_Z], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <SceneContents />
    </Canvas>
  );
}
