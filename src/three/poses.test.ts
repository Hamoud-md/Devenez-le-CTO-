import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three';
import { getMovement } from '../data/movements';
import { getKeyframes, getPoseAt, solveLandmarks, solvePose } from './poses';
import { DESIGN_RIG, layoutFromParams, solveRig } from './rig';

const D = Math.PI / 180;

function boneDir(
  motion: 'squat' | 'pompes' | 'yoga',
  t: number,
  bone: 'hipL' | 'kneeL' | 'shoulderL' | 'elbowL',
  restDir: [number, number, number] = [0, -1, 0],
): Vector3 {
  const rig = solvePose(motion, t);
  return new Vector3(...restDir).applyQuaternion(rig.world[bone].quat).normalize();
}

function angleBetween(a: Vector3, b: Vector3): number {
  return Math.acos(Math.min(1, Math.max(-1, a.dot(b))));
}

describe('Moteur de poses — continuité', () => {
  it('la pose évolue sans saut pour les 3 mouvements', () => {
    for (const id of ['squat', 'pompes', 'yoga'] as const) {
      let maxStep = 0;
      for (let t = 0; t < 5; t += 0.05) {
        const a = solveLandmarks(id, t);
        const b = solveLandmarks(id, t + 0.05);
        for (const key of Object.keys(a)) {
          const d = a[key as keyof typeof a].pos.distanceTo(b[key as keyof typeof b].pos);
          maxStep = Math.max(maxStep, d);
        }
      }
      // Déplacement maximum entre deux échantillons de 50 ms (mouvement contrôlé)
      expect(maxStep).toBeLessThan(0.06);
      expect(Number.isFinite(maxStep)).toBe(true);
    }
  });

  it('les bornes de phases coïncident avec les ancrages de keyframes', () => {
    for (const id of ['squat', 'pompes', 'yoga'] as const) {
      const anchors = getKeyframes(id).map((k) => k.time);
      for (const phase of getMovement(id).phases) {
        expect(anchors).toContain(phase.start);
        expect(anchors).toContain(phase.end);
      }
    }
  });
});

describe('Squat — biométrie', () => {
  it('les pieds restent plantés pendant toute la séquence', () => {
    for (let t = 0; t <= 5; t += 0.1) {
      const a = solveLandmarks('squat', t);
      expect(a.footL.pos.x).toBeCloseTo(DESIGN_RIG.stanceHalf, 5);
      expect(a.footL.pos.y).toBeCloseTo(
        DESIGN_RIG.ankleHeight - DESIGN_RIG.footBallDrop,
        5,
      );
      expect(a.footL.pos.z).toBeCloseTo(DESIGN_RIG.footForward, 5);
    }
  });

  it('la position basse est bien plus basse que la position debout', () => {
    const stand = solveLandmarks('squat', 0).pelvisCenter.pos.y;
    const bottom = solveLandmarks('squat', 2.5).pelvisCenter.pos.y;
    expect(stand).toBeCloseTo(DESIGN_RIG.pelvisY, 2);
    expect(bottom).toBeCloseTo(DESIGN_RIG.pelvisY - 0.4, 2);
  });

  it('les cuisses sont presque parallèles au sol en position basse', () => {
    const thigh = boneDir('squat', 2.5, 'hipL');
    expect(Math.abs(thigh.y)).toBeLessThan(Math.sin(18 * D));
  });

  it('les genoux fléchissent puis se redressent (montée/descente)', () => {
    const straight = Math.abs(getPoseAt('squat', 0).joints.kneeL[0]);
    const mid = Math.abs(getPoseAt('squat', 1.5).joints.kneeL[0]);
    const bottom = Math.abs(getPoseAt('squat', 2.5).joints.kneeL[0]);
    const up = Math.abs(getPoseAt('squat', 3.5).joints.kneeL[0]);
    expect(mid).toBeGreaterThan(straight);
    expect(bottom).toBeGreaterThan(mid);
    expect(up).toBeLessThan(bottom);
    expect(up).toBeGreaterThan(straight);
  });

  it('le regard reste vers l’avant (tête orientée +Z)', () => {
    for (const t of [0, 1.5, 2.5, 4]) {
      const rig = solvePose('squat', t);
      const face = new Vector3(0, 0, 1).applyQuaternion(rig.world.head.quat);
      expect(face.z).toBeGreaterThan(0.85);
    }
  });

  it('les bras se lèvent en contrepoids puis reviennent au repos', () => {
    const shoulderDown = solvePose('squat', 0).world.shoulderL.quat;
    const shoulderUp = solvePose('squat', 1.5).world.shoulderL.quat;
    const armDown = new Vector3(0, -1, 0).applyQuaternion(shoulderDown);
    const armUp = new Vector3(0, -1, 0).applyQuaternion(shoulderUp);
    // bras quasi vertical au repos, quasi horizontal pendant la descente
    expect(armDown.y).toBeLessThan(-0.9);
    expect(armUp.z).toBeGreaterThan(0.9);
    const armEnd = new Vector3(0, -1, 0).applyQuaternion(
      solvePose('squat', 5).world.shoulderL.quat,
    );
    expect(armEnd.y).toBeLessThan(-0.9);
  });
});

describe('Pompes — biométrie', () => {
  it('les mains restent plantées au sol', () => {
    const first = solveLandmarks('pompes', 0.2).handL.pos.clone();
    for (let t = 0.5; t <= 4.8; t += 0.3) {
      const hand = solveLandmarks('pompes', t).handL.pos;
      expect(hand.distanceTo(first)).toBeLessThan(0.02);
      expect(hand.y).toBeGreaterThan(0);
      expect(hand.y).toBeLessThan(0.09);
    }
  });

  it('les pointes restent au sol', () => {
    for (let t = 0; t <= 5; t += 0.25) {
      const foot = solveLandmarks('pompes', t).footL.pos;
      expect(foot.y).toBeCloseTo(0.02, 2);
      expect(foot.z).toBeCloseTo(-0.75, 2);
    }
  });

  it('le corps reste aligné (tête–hanches–talons) pendant tout le mouvement', () => {
    for (let t = 0; t <= 5; t += 0.25) {
      const lm = solveLandmarks('pompes', t);
      const upper = lm.neck.pos.clone().sub(lm.pelvisCenter.pos).normalize();
      const ankleMid = lm.ankleL.pos.clone().add(lm.ankleR.pos).multiplyScalar(0.5);
      const lower = lm.pelvisCenter.pos.clone().sub(ankleMid).normalize();
      const deviation = angleBetween(upper, lower);
      expect(deviation).toBeLessThan(12 * D);
    }
  });

  it('le torse descend puis remonte (planche → bas → planche)', () => {
    const plank = solveLandmarks('pompes', 0.5).chest.pos.y;
    const bottom = solveLandmarks('pompes', 2.5).chest.pos.y;
    const end = solveLandmarks('pompes', 4.5).chest.pos.y;
    expect(plank).toBeGreaterThan(0.35);
    expect(bottom).toBeLessThan(plank - 0.2);
    expect(end).toBeGreaterThan(bottom + 0.2);
  });

  it('les coudes fléchissent fortement en position basse', () => {
    const flex = (t: number) => {
      const upper = boneDir('pompes', t, 'shoulderL');
      const fore = boneDir('pompes', t, 'elbowL');
      return angleBetween(upper, fore);
    };
    expect(flex(2.5)).toBeGreaterThan(flex(0.5) + 40 * D);
    expect(flex(2.5)).toBeGreaterThan(70 * D);
  });
});

describe('Tadasana — posture statique maîtrisée', () => {
  it('le bassin reste quasi immobile (micro-équilibre uniquement)', () => {
    let maxDrift = 0;
    const origin = solveLandmarks('yoga', 0).pelvisCenter.pos.clone();
    for (let t = 0.05; t <= 5; t += 0.05) {
      const p = solveLandmarks('yoga', t).pelvisCenter.pos;
      maxDrift = Math.max(maxDrift, p.distanceTo(origin));
    }
    expect(maxDrift).toBeLessThan(0.04);
  });

  it('les appuis restent fixes', () => {
    for (let t = 0; t <= 5; t += 0.25) {
      const a = solveLandmarks('yoga', t);
      expect(a.ankleL.pos.y).toBeCloseTo(DESIGN_RIG.ankleHeight, 4);
      expect(a.ankleL.pos.z).toBeCloseTo(0, 4);
      expect(Math.abs(a.ankleL.pos.x)).toBeCloseTo(DESIGN_RIG.hipHalf, 4);
    }
  });

  it('la colonne se redresse progressivement (dos relâché → aligné)', () => {
    const earlyLean = solvePose('yoga', 3.0).joints.spine[0];
    const aligned = solvePose('yoga', 4.2).joints.spine[0];
    expect(Math.abs(aligned)).toBeLessThan(Math.abs(earlyLean));
    expect(Math.abs(aligned)).toBeLessThan(1.5 * D);
  });

  it('les pieds deviennent parallèles après la phase « pieds »', () => {
    const yawEarly = Math.abs(solvePose('yoga', 0.1).joints.ankleL[1]);
    const yawAfter = Math.abs(solvePose('yoga', 1.5).joints.ankleL[1]);
    expect(yawEarly).toBeGreaterThan(4 * D);
    expect(yawAfter).toBeLessThan(1 * D);
  });
});

describe('Hotspots — ancrage anatomique', () => {
  it('les landmarks suivent les articulations pendant le squat', () => {
    const top = solveLandmarks('squat', 0);
    const bottom = solveLandmarks('squat', 2.5);
    // Le genou descend avec la jambe
    expect(bottom.kneeL.pos.y).toBeLessThan(top.kneeL.pos.y - 0.2);
    // La tête descend avec le tronc
    expect(bottom.crown.pos.y).toBeLessThan(top.crown.pos.y - 0.3);
    // L’aplomb crâne → cheville se déplace (hanches en arrière)
    expect(bottom.crown.pos.z).not.toBeCloseTo(top.crown.pos.z, 1);
  });

  it('le landmark pectoraux reste sur la cage thoracique en position basse des pompes', () => {
    const lm = solveLandmarks('pompes', 2.5);
    // poitrine proche du sol, entre épaules et bassin
    expect(lm.chest.pos.y).toBeLessThan(0.35);
    expect(lm.chest.pos.y).toBeGreaterThan(lm.sacrum.pos.y - 0.1);
  });

  it('fournit tous les landmarks requis', () => {
    const lm = solveLandmarks('squat', 1);
    for (const id of [
      'crown',
      'chest',
      'pelvisCenter',
      'kneeL',
      'kneeR',
      'footL',
      'footR',
      'shoulderL',
      'handL',
    ] as const) {
      expect(lm[id]).toBeDefined();
      expect(Number.isFinite(lm[id].pos.x)).toBe(true);
    }
  });
});

describe('Layouts multiples', () => {
  it('un layout aux proportions différentes résout sans erreur', () => {
    const layout = layoutFromParams({
      ...DESIGN_RIG,
      thigh: 0.4,
      shin: 0.38,
      upperArm: 0.27,
      hipY: 0.88,
      pelvisY: 0.9,
      ankleHeight: 0.88 - 0.4 - 0.38,
      shoulderY: 0.42,
    });
    for (const motion of ['squat', 'pompes', 'yoga'] as const) {
      for (let t = 0; t <= 5; t += 0.5) {
        const rig = solveRig(layout, motion, t);
        expect(Number.isFinite(rig.rootPos.y)).toBe(true);
        expect(rig.world.head.pos.y).toBeGreaterThan(rig.rootPos.y);
      }
    }
  });
});
