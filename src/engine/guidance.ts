import type {
  GuidanceState,
  PathStep,
  PathStepId,
  StepStatus,
} from '../types';
import { PATH_STEPS } from '../data/content';

/**
 * Guidance Engine — règles de personnalisation et progression du parcours.
 */

export const INITIAL_GUIDANCE: GuidanceState = {
  currentStep: 'profil',
  completed: [],
};

/** Étapes débloquées : une étape est accessible si toutes les précédentes sont terminées. */
export function stepStatus(state: GuidanceState, stepId: PathStepId): StepStatus {
  const step = PATH_STEPS.find((s) => s.id === stepId);
  if (!step) return 'locked';

  if (state.currentStep === stepId && !state.completed.includes(stepId)) {
    return 'active';
  }
  if (state.completed.includes(stepId)) {
    return state.currentStep === stepId ? 'active' : 'done';
  }

  // Toutes les étapes précédentes doivent être terminées
  const previous = PATH_STEPS.filter((s) => s.index < step.index);
  const allPreviousDone = previous.every((s) => state.completed.includes(s.id));
  return allPreviousDone ? 'available' : 'locked';
}

/** Marque une étape comme terminée et avance à la suivante. */
export function completeStep(
  state: GuidanceState,
  stepId: PathStepId,
): GuidanceState {
  const completed = state.completed.includes(stepId)
    ? state.completed
    : [...state.completed, stepId];

  const current = PATH_STEPS.find((s) => s.id === stepId);
  const next = PATH_STEPS.find(
    (s) => current !== undefined && s.index === current.index + 1,
  );

  return {
    currentStep: next ? next.id : stepId,
    completed,
  };
}

/** Navigue vers une étape sans perdre la progression. */
export function goToStep(
  state: GuidanceState,
  stepId: PathStepId,
): GuidanceState {
  if (stepStatus(state, stepId) === 'locked') return state;
  return { ...state, currentStep: stepId };
}

/** Progression : nombre d'étapes terminées / total. */
export function progress(state: GuidanceState): {
  done: number;
  total: number;
  percent: number;
} {
  const total = PATH_STEPS.length;
  const done = state.completed.length;
  return { done, total, percent: Math.round((done / total) * 100) };
}

/** Liste des étapes avec leur statut (pour l'affichage du parcours). */
export function stepsWithStatus(
  state: GuidanceState,
): { step: PathStep; status: StepStatus }[] {
  return PATH_STEPS.map((step) => ({
    step,
    status: stepStatus(state, step.id),
  }));
}

/** Vrai si le parcours est entièrement terminé. */
export function isComplete(state: GuidanceState): boolean {
  return state.completed.length === PATH_STEPS.length;
}

/** Réinitialise la progression en conservant le profil. */
export function resetGuidance(): GuidanceState {
  return { ...INITIAL_GUIDANCE, completed: [] };
}
