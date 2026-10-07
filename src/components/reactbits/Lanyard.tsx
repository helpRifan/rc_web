'use client';
// Lanyard, from React Bits (https://reactbits.dev, MIT + Commons Clause; see THIRD_PARTY_NOTICES.md).
// Forked for the Team board (team brief 5.3):
// - N badges on one canvas: one WebGL context, one environment bake and one physics world;
// - every face is printed by the page (an atlas canvas per badge), and the strap is drawn in code;
// - a click without a drag opens that badge, keyboard focus nudges it, and a badge can rest on its back;
// - the loop stops off-screen, and drops to on-demand rendering once nobody has touched the stage for 8s;
// - each band collides only with itself, and odd badges hang 0.3 units further back.
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Canvas, extend, useFrame, useThree, type ThreeElement, type ThreeEvent } from '@react-three/fiber';
import { useGLTF, Environment, Lightformer } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  interactionGroups,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
  type RigidBodyProps
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

// card.glb without its demo texture (scripts/slim-card-glb.mjs); loaded by URL, no Draco.
const CARD_GLB = '/models/card.glb';
// One stable constructor-args array, so R3F never rebuilds the material between renders.
const MESHLINE_MATERIAL_ARGS: ConstructorParameters<typeof MeshLineMaterial> = [{ resolution: new THREE.Vector2(1000, 1000) }];
// Nobody has moved a pointer over the stage for this long: render on demand until they do.
const IDLE_MS = 8000;

extend({ MeshLineGeometry, MeshLineMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial>;
  }
}

export interface LanyardBadge {
  key: string;
  /** World position of the strap's fixed end, above the stage top. */
  anchor: [number, number, number];
  /** Swings in from the right (1) or the left (-1). */
  startSide: 1 | -1;
}

export interface LanyardProps {
  badges: LanyardBadge[];
  /** Each badge's two faces, printed on one canvas (badge-art.ts composeAtlas), in badge order. */
  atlases: HTMLCanvasElement[];
  cameraZ: number;
  fov?: number;
  gravity?: [number, number, number];
  ropeLength?: number;
  /** The strap print (badge-art.ts drawStrapCanvas). */
  strap: HTMLCanvasElement;
  lanyardWidth?: number;
  /** How many strap tiles run along each strap. */
  strapRepeat?: number;
  /** false: no frames and no physics (off-screen, hidden tab). */
  active: boolean;
  /** Touch: lower DPR, no clearcoat, fewer strap points. */
  coarse: boolean;
  /** The element R3F listens on, so the page's text and links stay clickable over the canvas. */
  eventSource: RefObject<HTMLElement | null>;
  /** A click or tap without a drag. */
  onOpen?: (key: string) => void;
  /** The pointer came over a badge (for prefetching its page). */
  onHover?: (key: string) => void;
  /** 0 rests on the front, Math.PI on the back. */
  restYaw?: Record<string, number>;
  /** A keyboard nudge for one badge; `at` changes on every nudge. */
  nudge?: { key: string; at: number } | null;
  /** A slow idle sway (the profile page's single badge). */
  sway?: boolean;
  /** Changes when the layout's rope length or breakpoint changes, to rebuild the joints. */
  layoutKey?: string;
  onReady?: () => void;
  onFail?: () => void;
}

export default function Lanyard({
  badges,
  atlases,
  cameraZ,
  fov = 20,
  gravity = [0, -40, 0],
  ropeLength = 1,
  strap,
  lanyardWidth = 1,
  strapRepeat = 2,
  active,
  coarse,
  eventSource,
  onOpen,
  onHover,
  restYaw,
  nudge,
  sway = false,
  layoutKey = '',
  onReady,
  onFail
}: LanyardProps) {
  const [awake, setAwake] = useState(true);
  const idleTimer = useRef<number | undefined>(undefined);
  const wake = useCallback(() => {
    setAwake(true);
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setAwake(false), IDLE_MS);
  }, []);

  // Any pointer activity over the stage (or a nudge) keeps the loop running; 8s without, it rests.
  useEffect(() => {
    const el = eventSource.current;
    if (!el) return;
    idleTimer.current = window.setTimeout(() => setAwake(false), IDLE_MS);
    el.addEventListener('pointermove', wake);
    el.addEventListener('pointerdown', wake);
    return () => {
      el.removeEventListener('pointermove', wake);
      el.removeEventListener('pointerdown', wake);
      window.clearTimeout(idleTimer.current);
    };
  }, [eventSource, wake]);
  useEffect(() => {
    if (!nudge) return;
    const frame = requestAnimationFrame(wake);
    return () => cancelAnimationFrame(frame);
  }, [nudge, wake]);

  const strapTexture = useMemo(() => {
    const texture = new THREE.CanvasTexture(strap);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return texture;
  }, [strap]);
  // One texture per atlas, kept across layout changes: a resize re-hangs the badges, it doesn't
  // reprint them.
  const maps = useMemo(
    () =>
      atlases.map(atlas => {
        const texture = new THREE.CanvasTexture(atlas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.flipY = false;
        texture.anisotropy = 16;
        return texture;
      }),
    [atlases]
  );
  useEffect(() => () => strapTexture.dispose(), [strapTexture]);
  useEffect(() => () => maps.forEach(map => map.dispose()), [maps]);

  const running = active && (awake || sway);

  return (
    <Canvas
      camera={{ position: [0, 0, cameraZ], fov }}
      dpr={[1, coarse ? 1.5 : 2]}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      frameloop={!active ? 'never' : running ? 'always' : 'demand'}
      eventSource={eventSource as RefObject<HTMLElement>}
      eventPrefix="client"
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color(0x0d0d0d), 0);
        gl.domElement.addEventListener('webglcontextlost', () => onFail?.(), { once: true });
      }}
    >
      <CameraRig z={cameraZ} />
      <ambientLight intensity={Math.PI} />
      <Suspense fallback={null}>
        <Physics key={layoutKey} gravity={gravity} timeStep={1 / 60} paused={!running}>
          {badges.map((badge, index) => (
            <Band
              key={badge.key}
              index={index}
              badge={badge}
              map={maps[index]}
              strapTexture={strapTexture}
              ropeLength={ropeLength}
              lanyardWidth={lanyardWidth}
              strapRepeat={strapRepeat}
              coarse={coarse}
              restYaw={restYaw?.[badge.key] ?? 0}
              nudgeAt={nudge?.key === badge.key ? nudge.at : 0}
              sway={sway}
              onOpen={onOpen}
              onHover={onHover}
            />
          ))}
        </Physics>
        <FirstFrame onReady={onReady} />
      </Suspense>
      <Environment blur={0.75}>
        <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
      </Environment>
    </Canvas>
  );
}

/** Keeps the camera at the distance that frames the stage exactly (stage-layout.ts). */
function CameraRig({ z }: { z: number }) {
  const get = useThree(state => state.get);
  useEffect(() => {
    const { camera, invalidate } = get();
    camera.position.z = z;
    camera.updateProjectionMatrix();
    invalidate();
  }, [get, z]);
  return null;
}

/** Calls onReady after the first frame with the badges in it has been drawn. */
function FirstFrame({ onReady }: { onReady?: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    requestAnimationFrame(() => onReady?.());
  });
  return null;
}

type LanyardRigidBody = RapierRigidBody & { lerped?: THREE.Vector3 };

interface BandProps {
  index: number;
  badge: LanyardBadge;
  map: THREE.Texture;
  strapTexture: THREE.Texture;
  ropeLength: number;
  lanyardWidth: number;
  strapRepeat: number;
  coarse: boolean;
  restYaw: number;
  nudgeAt: number;
  sway: boolean;
  onOpen?: (key: string) => void;
  onHover?: (key: string) => void;
  maxSpeed?: number;
  minSpeed?: number;
}

function Band({
  index,
  badge,
  map,
  strapTexture,
  ropeLength,
  lanyardWidth,
  strapRepeat,
  coarse,
  restYaw,
  nudgeAt,
  sway,
  onOpen,
  onHover,
  maxSpeed = 50,
  minSpeed = 0
}: BandProps) {
  const band = useRef<THREE.Mesh<InstanceType<typeof MeshLineGeometry>, InstanceType<typeof MeshLineMaterial>>>(null!);
  const fixed = useRef<RapierRigidBody>(null!);
  const j1 = useRef<LanyardRigidBody>(null!);
  const j2 = useRef<LanyardRigidBody>(null!);
  const j3 = useRef<RapierRigidBody>(null!);
  const card = useRef<RapierRigidBody>(null!);
  const down = useRef<{ x: number; y: number; t: number } | null>(null);

  const [scratch] = useState(() => ({
    vec: new THREE.Vector3(),
    ang: new THREE.Vector3(),
    dir: new THREE.Vector3(),
    q: new THREE.Quaternion(),
    euler: new THREE.Euler()
  }));

  const groups = interactionGroups(index % 16, [index % 16]);
  // Heavier damping for the entrance, so the badge arrives and settles in about 600ms.
  const segmentProps: RigidBodyProps = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 7,
    linearDamping: 7
  };

  const getLerped = (body: LanyardRigidBody): THREE.Vector3 => {
    if (!body.lerped) body.lerped = new THREE.Vector3().copy(body.translation());
    return body.lerped;
  };

  // any: the registry's GLTF nodes are untyped.
  const { nodes, materials } = useGLTF(CARD_GLB, false, false) as any;
  const [curve] = useState(() => {
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]);
    c.curveType = 'chordal';
    return c;
  });
  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], ropeLength]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], ropeLength]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], ropeLength]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.45, 0]
  ]);

  // After the entrance, back to React Bits' livelier damping.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      for (const body of [j1, j2, j3, card]) {
        body.current?.setLinearDamping(4);
        body.current?.setAngularDamping(4);
      }
    }, 700);
    return () => window.clearTimeout(timer);
  }, []);

  // A keyboard nudge: a small sideways swing, so focus visibly lands on the badge too.
  useEffect(() => {
    if (!nudgeAt) return;
    for (const body of [j1, j2, j3, card]) body.current?.wakeUp();
    card.current?.applyImpulse({ x: 0.1 * badge.startSide, y: 0, z: 0 }, true);
  }, [nudgeAt, badge.startSide]);

  useEffect(() => {
    if (!hovered) return;
    document.body.style.cursor = dragged ? 'grabbing' : 'grab';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hovered, dragged]);
  useEffect(() => () => void (document.body.style.cursor = ''), []);

  useFrame((state, delta) => {
    const { vec, ang, dir, q, euler } = scratch;
    if (dragged && typeof dragged !== 'boolean') {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z
      });
    }
    if (!fixed.current || !card.current) return;
    [j1, j2].forEach(ref => {
      const lerped = getLerped(ref.current);
      const clampedDistance = Math.max(0.1, Math.min(1, lerped.distanceTo(ref.current.translation())));
      lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
    });
    curve.points[0].copy(j3.current.translation());
    curve.points[1].copy(getLerped(j2.current));
    curve.points[2].copy(getLerped(j1.current));
    curve.points[3].copy(fixed.current.translation());
    band.current.geometry.setPoints(curve.getPoints(coarse ? 16 : 32));

    // Twist back towards the chosen face. With restYaw 0 this is React Bits' `ang.y - rot.y * 0.25`.
    ang.copy(card.current.angvel());
    const r = card.current.rotation();
    q.set(r.x, r.y, r.z, r.w);
    euler.setFromQuaternion(q, 'YXZ');
    const error = Math.atan2(Math.sin(euler.y - restYaw), Math.cos(euler.y - restYaw));
    card.current.setAngvel({ x: ang.x, y: ang.y - Math.sin(error / 2) * 0.25, z: ang.z }, true);

    if (sway && !dragged) {
      // A slow push and pull, well below the pendulum's own rhythm, so it reads as air, not a motor.
      card.current.applyImpulse({ x: Math.sin(state.clock.elapsedTime * 0.8) * 0.0012, y: 0, z: 0 }, true);
    }
  });

  const side = badge.startSide;
  const [ax, ay, az] = badge.anchor;
  return (
    <>
      <group position={[ax, ay, az]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5 * side, 0, 0]} ref={j1} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} collisionGroups={groups} />
        </RigidBody>
        <RigidBody position={[1 * side, 0, 0]} ref={j2} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} collisionGroups={groups} />
        </RigidBody>
        <RigidBody position={[1.5 * side, 0, 0]} ref={j3} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} collisionGroups={groups} />
        </RigidBody>
        <RigidBody position={[2 * side, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} collisionGroups={groups} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => {
              hover(true);
              onHover?.(badge.key);
            }}
            onPointerOut={() => hover(false)}
            onPointerUp={(e: ThreeEvent<PointerEvent>) => {
              (e.target as Element).releasePointerCapture(e.pointerId);
              drag(false);
              const start = down.current;
              down.current = null;
              if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 6 && performance.now() - start.t < 350) onOpen?.(badge.key);
            }}
            onPointerDown={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              (e.target as Element).setPointerCapture(e.pointerId);
              down.current = { x: e.clientX, y: e.clientY, t: performance.now() };
              drag(new THREE.Vector3().copy(e.point).sub(scratch.vec.copy(card.current.translation())));
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={map}
                map-anisotropy={16}
                clearcoat={coarse ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          args={MESHLINE_MATERIAL_ARGS}
          color="white"
          depthTest={false}
          resolution={coarse ? [1000, 2000] : [1000, 1000]}
          useMap={1}
          map={strapTexture}
          repeat={[-strapRepeat, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  );
}
