import type { Question, SportProfile } from '../types';

/**
 * QCM adaptatif — Écran 01 « Discover Me »
 * Une question à la fois, retour arrière, progression,
 * questions conditionnelles selon les réponses.
 */

export const QUESTIONS: Question[] = [
  {
    id: 'level',
    title: 'Quel est votre niveau sportif actuel ?',
    hint: 'Cela nous permet d’adapter les explications, le rythme et le niveau de détail.',
    why: 'Votre niveau nous aide à : adapter la difficulté des explications, choisir les bons repères techniques, vous proposer un parcours progressif et motivant.',
    options: [
      {
        value: 'debutant',
        label: 'Débutant·e',
        description: 'Je recommence ou je découvre ces mouvements.',
        icon: '🌱',
      },
      {
        value: 'intermediaire',
        label: 'Intermédiaire',
        description: 'Je pratique une activité physique de façon régulière.',
        icon: '📊',
      },
      {
        value: 'confirme',
        label: 'Confirmé·e',
        description: 'Je m’entraîne régulièrement et je souhaite affiner ma technique.',
        icon: '📈',
      },
      {
        value: 'avance',
        label: 'Avancé·e',
        description: 'Je suis à l’aise et je veux approfondir les aspects techniques.',
        icon: '🏆',
      },
    ],
  },
  {
    id: 'activities',
    title: 'Quelles pratiques vous plaisent le plus ?',
    hint: 'Plusieurs réponses possibles. Nous les utilisons pour contextualiser les exemples.',
    why: 'Vos pratiques nous servent à choisir des images de référence qui vous ressemblent.',
    multi: true,
    options: [
      { value: 'fitness', label: 'Fitness / musculation', icon: '🏋️' },
      { value: 'running', label: 'Course à pied', icon: '🏃' },
      { value: 'yoga', label: 'Yoga / mobilité', icon: '🧘' },
      { value: 'team', label: 'Sports collectifs', icon: '⚽' },
      { value: 'none', label: 'Je débute tout doucement', icon: '🌱' },
    ],
  },
  {
    id: 'goal',
    title: 'Quel est votre objectif principal ?',
    hint: 'Nous l’utilisons pour hiérarchiser les bénéfices présentés.',
    why: 'Un objectif clair évite la surcharge d’information : nous montrons d’abord ce qui compte pour vous.',
    options: [
      { value: 'renforcement', label: 'Renforcer mon corps', description: 'Cuisses, fessiers, haut du corps.', icon: '💪' },
      { value: 'mobilite', label: 'Gagner en mobilité', description: 'Amplitude et souplesse.', icon: '🌀' },
      { value: 'perte-poids', label: 'Me remettre en forme', description: 'Endurance et dépense énergétique.', icon: '🔥' },
      { value: 'technique', label: 'Peaufiner ma technique', description: 'Précision et contrôle du mouvement.', icon: '🎯' },
      { value: 'relaxation', label: 'Me détendre', description: 'Respiration, posture, calme.', icon: '🌙' },
    ],
  },
  {
    id: 'motion',
    title: 'Quel mouvement voulez-vous explorer en premier ?',
    hint: 'Vous pourrez changer de mouvement à tout moment depuis le laboratoire.',
    why: 'Votre premier choix détermine le contenu initial de votre parcours.',
    options: [
      { value: 'squat', label: 'Squat', description: 'Mouvement de base pour les jambes et le tronc.', icon: '🏃' },
      { value: 'pompes', label: 'Pompes', description: 'Mouvement au sol pour le haut du corps.', icon: '💪' },
      { value: 'yoga', label: 'Yoga — Tadasana', description: 'Posture statique d’alignement.', icon: '🧘' },
    ],
  },
  {
    id: 'preference',
    title: 'Comment préférez-vous être guidé·e ?',
    hint: 'Vous pourrez basculer entre les deux modes à tout moment.',
    why: 'Les deux modes contiennent la même information fondamentale : seul le niveau de détail change.',
    options: [
      {
        value: 'essentiel',
        label: 'Essentiel',
        description: 'Des consignes courtes, centrées sur les repères principaux.',
        icon: '🍃',
      },
      {
        value: 'guide',
        label: 'Guidé',
        description: 'Des explications détaillées et des éléments contextuels supplémentaires.',
        icon: '🧭',
      },
    ],
  },
];

/** Questions visibles selon les réponses déjà données */
export function visibleQuestions(
  answers: Partial<Record<string, string | string[]>>,
): Question[] {
  return QUESTIONS.filter((q) => {
    if (!q.visibleIf) return true;
    const single: Partial<Record<string, string>> = {};
    for (const [k, v] of Object.entries(answers)) {
      if (typeof v === 'string') single[k] = v;
    }
    return q.visibleIf(single);
  });
}

/**
 * Construit un profil à partir des réponses.
 * Renvoie null tant que les questions obligatoires ne sont pas toutes répondues.
 */
export function buildProfile(
  answers: Partial<Record<string, string | string[]>>,
): SportProfile | null {
  const level = answers.level;
  const goal = answers.goal;
  const motion = answers.motion;
  const preference = answers.preference;

  if (
    typeof level !== 'string' ||
    typeof goal !== 'string' ||
    typeof motion !== 'string' ||
    typeof preference !== 'string'
  ) {
    return null;
  }

  const activities = Array.isArray(answers.activities) ? answers.activities : [];

  return {
    level: level as SportProfile['level'],
    activities,
    goal: goal as SportProfile['goal'],
    motion: motion as SportProfile['motion'],
    preference: preference as SportProfile['preference'],
  };
}
