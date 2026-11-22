import { Quaternion, Vector3, Matrix4 } from 'three';

/**
 * Squelette de référence — paramètres anthropométriques, hiérarchie,
 * cinématique directe (FK) et solveur 2 os (IK).
 *
 * Deux « layouts » partagent la même logique de animation :
 *  - layout canonique (modèle procédural, constantes ci-dessous),
 *  - layout mesuré à partir d’un modèle GLB chargé (proportions réelles).
 * Le plan de pose (racine + cibles d’articulation) est calculé sur un layout,
 * puis résolu en rotations locales propres à ce layout.
 */

/* ---------------- Paramètres ---------------- */

export interface RigParams {
  /** Hauteur du centre du bassin (position de repos de la racine) */
  pelvisY: number;
  /** Hauteur des articulations de hanche */
  hipY: number;
  /** Demi-distance entre hanches */
  hipHalf: number;
  thigh: number;
  shin: number;
  /** Hauteur de la cheville (articulation) au sol, debout */
  ankleHeight: number;
  /** Cheville → pointe du pied (avant) */
  footForward: number;
  /** Cheville → talon (arrière) */
  footBack: number;
  /** Cheville → sous le orteil (contact au sol) */
  footBallDrop: number;
  /** Bassin → pivot rachis */
  spineBase: number;
  /** Pivot rachis → ligne des épaules */
  shoulderY: number;
  shoulderHalf: number;
  upperArm: number;
  forearm: number;
  handLength: number;
  /** Pivot rachis → articulation de la tête */
  neckY: number;
  /** Articulation → sommet du crâne */
  headTop: number;
  headRadius: number;
  /** Demi-largeur d’appui des pieds (squat / pompe) */
  stanceHalf: number;
  /** Demi-largeur des mains au sol (pompes) */
  handHalf: number;
}

/** Modèle canonique — adulte 1,75 m, proportions naturelles. */
export const DESIGN_RIG: RigParams = {
  pelvisY: 0.95,
  hipY: 0.93,
  hipHalf: 0.105,
  thigh: 0.43,
  shin: 0.41,
  ankleHeight: 0.09,
  footForward: 0.175,
  footBack: 0.085,
  footBallDrop: 0.06,
  spineBase: 0.06,
  shoulderY: 0.44,
  shoulderHalf: 0.19,
  upperArm: 0.29,
  forearm: 0.26,
  handLength: 0.18,
  neckY: 0.5,
  headTop: 0.26,
  headRadius: 0.105,
  stanceHalf: 0.14,
  handHalf: 0.21,
};

/* ---------------- Os ---------------- */

export const BONES = [
  'pelvis',
  'spine',
  'head',
  'shoulderL',
  'elbowL',
  'wristL',
  'shoulderR',
  'elbowR',
  'wristR',
  'hipL',
  'kneeL',
  'ankleL',
  'hipR',
  'kneeR',
  'ankleR',
] as const;

export type BoneId = (typeof BONES)[number];

/** Os pilotés par une orientation complète (pas seulement une direction) */
export const FULL_ORIENTATION_BONES: BoneId[] = ['pelvis', 'head', 'wristL', 'wristR', 'ankleL', 'ankleR'];

export interface BoneNode {
  parent: BoneId | null;
  /** Décalage local au repos (dans le repère du parent) */
  offset: [number, number, number];
  /** Direction de l’os au repos, dans le repère local de l’os */
  restDir: [number, number, number];
  /** Rotation locale de repos */
  restQuat: [number, number, number, number];
}

export interface RigLayout {
  params: RigParams;
  bones: Record<BoneId, BoneNode>;
}

const DOWN: [number, number, number] = [0, -1, 0];
const UP: [number, number, number] = [0, 1, 0];
const IDENT: [number, number, number, number] = [0, 0, 0, 1];

function canonicalBones(p: RigParams): Record<BoneId, BoneNode> {
  const n = (
    parent: BoneId | null,
    offset: [number, number, number],
    restDir: [number, number, number] = DOWN,
  ): BoneNode => ({ parent, offset, restDir, restQuat: IDENT });

  return {
    pelvis: n(null, [0, 0, 0], UP),
    spine: n('pelvis', [0, p.spineBase, 0], UP),
    head: n('spine', [0, p.neckY, 0], UP),
    shoulderL: n('spine', [p.shoulderHalf, p.shoulderY, 0]),
    elbowL: n('shoulderL', [0, -p.upperArm, 0]),
    wristL: n('elbowL', [0, -p.forearm, 0]),
    shoulderR: n('spine', [-p.shoulderHalf, p.shoulderY, 0]),
    elbowR: n('shoulderR', [0, -p.upperArm, 0]),
    wristR: n('elbowR', [0, -p.forearm, 0]),
    hipL: n('pelvis', [p.hipHalf, p.hipY - p.pelvisY, 0]),
    kneeL: n('hipL', [0, -p.thigh, 0]),
    ankleL: n('kneeL', [0, -p.shin, 0]),
    hipR: n('pelvis', [-p.hipHalf, p.hipY - p.pelvisY, 0]),
    kneeR: n('hipR', [0, -p.thigh, 0]),
    ankleR: n('kneeR', [0, -p.shin, 0]),
  };
}

export function layoutFromParams(params: RigParams = DESIGN_RIG): RigLayout {
  return { params, bones: canonicalBones(params) };
}

/* ---------------- Maths ---------------- */

export const D = Math.PI / 180;

export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Progression lissée (ease-in-out) sur [a, b]. */
export function seg(t: number, a: number, b: number): number {
  if (b <= a) return t >= b ? 1 : 0;
  const x = clamp((t - a) / (b - a), 0, 1);
  return x * x * (3 - 2 * x);
}

export type Vec3 = [number, number, number];
export type Quat = [number, number, number, number];

const _v1 = new Vector3();
const _v2 = new Vector3();
const _v3 = new Vector3();

export function vec(x = 0, y = 0, z = 0): Vector3 {
  return new Vector3(x, y, z);
}

/** Quaternion de rotation qui amène `from` sur `to` (arc minimal). */
export function arcQuat(from: Vector3, to: Vector3): Quaternion {
  return new Quaternion().setFromUnitVectors(from, to);
}

/** Repère dont l’axe +Z regarde vers `face` et l’axe +Y vers `up`. */
export function lookQuat(face: Vector3, up: Vector3): Quaternion {
  const m = new Matrix4();
  const z = _v1.copy(face).normalize();
  const x = _v2.copy(up).cross(z);
  if (x.lengthSq() < 1e-8) x.set(1, 0, 0);
  x.normalize();
  const y = _v3.copy(z).cross(x).normalize();
  m.makeBasis(x, y, z);
  return new Quaternion().setFromRotationMatrix(m);
}

export function quatToTuple(q: Quaternion): Quat {
  return [q.x, q.y, q.z, q.w];
}

export function tupleToQuat(q: Quat): Quaternion {
  return new Quaternion(q[0], q[1], q[2], q[3]);
}

/* ---------------- IK 2 os ---------------- */

export interface TwoBoneResult {
  /** Direction du premier os (unitaire, monde) */
  dir1: Vector3;
  /** Direction du second os (unitaire, monde) */
  dir2: Vector3;
  /** Position de l’articulation intermédiaire */
  mid: Vector3;
}

/**
 * Solveur 2 os : place la chaîne racine → cible avec un genou/coude
 * orienté selon `pole`. Les longueurs sont bornées pour éviter toute
 * configuration impossible.
 */
export function solveTwoBone(
  root: Vector3,
  target: Vector3,
  l1: number,
  l2: number,
  pole: Vector3,
): TwoBoneResult {
  const toTarget = _v1.copy(target).sub(root);
  let d = toTarget.length();
  const min = Math.abs(l1 - l2) + 1e-4;
  const max = l1 + l2 - 1e-4;
  d = clamp(d, min, max);
  const n = toTarget.lengthSq() > 1e-10 ? toTarget.clone().normalize() : new Vector3(0, -1, 0);

  const cosA = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const a = Math.acos(cosA);

  // Composante du pôle perpendiculaire à la direction cible
  const m = _v2.copy(pole).sub(n.clone().multiplyScalar(pole.dot(n)));
  if (m.lengthSq() < 1e-8) {
    m.set(0, 0, 1).sub(n.clone().multiplyScalar(n.z));
    if (m.lengthSq() < 1e-8) m.set(1, 0, 0).sub(n.clone().multiplyScalar(n.x));
  }
  m.normalize();

  const dir1 = n.clone().multiplyScalar(Math.cos(a)).add(m.clone().multiplyScalar(Math.sin(a))).normalize();
  const mid = root.clone().add(dir1.clone().multiplyScalar(l1));
  const dir2 = target.clone().sub(mid).normalize();
  return { dir1, dir2, mid };
}

/* ---------------- FK ---------------- */

export interface BoneTransform {
  pos: Vector3;
  quat: Quaternion;
}

export interface SolvedRig {
  rootPos: Vector3;
  rootQuat: Quaternion;
  /** Rotations locales (à appliquer sur les groupes/os) */
  local: Record<BoneId, Quaternion>;
  /** Transformations monde (FK canonique ou mesuré) */
  world: Record<BoneId, BoneTransform>;
}

/** Cible de pose : direction monde (os articulés) ou orientation complète. */
export interface BoneTarget {
  dir?: Vector3;
  quat?: Quaternion;
}

export interface PosePlan {
  rootPos: Vector3;
  rootQuat: Quaternion;
  targets: Partial<Record<BoneId, BoneTarget>>;
}

/**
 * Résout un plan en rotations locales + FK sur un layout donné.
 * Fonctionne aussi bien pour le squelette canonique que pour un rig GLB mesuré.
 */
export function solveLayout(layout: RigLayout, plan: PosePlan): SolvedRig {
  const local = {} as Record<BoneId, Quaternion>;
  const world = {} as Record<BoneId, BoneTransform>;

  for (const id of BONES) {
    const node = layout.bones[id];
    const parentWorld = node.parent ? world[node.parent] : null;
    const parentQuat = parentWorld ? parentWorld.quat : new Quaternion();

    // Rotation locale de repos
    const restLocal = tupleToQuat(node.restQuat);

    if (id === 'pelvis') {
      // La racine est une orientation monde « delta » depuis le repos du rig.
      const restLocal = tupleToQuat(node.restQuat);
      const q = plan.rootQuat.clone().multiply(restLocal);
      local.pelvis = q.clone();
      world.pelvis = { pos: plan.rootPos.clone(), quat: q };
      continue;
    }

    // Position : offset local transformé par le repère parent
    const offset = new Vector3(...node.offset);
    const pos = parentWorld.pos.clone().add(offset.applyQuaternion(parentQuat));

    const target = plan.targets[id];
    let worldQuat: Quaternion;

    if (target?.quat) {
      worldQuat = target.quat.clone();
    } else {
      // Cible directionnelle : delta monde depuis le repos, appliqué au repos local
      const restWorldDir = new Vector3(...node.restDir).applyQuaternion(
        parentWorld.quat.clone().multiply(restLocal),
      );
      const restWorldQuat = parentWorld.quat.clone().multiply(restLocal);
      const desired = target?.dir
        ? target.dir.clone().normalize()
        : restWorldDir.clone();
      const delta = arcQuat(restWorldDir, desired);
      worldQuat = delta.multiply(restWorldQuat);
    }

    const localQuat = parentQuat.clone().invert().multiply(worldQuat);
    local[id] = localQuat;
    world[id] = { pos, quat: worldQuat };
  }

  return { rootPos: plan.rootPos.clone(), rootQuat: plan.rootQuat.clone(), local, world };
}

/* ---------------- Landmarks ---------------- */

export type LandmarkId =
  | 'crown'
  | 'headCenter'
  | 'neck'
  | 'chest'
  | 'abdomen'
  | 'pelvisCenter'
  | 'sacrum'
  | 'shoulderL'
  | 'elbowL'
  | 'handL'
  | 'hipL'
  | 'kneeL'
  | 'ankleL'
  | 'footL'
  | 'heelL'
  | 'shoulderR'
  | 'elbowR'
  | 'handR'
  | 'hipR'
  | 'kneeR'
  | 'ankleR'
  | 'footR'
  | 'heelR';

export interface Landmark {
  pos: Vector3;
  quat: Quaternion;
}

function landmarkAt(pos: Vector3, quat: Quaternion, offset: Vec3): Landmark {
  return { pos: pos.clone().add(new Vector3(...offset).applyQuaternion(quat)), quat: quat.clone() };
}

/** Points anatomiques dérivés du FK — servent aux hotspots et repères. */
export function getLandmarks(rig: SolvedRig, layout: RigLayout): Record<LandmarkId, Landmark> {
  const p = layout.params;
  const w = rig.world;

  const spine = w.spine;
  const head = w.head;
  const pelvis = w.pelvis;

  const pair = (side: 'L' | 'R'): [Landmark, Landmark, Landmark, Landmark, Landmark, Landmark, Landmark] => {
    const shoulder = w[`shoulder${side}`];
    const elbow = w[`elbow${side}`];
    const wrist = w[`wrist${side}`];
    const hip = w[`hip${side}`];
    const knee = w[`knee${side}`];
    const ankle = w[`ankle${side}`];
    return [
      { pos: shoulder.pos.clone(), quat: shoulder.quat.clone() },
      { pos: elbow.pos.clone(), quat: elbow.quat.clone() },
      landmarkAt(wrist.pos, wrist.quat, [0, -p.handLength * 0.5, 0]),
      { pos: hip.pos.clone(), quat: hip.quat.clone() },
      { pos: knee.pos.clone(), quat: knee.quat.clone() },
      { pos: ankle.pos.clone(), quat: ankle.quat.clone() },
      landmarkAt(ankle.pos, ankle.quat, [0, -p.footBallDrop, p.footForward]),
    ];
  };

  const [shL, elL, hdL, hpL, knL, anL, ftL] = pair('L');
  const [shR, elR, hdR, hpR, knR, anR, ftR] = pair('R');

  const heel = (ankle: Landmark): Landmark =>
    landmarkAt(ankle.pos, ankle.quat, [0, -p.footBallDrop, -p.footBack]);

  return {
    crown: landmarkAt(head.pos, head.quat, [0, p.headTop, 0]),
    headCenter: landmarkAt(head.pos, head.quat, [0, p.headTop * 0.52, 0]),
    neck: landmarkAt(spine.pos, spine.quat, [0, p.neckY - 0.04, 0]),
    chest: landmarkAt(spine.pos, spine.quat, [0, p.shoulderY * 0.74, 0.11]),
    abdomen: landmarkAt(spine.pos, spine.quat, [0, p.shoulderY * 0.3, 0.115]),
    pelvisCenter: { pos: pelvis.pos.clone(), quat: pelvis.quat.clone() },
    sacrum: landmarkAt(pelvis.pos, pelvis.quat, [0, -0.04, -0.13]),
    shoulderL: shL,
    elbowL: elL,
    handL: hdL,
    hipL: hpL,
    kneeL: knL,
    ankleL: anL,
    footL: ftL,
    heelL: heel(anL),
    shoulderR: shR,
    elbowR: elR,
    handR: hdR,
    hipR: hpR,
    kneeR: knR,
    ankleR: anR,
    footR: ftR,
    heelR: heel(anR),
  };
}

/** Position monde d’un landmark (raccourci). */
export function landmarkPos(
  rig: SolvedRig,
  layout: RigLayout,
  id: LandmarkId,
): { x: number; y: number; z: number } {
  const l = getLandmarks(rig, layout)[id];
  return { x: l.pos.x, y: l.pos.y, z: l.pos.z };
}

/** Mesure un rig GLB (os rest) → paramètres + layout. */
export function measureLayout(
  params: RigParams,
  measured: {
    hipL: Vector3;
    hipR: Vector3;
    kneeL: Vector3;
    kneeR: Vector3;
    ankleL: Vector3;
    ankleR: Vector3;
    footL: Vector3;
    footR: Vector3;
    shoulderL: Vector3;
    shoulderR: Vector3;
    elbowL: Vector3;
    elbowR: Vector3;
    wristL: Vector3;
    wristR: Vector3;
    spine: Vector3;
    head: Vector3;
    pelvis: Vector3;
    restLocal: Partial<Record<BoneId, { offset: Vec3; restQuat: Quat; restDir: Vec3 }>>;
  },
): RigLayout {
  const thigh = measured.kneeL.distanceTo(measured.hipL) || params.thigh;
  const shin = measured.ankleL.distanceTo(measured.kneeL) || params.shin;
  const upperArm = measured.elbowL.distanceTo(measured.shoulderL) || params.upperArm;
  const forearm = measured.wristL.distanceTo(measured.elbowL) || params.forearm;
  const hipHalf = Math.abs(measured.hipL.x - measured.hipR.x) / 2 || params.hipHalf;
  const shoulderHalf =
    Math.abs(measured.shoulderL.x - measured.shoulderR.x) / 2 || params.shoulderHalf;

  const rigParams: RigParams = {
    ...params,
    hipY: measured.hipL.y,
    pelvisY: measured.pelvis.y,
    hipHalf,
    thigh,
    shin,
    ankleHeight: measured.ankleL.y,
    upperArm,
    forearm,
    shoulderHalf,
    shoulderY: measured.shoulderL.y - measured.spine.y,
    spineBase: measured.spine.y - measured.pelvis.y,
    neckY: measured.head.y - measured.spine.y,
  };

  const layout = layoutFromParams(rigParams);
  for (const id of BONES) {
    const r = measured.restLocal[id];
    if (!r) continue;
    layout.bones[id] = {
      parent: layout.bones[id].parent,
      offset: [...r.offset] as Vec3,
      restDir: [...r.restDir] as Vec3,
      restQuat: [...r.restQuat] as Quat,
    };
  }
  return layout;
}
