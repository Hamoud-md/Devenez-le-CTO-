import type { MotionId } from '../types';

/**
 * Poses procédurales — squelette humanoïde.
 * Chaque pose décrit les rotations (radians) des articulations et
 * la position de la racine. Les poses sont interpolées linéairement
 * sur la timeline du mouvement (Phase A : contrôle temporel complet).
 */

export interface JointPose {
  /** [rx, ry, rz] */
  rootPos?: [number, number, number];
  rootRot?: [number, number, number];
  spine?: [number, number, number];
  head?: [number, number, number];
  hipL?: [number, number, number];
  hipR?: [number, number, number];
  kneeL?: [number, number, number];
  kneeR?: [number, number, number];
  ankleL?: [number, number, number];
  ankleR?: [number, number, number];
  shoulderL?: [number, number, number];
  shoulderR?: [number, number, number];
  elbowL?: [number, number, number];
  elbowR?: [number, number, number];
}

export interface PoseKeyframe {
  time: number;
  pose: JointPose;
}

const D = Math.PI / 180;

/* ---------------- Squat ---------------- */

const SQUAT: PoseKeyframe[] = [
  {
    time: 0,
    pose: {
      rootPos: [0, 0, 0],
      spine: [0, 0, 0],
      shoulderL: [-12 * D, 0, 8 * D],
      shoulderR: [-12 * D, 0, -8 * D],
      elbowL: [-10 * D, 0, 0],
      elbowR: [-10 * D, 0, 0],
    },
  },
  {
    time: 1,
    pose: {
      rootPos: [0, -0.08, -0.04],
      spine: [-18 * D, 0, 0],
      hipL: [28 * D, 0, 3 * D],
      hipR: [28 * D, 0, -3 * D],
      kneeL: [-40 * D, 0, 0],
      kneeR: [-40 * D, 0, 0],
      shoulderL: [-70 * D, 0, 6 * D],
      shoulderR: [-70 * D, 0, -6 * D],
      elbowL: [-12 * D, 0, 0],
      elbowR: [-12 * D, 0, 0],
    },
  },
  {
    time: 2,
    pose: {
      rootPos: [0, -0.4, -0.14],
      spine: [-24 * D, 0, 0],
      hipL: [72 * D, 0, 4 * D],
      hipR: [72 * D, 0, -4 * D],
      kneeL: [-85 * D, 0, 0],
      kneeR: [-85 * D, 0, 0],
      ankleL: [12 * D, 0, 0],
      ankleR: [12 * D, 0, 0],
      shoulderL: [-85 * D, 0, 5 * D],
      shoulderR: [-85 * D, 0, -5 * D],
      elbowL: [-8 * D, 0, 0],
      elbowR: [-8 * D, 0, 0],
      head: [18 * D, 0, 0],
    },
  },
  {
    time: 3,
    pose: {
      rootPos: [0, -0.08, -0.04],
      spine: [-18 * D, 0, 0],
      hipL: [28 * D, 0, 3 * D],
      hipR: [28 * D, 0, -3 * D],
      kneeL: [-40 * D, 0, 0],
      kneeR: [-40 * D, 0, 0],
      shoulderL: [-70 * D, 0, 6 * D],
      shoulderR: [-70 * D, 0, -6 * D],
    },
  },
  {
    time: 4,
    pose: {
      rootPos: [0, 0, 0],
      spine: [-4 * D, 0, 0],
      shoulderL: [-20 * D, 0, 8 * D],
      shoulderR: [-20 * D, 0, -8 * D],
    },
  },
  {
    time: 5,
    pose: {
      rootPos: [0, 0, 0],
      spine: [0, 0, 0],
      shoulderL: [-12 * D, 0, 8 * D],
      shoulderR: [-12 * D, 0, -8 * D],
      elbowL: [-10 * D, 0, 0],
      elbowR: [-10 * D, 0, 0],
    },
  },
];

/* ---------------- Pompes (vue de profil, corps horizontal) ---------------- */

const POMPES: PoseKeyframe[] = [
  {
    time: 0,
    pose: {
      rootPos: [0, -0.55, -0.7],
      rootRot: [78 * D, 0, 0],
      spine: [0, 0, 0],
      shoulderL: [-95 * D, 0, 12 * D],
      shoulderR: [-95 * D, 0, -12 * D],
      elbowL: [0, 0, 0],
      elbowR: [0, 0, 0],
      hipL: [0, 0, 0],
      hipR: [0, 0, 0],
      ankleL: [-30 * D, 0, 0],
      ankleR: [-30 * D, 0, 0],
      head: [10 * D, 0, 0],
    },
  },
  {
    time: 1,
    pose: {
      rootPos: [0, -0.66, -0.7],
      rootRot: [78 * D, 0, 0],
      spine: [0, 0, 0],
      shoulderL: [-75 * D, 0, 18 * D],
      shoulderR: [-75 * D, 0, -18 * D],
      elbowL: [-65 * D, 0, 0],
      elbowR: [-65 * D, 0, 0],
      hipL: [0, 0, 0],
      hipR: [0, 0, 0],
      ankleL: [-30 * D, 0, 0],
      ankleR: [-30 * D, 0, 0],
      head: [10 * D, 0, 0],
    },
  },
  {
    time: 2,
    pose: {
      rootPos: [0, -0.76, -0.7],
      rootRot: [78 * D, 0, 0],
      spine: [0, 0, 0],
      shoulderL: [-58 * D, 0, 24 * D],
      shoulderR: [-58 * D, 0, -24 * D],
      elbowL: [-105 * D, 0, 0],
      elbowR: [-105 * D, 0, 0],
      hipL: [0, 0, 0],
      hipR: [0, 0, 0],
      ankleL: [-30 * D, 0, 0],
      ankleR: [-30 * D, 0, 0],
      head: [14 * D, 0, 0],
    },
  },
  {
    time: 3,
    pose: {
      rootPos: [0, -0.66, -0.7],
      rootRot: [78 * D, 0, 0],
      shoulderL: [-75 * D, 0, 18 * D],
      shoulderR: [-75 * D, 0, -18 * D],
      elbowL: [-65 * D, 0, 0],
      elbowR: [-65 * D, 0, 0],
      ankleL: [-30 * D, 0, 0],
      ankleR: [-30 * D, 0, 0],
      head: [10 * D, 0, 0],
    },
  },
  {
    time: 4,
    pose: {
      rootPos: [0, -0.55, -0.7],
      rootRot: [78 * D, 0, 0],
      shoulderL: [-95 * D, 0, 12 * D],
      shoulderR: [-95 * D, 0, -12 * D],
      elbowL: [0, 0, 0],
      elbowR: [0, 0, 0],
      ankleL: [-30 * D, 0, 0],
      ankleR: [-30 * D, 0, 0],
      head: [10 * D, 0, 0],
    },
  },
  {
    time: 5,
    pose: {
      rootPos: [0, -0.55, -0.7],
      rootRot: [78 * D, 0, 0],
      shoulderL: [-95 * D, 0, 12 * D],
      shoulderR: [-95 * D, 0, -12 * D],
      elbowL: [0, 0, 0],
      elbowR: [0, 0, 0],
      ankleL: [-30 * D, 0, 0],
      ankleR: [-30 * D, 0, 0],
      head: [10 * D, 0, 0],
    },
  },
];

/* ---------------- Tadasana (statique, micro-ajustements) ---------------- */

const YOGA: PoseKeyframe[] = [
  {
    time: 0,
    pose: {
      rootPos: [0, 0, 0],
      spine: [2 * D, 0, 0],
      shoulderL: [4 * D, 0, 10 * D],
      shoulderR: [4 * D, 0, -10 * D],
      head: [0, 0, 0],
    },
  },
  {
    time: 1.5,
    pose: {
      rootPos: [0, 0.01, 0],
      spine: [0, 0, 0],
      shoulderL: [2 * D, 0, 12 * D],
      shoulderR: [2 * D, 0, -12 * D],
      head: [-2 * D, 0, 0],
    },
  },
  {
    time: 3,
    pose: {
      rootPos: [0, 0.015, 0],
      spine: [0, 0, 0],
      hipL: [0, 0, 1 * D],
      hipR: [0, 0, -1 * D],
      shoulderL: [2 * D, 0, 12 * D],
      shoulderR: [2 * D, 0, -12 * D],
      head: [-2 * D, 0, 0],
    },
  },
  {
    time: 4,
    pose: {
      rootPos: [0, 0.01, 0],
      spine: [0, 0, 0],
      shoulderL: [2 * D, 0, 12 * D],
      shoulderR: [2 * D, 0, -12 * D],
      head: [-2 * D, 0, 0],
    },
  },
  {
    time: 5,
    pose: {
      rootPos: [0, 0, 0],
      spine: [2 * D, 0, 0],
      shoulderL: [4 * D, 0, 10 * D],
      shoulderR: [4 * D, 0, -10 * D],
      head: [0, 0, 0],
    },
  },
];

const KEYFRAMES: Record<MotionId, PoseKeyframe[]> = {
  squat: SQUAT,
  pompes: POMPES,
  yoga: YOGA,
};

export function getKeyframes(motion: MotionId): PoseKeyframe[] {
  return KEYFRAMES[motion];
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpTriple(
  a: [number, number, number] | undefined,
  b: [number, number, number] | undefined,
  t: number,
  fallback: [number, number, number] = [0, 0, 0],
): [number, number, number] {
  const from = a ?? fallback;
  const to = b ?? fallback;
  return [lerp(from[0], to[0], t), lerp(from[1], to[1], t), lerp(from[2], to[2], t)];
}

const JOINT_KEYS = [
  'spine',
  'head',
  'hipL',
  'hipR',
  'kneeL',
  'kneeR',
  'ankleL',
  'ankleR',
  'shoulderL',
  'shoulderR',
  'elbowL',
  'elbowR',
] as const;

type JointKey = (typeof JOINT_KEYS)[number];

export interface ResolvedPose {
  rootPos: [number, number, number];
  rootRot: [number, number, number];
  joints: Record<JointKey, [number, number, number]>;
}

/**
 * Interpole la pose à un instant donné (en secondes) sur la timeline.
 * Contrôle temporel continu — base du Motion Scrubber.
 */
export function getPoseAt(motion: MotionId, time: number): ResolvedPose {
  const frames = KEYFRAMES[motion];
  const t = Math.max(0, Math.min(frames[frames.length - 1].time, time));

  let i = 0;
  while (i < frames.length - 2 && frames[i + 1].time < t) i += 1;

  const a = frames[i];
  const b = frames[i + 1];
  const span = b.time - a.time || 1;
  const f = (t - a.time) / span;

  const joints = {} as Record<JointKey, [number, number, number]>;
  for (const key of JOINT_KEYS) {
    joints[key] = lerpTriple(a.pose[key], b.pose[key], f);
  }

  return {
    rootPos: lerpTriple(a.pose.rootPos, b.pose.rootPos, f),
    rootRot: lerpTriple(a.pose.rootRot, b.pose.rootRot, f),
    joints,
  };
}
