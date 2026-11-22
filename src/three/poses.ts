import { Quaternion, Vector3, Euler } from 'three';
import type { MotionId } from '../types';
import {
  DESIGN_RIG,
  D,
  arcQuat,
  clamp,
  getLandmarks,
  layoutFromParams,
  lerp,
  lookQuat,
  seg,
  solveLayout,
  solveTwoBone,
  type BoneId,
  type BoneTarget,
  type PosePlan,
  type RigLayout,
  type SolvedRig,
} from './rig';

/**
 * Plans de mouvement paramétriques.
 *
 * Chaque exercice décrit la cible de la racine (bassin), les directions
 * d’os et les orientations complètes (pieds, mains, tête) en fonction du
 * temps. Les appuis (pieds / mains) sont plantés au sol pendant toute la
 * séquence : la synchronisation avec les phases est structurelle — les
 * bornes des phases coïncident avec les ancrages du plan (0-1-2-3-4-5 s).
 */

export type JointPose = Partial<
  Record<
    | 'spine'
    | 'head'
    | 'hipL'
    | 'hipR'
    | 'kneeL'
    | 'kneeR'
    | 'ankleL'
    | 'ankleR'
    | 'shoulderL'
    | 'shoulderR'
    | 'elbowL'
    | 'elbowR',
    [number, number, number]
  >
>;

export interface PoseKeyframe {
  time: number;
  pose: JointPose;
}

export interface ResolvedPose {
  rootPos: [number, number, number];
  rootRot: [number, number, number];
  joints: Record<string, [number, number, number]>;
}

const DOWN = new Vector3(0, -1, 0);

/* ---------------- Courbes de mouvement ---------------- */

/** Profondeur du squat : 0 debout → 1 position basse. */
function squatDepth(t: number): number {
  if (t < 1) return 0;
  if (t < 2) return seg(t, 1, 2);
  if (t < 3) return 1;
  if (t < 4) return 1 - seg(t, 3, 4);
  return 0;
}

/** Élévation des bras (contrepoids) : pendus → tendus devant → pendus. */
function squatArmLift(t: number): number {
  const up = seg(t, 0.15, 0.95);
  const down = seg(t, 3.6, 4.6);
  return up * (1 - down);
}

/** Angle du corps pour les pompes : planche haute → position basse. */
function pushupAngle(t: number): number {
  const plank = 18 * D;
  const bottom = 4.5 * D;
  if (t < 1) return plank;
  if (t < 2) return lerp(plank, bottom, seg(t, 1, 2));
  if (t < 3) return bottom;
  if (t < 4) return lerp(bottom, plank, seg(t, 3, 4));
  return plank;
}

/* ---------------- Passes intermédiaires ---------------- */

function partialSolve(
  layout: RigLayout,
  rootPos: Vector3,
  rootQuat: Quaternion,
  targets: Partial<Record<BoneId, BoneTarget>>,
): SolvedRig {
  return solveLayout(layout, { rootPos, rootQuat, targets });
}

/**
 * Delta monde pour une orientation complète (pieds, mains, tête).
 * `desiredWorld` est l’orientation monde absolue visée ; le delta est
 * recalculé par rapport au repos relatif du parent résolu.
 */
function worldDelta(
  rig: SolvedRig,
  layout: RigLayout,
  bone: BoneId,
  desiredWorld: Quaternion,
): Quaternion {
  const node = layout.bones[bone];
  const parentQuat = node.parent ? rig.world[node.parent].quat : new Quaternion();
  const restLocal = new Quaternion(...node.restQuat);
  const parentRestWorld = parentQuat.clone().multiply(restLocal);
  return desiredWorld.clone().multiply(parentRestWorld.clone().invert());
}

/* ---------------- Squat ---------------- */

function planSquat(layout: RigLayout, t: number): PosePlan {
  const p = layout.params;
  const depth = squatDepth(t);
  const lift = squatArmLift(t);
  const breath = 0.004 * Math.sin(t * 2.4);

  const rootY = lerp(p.pelvisY, p.pelvisY - 0.4, depth) + breath;
  const rootZ = lerp(0, -0.3, depth);
  const rootPitch = lerp(0, 7 * D, depth);
  const rootPos = new Vector3(0, rootY, rootZ);
  const rootQuat = new Quaternion().setFromEuler(new Euler(rootPitch, 0, 0, 'XYZ'));

  // Inclinaison du tronc : hanchage contrôlé, colonne neutre
  const lean = lerp(0, 32 * D, depth);
  const spineDir = new Vector3(0, Math.cos(lean), Math.sin(lean));

  // Pass 1 : positions de hanches / épaules (indépendantes des membres)
  const pass1 = partialSolve(layout, rootPos, rootQuat, { spine: { dir: spineDir } });
  const targets: Partial<Record<BoneId, BoneTarget>> = { spine: { dir: spineDir } };

  // Jambes : appuis plantés + IK 2 os (genoux vers l’avant, légèrement ouverts)
  for (const side of ['L', 'R'] as const) {
    const hip = pass1.world[`hip${side}`].pos;
    const ankleTarget = new Vector3(
      side === 'L' ? p.stanceHalf : -p.stanceHalf,
      p.ankleHeight,
      0,
    );
    const pole = new Vector3(side === 'L' ? 0.18 : -0.18, 0.3, 1);
    const leg = solveTwoBone(hip, ankleTarget, p.thigh, p.shin, pole);
    targets[`hip${side}`] = { dir: leg.dir1 };
    targets[`knee${side}`] = { dir: leg.dir2 };
  }

  // Bras : élévation en contrepoids, coudes légèrement fléchis
  const shoulderFlex = lerp(5 * D, 87 * D, lift);
  const elbowFlex = lerp(6 * D, 26 * D, clamp(lift * 0.7 + depth * 0.3, 0, 1));
  for (const side of ['L', 'R'] as const) {
    const sign = side === 'L' ? 1 : -1;
    const armDir = new Vector3(
      sign * 0.07,
      -Math.cos(shoulderFlex),
      Math.sin(shoulderFlex),
    ).normalize();
    const b = elbowFlex;
    const foreDir = new Vector3(
      armDir.x,
      armDir.y * Math.cos(b) + armDir.z * Math.sin(b),
      -armDir.y * Math.sin(b) + armDir.z * Math.cos(b),
    ).normalize();
    targets[`shoulder${side}`] = { dir: armDir };
    targets[`elbow${side}`] = { dir: foreDir };
  }

  // Pass 2 : chaînes résolues → monde fiable pour orientations complètes
  const pass2 = partialSolve(layout, rootPos, rootQuat, targets);

  for (const side of ['L', 'R'] as const) {
    // Pied à plat sur toute la séquence
    targets[`ankle${side}`] = {
      quat: worldDelta(pass2, layout, `ankle${side}`, new Quaternion()),
    };
    const sign = side === 'L' ? 1 : -1;
    const b = elbowFlex;
    const armDir = new Vector3(
      sign * 0.07,
      -Math.cos(shoulderFlex),
      Math.sin(shoulderFlex),
    ).normalize();
    const foreDir = new Vector3(
      armDir.x,
      armDir.y * Math.cos(b) + armDir.z * Math.sin(b),
      -armDir.y * Math.sin(b) + armDir.z * Math.cos(b),
    ).normalize();
    targets[`wrist${side}`] = {
      quat: worldDelta(pass2, layout, `wrist${side}`, arcQuat(DOWN, foreDir)),
    };
  }

  // Regard face à l’horizontale, nuque alignée sur le tronc
  const gaze = new Vector3(0, -0.06, 1).normalize();
  targets.head = {
    quat: worldDelta(pass2, layout, 'head', lookQuat(gaze, spineDir)),
  };

  return { rootPos, rootQuat, targets };
}

/* ---------------- Pompes ---------------- */

function planPompes(layout: RigLayout, t: number): PosePlan {
  const p = layout.params;
  const beta = pushupAngle(t);
  const u = new Vector3(0, Math.sin(beta), Math.cos(beta));

  // Appuis : pointes au sol, chevilles en flexion plantaire
  const plantar = 25 * D;
  const footQuat = new Quaternion().setFromEuler(new Euler(plantar, 0, 0, 'XYZ'));
  const ballWorld = new Vector3(0, -p.footBallDrop, p.footForward).applyQuaternion(footQuat);
  const ankleY = 0.02 - ballWorld.y;
  const ankleZ = -0.75 - ballWorld.z;
  const ankleCenter = new Vector3(0, ankleY, ankleZ);

  // Chaîne jambe le long de la ligne corps (genou quasi tendu)
  const legLen = p.thigh + p.shin - 0.006;
  const hipCenter = ankleCenter.clone().add(u.clone().multiplyScalar(legLen));
  const rootPos = hipCenter.clone().add(u.clone().multiplyScalar(0.02));
  const rootQuat = new Quaternion().setFromEuler(
    new Euler(Math.PI / 2 - beta, 0, 0, 'XYZ'),
  );

  const targets: Partial<Record<BoneId, BoneTarget>> = { spine: { dir: u.clone() } };
  const pass1 = partialSolve(layout, rootPos, rootQuat, targets);

  // Jambes : IK vers les pointes, genoux légèrement sous la ligne
  const downRef = new Vector3(0, -1, 0);
  const perpDown = downRef
    .clone()
    .sub(u.clone().multiplyScalar(u.dot(downRef)))
    .normalize();
  for (const side of ['L', 'R'] as const) {
    const hip = pass1.world[`hip${side}`].pos;
    const ankleTarget = new Vector3(side === 'L' ? p.hipHalf : -p.hipHalf, ankleY, ankleZ);
    const pole = perpDown.clone().add(new Vector3(side === 'L' ? 0.1 : -0.1, 0, -0.2));
    const leg = solveTwoBone(hip, ankleTarget, p.thigh, p.shin, pole);
    targets[`hip${side}`] = { dir: leg.dir1 };
    targets[`knee${side}`] = { dir: leg.dir2 };
  }

  // Bras : mains plantées, coudes vers l’arrière (~45° du corps)
  for (const side of ['L', 'R'] as const) {
    const sign = side === 'L' ? 1 : -1;
    const shoulder = pass1.world[`shoulder${side}`].pos;
    const hand = new Vector3(sign * p.handHalf, 0.05, 0.38);
    const pole = new Vector3(sign * 0.6, -0.2, -0.78);
    const arm = solveTwoBone(shoulder, hand, p.upperArm, p.forearm, pole);
    targets[`shoulder${side}`] = { dir: arm.dir1 };
    targets[`elbow${side}`] = { dir: arm.dir2 };
  }

  const pass2 = partialSolve(layout, rootPos, rootQuat, targets);

  // Pieds en flexion plantaire, mains à plat (doigts vers l’avant)
  const palm = new Quaternion().setFromEuler(new Euler(-Math.PI / 2, 0, 0, 'XYZ'));
  for (const side of ['L', 'R'] as const) {
    targets[`ankle${side}`] = {
      quat: worldDelta(pass2, layout, `ankle${side}`, footQuat),
    };
    targets[`wrist${side}`] = {
      quat: worldDelta(pass2, layout, `wrist${side}`, palm),
    };
  }

  // Regard : sol à ~0,9 m devant la tête
  const headPos = pass2.world.head.pos;
  const face = new Vector3(0, 0, headPos.z + 0.9).sub(headPos).normalize();
  targets.head = { quat: worldDelta(pass2, layout, 'head', lookQuat(face, u)) };

  return { rootPos, rootQuat, targets };
}

/* ---------------- Tadasana ---------------- */

interface YogaCues {
  footYaw: number;
  kneeSoft: number;
  pelvisTilt: number;
  slouch: number;
  armAbd: number;
  headLift: number;
}

function yogaCues(t: number): YogaCues {
  return {
    // 1. Placement des pieds : appuis qui se referment en parallèle
    footYaw: lerp(9 * D, 0, seg(t, 0.15, 0.95)),
    // 2. Alignement des jambes : genoux relâchés puis actifs, sans verrou
    kneeSoft: lerp(1, 0, seg(t, 1.1, 1.9)),
    // 3. Bassin neutre : bascule avant résorbée
    pelvisTilt: lerp(5 * D, 0, seg(t, 2.1, 2.9)),
    // 4. Épaules & bras : dos relâché → colonne longue, épaules ouvertes
    slouch: lerp(1, 0, seg(t, 3.1, 3.9)),
    armAbd: lerp(15 * D, 8 * D, seg(t, 3.1, 3.9)),
    headLift: lerp(1, 0, seg(t, 3.1, 3.9)),
  };
}

function planYoga(layout: RigLayout, t: number): PosePlan {
  const p = layout.params;
  const cues = yogaCues(t);

  // Équilibre postural : micro-oscillations + respiration (posture vivante)
  const swayX = 0.0025 * Math.sin(t * 1.15);
  const swayZ = 0.003 * Math.sin(t * 0.85 + 1.2);
  const breath = 0.003 * Math.sin((t * Math.PI * 2) / 4.5);

  const rootPos = new Vector3(swayX, p.pelvisY + breath - 0.01 * cues.kneeSoft, swayZ);
  const rootQuat = new Quaternion().setFromEuler(new Euler(cues.pelvisTilt, 0, 0, 'XYZ'));

  const slouchLean = cues.slouch * 2.6 * D;
  const spineDir = new Vector3(0, Math.cos(slouchLean), Math.sin(slouchLean));

  const pass1 = partialSolve(layout, rootPos, rootQuat, { spine: { dir: spineDir } });
  const targets: Partial<Record<BoneId, BoneTarget>> = { spine: { dir: spineDir } };

  for (const side of ['L', 'R'] as const) {
    const hip = pass1.world[`hip${side}`].pos;
    const ankleTarget = new Vector3(
      side === 'L' ? p.hipHalf : -p.hipHalf,
      p.ankleHeight,
      0,
    );
    // Genoux dirigés droit devant ; « soft » = bassin légèrement abaissé
    const pole = new Vector3(side === 'L' ? 0.1 : -0.1, 0.1, 1);
    const leg = solveTwoBone(hip, ankleTarget, p.thigh, p.shin, pole);
    targets[`hip${side}`] = { dir: leg.dir1 };
    targets[`knee${side}`] = { dir: leg.dir2 };
  }

  // Bras le long du corps, légèrement écartés, paumes vers l’avant
  for (const side of ['L', 'R'] as const) {
    const sign = side === 'L' ? 1 : -1;
    const armDir = new Vector3(
      sign * Math.sin(cues.armAbd),
      -Math.cos(cues.armAbd),
      0,
    ).normalize();
    const b = 4 * D;
    const foreDir = new Vector3(
      armDir.x,
      armDir.y * Math.cos(b) + armDir.z * Math.sin(b),
      -armDir.y * Math.sin(b) + armDir.z * Math.cos(b),
    ).normalize();
    targets[`shoulder${side}`] = { dir: armDir };
    targets[`elbow${side}`] = { dir: foreDir };
  }

  const pass2 = partialSolve(layout, rootPos, rootQuat, targets);

  for (const side of ['L', 'R'] as const) {
    const sign = side === 'L' ? 1 : -1;
    const armDir = new Vector3(
      sign * Math.sin(cues.armAbd),
      -Math.cos(cues.armAbd),
      0,
    ).normalize();
    const b = 4 * D;
    const foreDir = new Vector3(
      armDir.x,
      armDir.y * Math.cos(b) + armDir.z * Math.sin(b),
      -armDir.y * Math.sin(b) + armDir.z * Math.cos(b),
    ).normalize();

    // Pieds parallèles : la rotation d’appui se résorbe en phase « pieds »
    const yaw = new Quaternion().setFromEuler(
      new Euler(0, sign === 1 ? cues.footYaw : -cues.footYaw, 0, 'XYZ'),
    );
    targets[`ankle${side}`] = {
      quat: worldDelta(pass2, layout, `ankle${side}`, yaw),
    };

    // Paume vers l’avant : yaw monde appliqué sur l’alignement des doigts
    const palmYaw = new Quaternion().setFromEuler(
      new Euler(0, sign === 1 ? Math.PI / 2 : -Math.PI / 2, 0, 'XYZ'),
    );
    targets[`wrist${side}`] = {
      quat: worldDelta(
        pass2,
        layout,
        `wrist${side}`,
        palmYaw.multiply(arcQuat(DOWN, foreDir)),
      ),
    };
  }

  // Regard horizontal devant soi, nuque longue
  const gaze = new Vector3(0, cues.headLift * 0.03 - 0.01, 1).normalize();
  targets.head = {
    quat: worldDelta(pass2, layout, 'head', lookQuat(gaze, spineDir)),
  };

  return { rootPos, rootQuat, targets };
}

/* ---------------- API ---------------- */

function planFor(layout: RigLayout, motion: MotionId, time: number): PosePlan {
  const t = clamp(time, 0, 5);
  switch (motion) {
    case 'pompes':
      return planPompes(layout, t);
    case 'yoga':
      return planYoga(layout, t);
    case 'squat':
    default:
      return planSquat(layout, t);
  }
}

/** Résout une pose complète (plan + FK) sur un layout donné. */
export function solveRig(layout: RigLayout, motion: MotionId, time: number): SolvedRig {
  return solveLayout(layout, planFor(layout, motion, time));
}

/** Variante canonique — modèle procédural, proportions de référence. */
export function solvePose(
  motion: MotionId,
  time: number,
  layout: RigLayout = layoutFromParams(DESIGN_RIG),
): SolvedRig {
  return solveRig(layout, motion, time);
}

/** Points anatomiques pour hotspots / repères pédagogiques. */
export function solveLandmarks(
  motion: MotionId,
  time: number,
  layout: RigLayout = layoutFromParams(DESIGN_RIG),
) {
  return getLandmarks(solveRig(layout, motion, time), layout);
}

/* ---------------- API historique (tests + rétrocompatibilité) ---------------- */

const LEGACY_JOINTS = [
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

function toEulerTuple(q: Quaternion): [number, number, number] {
  const e = new Euler().setFromQuaternion(q, 'XYZ');
  return [e.x, e.y, e.z];
}

/** Pose « vue articulations » (rotations locales en radians). */
export function getPoseAt(motion: MotionId, time: number): ResolvedPose {
  const rig = solvePose(motion, time);
  const joints = {} as Record<string, [number, number, number]>;
  for (const id of LEGACY_JOINTS) {
    joints[id] = toEulerTuple(rig.local[id]);
  }
  const rootEuler = new Euler().setFromQuaternion(rig.rootQuat, 'XYZ');
  return {
    rootPos: [rig.rootPos.x, rig.rootPos.y, rig.rootPos.z],
    rootRot: [rootEuler.x, rootEuler.y, rootEuler.z],
    joints,
  };
}

/** Ancrages temporels : une keyframe par frontière de phase. */
export function getKeyframes(motion: MotionId): PoseKeyframe[] {
  return [0, 1, 2, 3, 4, 5].map((time) => {
    const pose = getPoseAt(motion, time);
    const joint: PoseKeyframe['pose'] = {};
    for (const id of LEGACY_JOINTS) {
      joint[id] = pose.joints[id];
    }
    return { time, pose: joint };
  });
}
