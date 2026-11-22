import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import type { MotionId } from '../types';
import { getPoseAt } from './poses';

/**
 * Squelette procédural — Phase A.
 * Humanoïde stylisé construit en code (aucune ressource externe),
 * animé par interpolation de poses sur la timeline du mouvement.
 */

const SKIN = '#c8d6cf';
const SUIT = '#1a7a5a';
const SUIT_DARK = '#0e4a38';
const JOINT_COLOR = '#2ed573';

interface BoneProps {
  length: number;
  radius: number;
  color?: string;
}

/** Os : capsule pivotée à son extrémité supérieure (l'articulation). */
function Bone({ length, radius, color = SUIT }: BoneProps) {
  const capsuleLength = Math.max(0.01, length - radius * 2);
  return (
    <mesh position={[0, -length / 2, 0]} castShadow>
      <capsuleGeometry args={[radius, capsuleLength, 4, 12]} />
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.08} />
    </mesh>
  );
}

function JointBall({ r = 0.055 }: { r?: number }) {
  return (
    <mesh castShadow>
      <sphereGeometry args={[r, 14, 14]} />
      <meshStandardMaterial color={JOINT_COLOR} roughness={0.4} metalness={0.15} />
    </mesh>
  );
}

interface SkeletonFigureProps {
  motion: MotionId;
  /** Temps courant en secondes sur la timeline du mouvement */
  time: number;
  /** En lecture : avance le temps via rAF ; en pause : figé (scrubber) */
  playing: boolean;
  speed: number;
  duration: number;
  onTimeChange: (t: number) => void;
}

export function SkeletonFigure({
  motion,
  time,
  playing,
  speed,
  duration,
  onTimeChange,
}: SkeletonFigureProps) {
  const rootRef = useRef<Group>(null);
  const refs = {
    spine: useRef<Group>(null),
    head: useRef<Group>(null),
    hipL: useRef<Group>(null),
    hipR: useRef<Group>(null),
    kneeL: useRef<Group>(null),
    kneeR: useRef<Group>(null),
    ankleL: useRef<Group>(null),
    ankleR: useRef<Group>(null),
    shoulderL: useRef<Group>(null),
    shoulderR: useRef<Group>(null),
    elbowL: useRef<Group>(null),
    elbowR: useRef<Group>(null),
  };

  // Horloge de lecture : avance le temps seulement si playing
  const last = useRef<number | null>(null);
  useFrame((_, delta) => {
    if (!playing) {
      last.current = null;
      return;
    }
    if (last.current === null) last.current = 0;
    const step = Math.min(delta, 0.1) * speed;
    const next = time + step;
    onTimeChange(next >= duration ? 0 : next);
  });

  // Application de la pose interpolée
  const pose = useMemo(() => getPoseAt(motion, time), [motion, time]);

  // Applique rotations + position via refs (sans re-render)
  const apply = () => {
    if (rootRef.current) {
      rootRef.current.position.set(...pose.rootPos);
      rootRef.current.rotation.set(...pose.rootRot);
    }
    (Object.keys(refs) as (keyof typeof refs)[]).forEach((key) => {
      const g = refs[key].current;
      if (!g) return;
      const rot = pose.joints[key];
      g.rotation.set(rot[0], rot[1], rot[2]);
    });
  };
  apply();

  return (
    <group ref={rootRef}>
      {/* Bassin */}
      <mesh castShadow position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.14, 18, 18]} />
        <meshStandardMaterial color={SUIT_DARK} roughness={0.5} />
      </mesh>

      {/* Tronc */}
      <group ref={refs.spine} position={[0, 0.98, 0]}>
        <Bone length={0.42} radius={0.115} color={SUIT} />
        {/* Cage thoracique */}
        <mesh position={[0, -0.1, 0.02]} castShadow>
          <capsuleGeometry args={[0.135, 0.2, 4, 14]} />
          <meshStandardMaterial color={SUIT} roughness={0.5} />
        </mesh>

        {/* Tête */}
        <group ref={refs.head} position={[0, 0.1, 0]}>
          <JointBall r={0.06} />
          <mesh position={[0, 0.16, 0]} castShadow>
            <sphereGeometry args={[0.13, 18, 18]} />
            <meshStandardMaterial color={SKIN} roughness={0.6} />
          </mesh>
          {/* Visage : repère directionnel */}
          <mesh position={[0, 0.16, 0.11]}>
            <sphereGeometry args={[0.035, 10, 10]} />
            <meshStandardMaterial color="#0a1628" roughness={0.4} />
          </mesh>
        </group>

        {/* Épaules */}
        <group ref={refs.shoulderL} position={[0.17, -0.02, 0]}>
          <JointBall r={0.06} />
          <Bone length={0.3} radius={0.055} color={SUIT} />
          <group ref={refs.elbowL} position={[0, -0.3, 0]}>
            <JointBall r={0.05} />
            <Bone length={0.28} radius={0.045} color={SKIN} />
            <mesh position={[0, -0.31, 0]} castShadow>
              <sphereGeometry args={[0.055, 12, 12]} />
              <meshStandardMaterial color={SKIN} roughness={0.6} />
            </mesh>
          </group>
        </group>

        <group ref={refs.shoulderR} position={[-0.17, -0.02, 0]}>
          <JointBall r={0.06} />
          <Bone length={0.3} radius={0.055} color={SUIT} />
          <group ref={refs.elbowR} position={[0, -0.3, 0]}>
            <JointBall r={0.05} />
            <Bone length={0.28} radius={0.045} color={SKIN} />
            <mesh position={[0, -0.31, 0]} castShadow>
              <sphereGeometry args={[0.055, 12, 12]} />
              <meshStandardMaterial color={SKIN} roughness={0.6} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Jambes */}
      {(['L', 'R'] as const).map((side) => (
        <group
          key={side}
          ref={side === 'L' ? refs.hipL : refs.hipR}
          position={[side === 'L' ? 0.1 : -0.1, 0.9, 0]}
        >
          <JointBall r={0.065} />
          <Bone length={0.45} radius={0.075} color={SUIT_DARK} />
          <group ref={side === 'L' ? refs.kneeL : refs.kneeR} position={[0, -0.45, 0]}>
            <JointBall r={0.06} />
            <Bone length={0.43} radius={0.06} color={SUIT} />
            <group ref={side === 'L' ? refs.ankleL : refs.ankleR} position={[0, -0.43, 0]}>
              <JointBall r={0.048} />
              {/* Pied */}
              <mesh position={[0, -0.03, 0.09]} castShadow>
                <boxGeometry args={[0.1, 0.06, 0.24]} />
                <meshStandardMaterial color="#f2f5f3" roughness={0.7} />
              </mesh>
            </group>
          </group>
        </group>
      ))}
    </group>
  );
}
