import type { SavedProgress } from '../types';
import { INITIAL_GUIDANCE } from './guidance';

/**
 * Persistence Layer — sauvegarde locale (localStorage).
 * Aucune donnée ne quitte l'appareil.
 */

const STORAGE_KEY = 'tlma:progress:v1';
const CURRENT_VERSION = 1;

export const DEFAULT_PROGRESS: SavedProgress = {
  profile: null,
  guidance: INITIAL_GUIDANCE,
  detailMode: 'guide',
  anatomyLayer: false,
  hotspotsEnabled: true,
  quizAnswers: {},
  completedPhases: {},
  version: CURRENT_VERSION,
};

/** Lit la progression sauvegardée ; renvoie les valeurs par défaut si absentes/corrompues. */
export function loadProgress(): SavedProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<SavedProgress>;
    if (parsed.version !== CURRENT_VERSION) return DEFAULT_PROGRESS;
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      guidance: parsed.guidance ?? DEFAULT_PROGRESS.guidance,
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

/** Sauvegarde la progression. Renvoie false en cas d'échec (quota, mode privé). */
export function saveProgress(progress: SavedProgress): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

/** Efface toutes les données locales. */
export function clearProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignoré */
  }
}
