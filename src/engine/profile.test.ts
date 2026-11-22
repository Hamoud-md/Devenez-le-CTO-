import { describe, expect, it } from 'vitest';
import { buildProfile, visibleQuestions, QUESTIONS } from '../data/questions';
import {
  explanationsDiffer,
  personalize,
} from '../engine/profile';

describe('Profile Engine', () => {
  it('renvoie null tant que les réponses obligatoires sont incomplètes', () => {
    expect(buildProfile({})).toBeNull();
    expect(buildProfile({ level: 'debutant' })).toBeNull();
  });

  it('construit un profil complet à partir de réponses valides', () => {
    const profile = buildProfile({
      level: 'debutant',
      activities: ['fitness', 'yoga'],
      goal: 'renforcement',
      motion: 'squat',
      preference: 'guide',
    });

    expect(profile).not.toBeNull();
    expect(profile?.level).toBe('debutant');
    expect(profile?.goal).toBe('renforcement');
    expect(profile?.motion).toBe('squat');
    expect(profile?.preference).toBe('guide');
    expect(profile?.activities).toEqual(['fitness', 'yoga']);
  });

  it('produit des explications différentes pour deux profils différents (AC-02)', () => {
    const beginner = buildProfile({
      level: 'debutant',
      goal: 'renforcement',
      motion: 'squat',
      preference: 'essentiel',
    })!;

    const advanced = buildProfile({
      level: 'avance',
      goal: 'technique',
      motion: 'squat',
      preference: 'guide',
    })!;

    expect(explanationsDiffer(beginner, advanced)).toBe(true);
    expect(personalize(beginner).length).toBeGreaterThan(0);
    expect(personalize(advanced).length).toBeGreaterThan(0);
  });

  it('deux profils identiques reçoivent les mêmes instructions', () => {
    const a = buildProfile({
      level: 'intermediaire',
      goal: 'mobilite',
      motion: 'pompes',
      preference: 'guide',
    })!;
    const b = { ...a };

    expect(explanationsDiffer(a, b)).toBe(false);
  });
});

describe('QCM adaptatif', () => {
  it('affiche toutes les questions sans réponse', () => {
    expect(visibleQuestions({})).toHaveLength(QUESTIONS.length);
  });

  it('conserve la question courante même après réponse', () => {
    const visible = visibleQuestions({ level: 'debutant' });
    expect(visible.some((q) => q.id === 'level')).toBe(true);
    expect(visible.some((q) => q.id === 'preference')).toBe(true);
  });

  it('chaque question possède des options non vides', () => {
    for (const q of QUESTIONS) {
      expect(q.options.length).toBeGreaterThan(0);
      expect(q.title.length).toBeGreaterThan(0);
    }
  });
});
