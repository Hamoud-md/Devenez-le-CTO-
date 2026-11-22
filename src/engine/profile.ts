import type { SportProfile } from '../types';
import { buildProfile } from '../data/questions';

export type { SportProfile };

/**
 * Profile Engine — traitement des réponses du QCM.
 */

/** Règles de personnalisation testables (AC-02). */

export interface PersonalizationRule {
  id: string;
  /** Vrai si la règle s'applique au profil */
  match: (profile: SportProfile) => boolean;
  /** Instruction textuelle produite */
  instruction: string;
}

export const PERSONALIZATION_RULES: PersonalizationRule[] = [
  {
    id: 'beginner-slow',
    match: (p) => p.level === 'debutant',
    instruction:
      'Prenez le temps : une seule phase à la fois, sans vous soucier de la vitesse.',
  },
  {
    id: 'intermediate-control',
    match: (p) => p.level === 'intermediaire',
    instruction:
      'Concentrez-vous sur le contrôle du mouvement plutôt que sur le nombre de répétitions.',
  },
  {
    id: 'advanced-precision',
    match: (p) => p.level === 'confirme' || p.level === 'avance',
    instruction:
      'Affinez la précision : angles, timing et respiration font la différence.',
  },
  {
    id: 'strength-goal',
    match: (p) => p.goal === 'renforcement',
    instruction:
      'Cherchez la tension constante sur toute l’amplitude du mouvement.',
  },
  {
    id: 'mobility-goal',
    match: (p) => p.goal === 'mobilite' || p.goal === 'relaxation',
    instruction:
      'Privilégiez l’amplitude confortable et une respiration lente et régulière.',
  },
  {
    id: 'technique-goal',
    match: (p) => p.goal === 'technique',
    instruction:
      'Rejouez chaque phase et comparez votre exécution aux repères clés affichés.',
  },
  {
    id: 'essential-preference',
    match: (p) => p.preference === 'essentiel',
    instruction: 'Mode Essentiel : gardez les 3 repères principaux en tête.',
  },
  {
    id: 'guided-preference',
    match: (p) => p.preference === 'guide',
    instruction:
      'Mode Guidé : lisez les explications détaillées avant de passer à la phase suivante.',
  },
];

/** Applique les règles de personnalisation à un profil. */
export function personalize(profile: SportProfile): string[] {
  return PERSONALIZATION_RULES.filter((r) => r.match(profile)).map((r) => r.instruction);
}

/**
 * Indique si deux profils reçoivent des explications distinctes.
 * Utilisé par les tests (critère de réussite AC-01/AC-02).
 */
export function explanationsDiffer(a: SportProfile, b: SportProfile): boolean {
  const listA = personalize(a);
  const listB = personalize(b);
  return listA.join('|') !== listB.join('|');
}

export { buildProfile };
