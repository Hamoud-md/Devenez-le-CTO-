import { describe, expect, it } from 'vitest';
import { getMovement, MOVEMENT_LIST } from '../data/movements';
import { getPoseAt, getKeyframes } from '../three/poses';
import { QUIZ, PATH_STEPS, equipmentForMotion } from '../data/content';

describe('Données pédagogiques', () => {
  it('les 3 mouvements existent avec des phases valides', () => {
    expect(MOVEMENT_LIST).toHaveLength(3);
    for (const m of MOVEMENT_LIST) {
      expect(m.phases.length).toBeGreaterThanOrEqual(3);
      expect(m.name.length).toBeGreaterThan(0);
      expect(m.license.length).toBeGreaterThan(0);
      // Phases chronologiques
      m.phases.forEach((p, i) => {
        expect(p.start).toBeLessThan(p.end);
        if (i > 0) expect(p.start).toBeGreaterThanOrEqual(m.phases[i - 1].start);
      });
    }
  });

  it('chaque mouvement a des hotspots liés à des phases existantes', () => {
    for (const m of MOVEMENT_LIST) {
      const phaseIds = m.phases.map((p) => p.id);
      expect(m.hotspots.length).toBeGreaterThan(0);
      for (const h of m.hotspots) {
        expect(h.phases.length).toBeGreaterThan(0);
        for (const ph of h.phases) {
          expect(phaseIds).toContain(ph);
        }
        expect(h.essential.length).toBeGreaterThan(0);
        expect(h.guided.length).toBeGreaterThan(0);
      }
    }
  });

  it('le Knowledge Check a des réponses valides', () => {
    for (const q of QUIZ) {
      expect(q.options.length).toBeGreaterThan(1);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.options.length);
      expect(q.explanation.length).toBeGreaterThan(0);
    }
  });

  it('le parcours comporte 5 étapes ordonnées', () => {
    expect(PATH_STEPS).toHaveLength(5);
    PATH_STEPS.forEach((s, i) => expect(s.index).toBe(i + 1));
  });

  it('propose des équipements pour chaque mouvement', () => {
    for (const id of ['squat', 'pompes', 'yoga'] as const) {
      expect(equipmentForMotion(id).length).toBeGreaterThan(0);
    }
  });
});

describe('Moteur de poses 3D (Phase A)', () => {
  it('interpole une pose pour chaque mouvement à tout instant', () => {
    for (const id of ['squat', 'pompes', 'yoga'] as const) {
      const duration = getMovement(id).duration;
      for (let t = 0; t <= duration; t += 0.5) {
        const pose = getPoseAt(id, t);
        expect(pose.rootPos).toHaveLength(3);
        expect(pose.joints.kneeL).toHaveLength(3);
        expect(pose.joints.spine).toHaveLength(3);
        // Valeurs finies
        pose.rootPos.forEach((v) => expect(Number.isFinite(v)).toBe(true));
      }
    }
  });

  it('clampe le temps hors bornes', () => {
    const before = getPoseAt('squat', -5);
    const atZero = getPoseAt('squat', 0);
    expect(before.rootPos).toEqual(atZero.rootPos);

    const after = getPoseAt('squat', 99);
    const atEnd = getPoseAt('squat', 5);
    expect(after.rootPos).toEqual(atEnd.rootPos);
  });

  it('produit des poses distinctes entre le haut et le bas du squat', () => {
    const top = getPoseAt('squat', 0);
    const bottom = getPoseAt('squat', 2);
    // La position basse est plus basse (root Y négatif) que la position debout
    expect(bottom.rootPos[1]).toBeLessThan(top.rootPos[1]);
    // Les genoux sont plus fléchis
    expect(Math.abs(bottom.joints.kneeL[0])).toBeGreaterThan(
      Math.abs(top.joints.kneeL[0]),
    );
  });

  it('possède des keyframes pour chaque mouvement', () => {
    for (const id of ['squat', 'pompes', 'yoga'] as const) {
      const frames = getKeyframes(id);
      expect(frames.length).toBeGreaterThanOrEqual(4);
      expect(frames[0].time).toBe(0);
    }
  });
});
