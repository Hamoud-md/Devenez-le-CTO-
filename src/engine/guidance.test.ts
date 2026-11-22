import { describe, expect, it } from 'vitest';
import {
  INITIAL_GUIDANCE,
  completeStep,
  goToStep,
  isComplete,
  progress,
  stepStatus,
  stepsWithStatus,
} from './guidance';
import { PATH_STEPS } from '../data/content';

describe('Guidance Engine — Living Path', () => {
  it('commence sur « profil », aucune autre étape débloquée', () => {
    expect(INITIAL_GUIDANCE.currentStep).toBe('profil');
    expect(stepStatus(INITIAL_GUIDANCE, 'profil')).toBe('active');
    expect(stepStatus(INITIAL_GUIDANCE, 'decouverte')).toBe('locked');
    expect(stepStatus(INITIAL_GUIDANCE, 'revision')).toBe('locked');
  });

  it('débloque l’étape suivante quand la courante est terminée', () => {
    let state = completeStep(INITIAL_GUIDANCE, 'profil');

    expect(state.completed).toContain('profil');
    expect(state.currentStep).toBe('preparation');
    expect(stepStatus(state, 'profil')).toBe('done');
    expect(stepStatus(state, 'preparation')).toBe('active');
    // Déblocage séquentiel : l’étape 3 n’est disponible qu’après la 2
    expect(stepStatus(state, 'decouverte')).toBe('locked');
    expect(stepStatus(state, 'revision')).toBe('locked');

    state = completeStep(state, 'preparation');
    // La 3 devient l’étape courante (active) ; elle était verrouillée avant
    expect(state.currentStep).toBe('decouverte');
    expect(stepStatus(state, 'decouverte')).toBe('active');
    expect(stepStatus(state, 'revision')).toBe('locked');
  });

  it('permet de revenir à une étape précédente sans perdre la progression (AC-04)', () => {
    let state = completeStep(INITIAL_GUIDANCE, 'profil');
    state = completeStep(state, 'preparation');
    state = completeStep(state, 'decouverte');

    const back = goToStep(state, 'profil');
    expect(back.currentStep).toBe('profil');
    expect(back.completed).toEqual(state.completed);
    expect(back.completed).toHaveLength(3);
  });

  it('refuse de naviguer vers une étape verrouillée', () => {
    const state = goToStep(INITIAL_GUIDANCE, 'revision');
    expect(state.currentStep).toBe('profil');
  });

  it('calcule la progression en pourcentage', () => {
    expect(progress(INITIAL_GUIDANCE).percent).toBe(0);

    let state = completeStep(INITIAL_GUIDANCE, 'profil');
    state = completeStep(state, 'preparation');
    const p = progress(state);
    expect(p.done).toBe(2);
    expect(p.total).toBe(PATH_STEPS.length);
    expect(p.percent).toBe(40);
  });

  it('termine le parcours quand toutes les étapes sont complétées', () => {
    let state = INITIAL_GUIDANCE;
    for (const step of PATH_STEPS) {
      state = completeStep(state, step.id);
    }
    expect(isComplete(state)).toBe(true);
    expect(progress(state).percent).toBe(100);
  });

  it('expose le statut de chaque étape', () => {
    const list = stepsWithStatus(INITIAL_GUIDANCE);
    expect(list).toHaveLength(PATH_STEPS.length);
    expect(list[0].status).toBe('active');
    expect(list[1].status).toBe('locked');
    expect(list[2].status).toBe('locked');
  });
});
