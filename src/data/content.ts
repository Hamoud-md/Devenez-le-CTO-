import type {
  Equipment,
  PathStep,
  QuizQuestion,
  SportLevel,
  SportProfile,
} from '../types';

/* ---------------- Parcours (Living Path) ---------------- */

export const PATH_STEPS: PathStep[] = [
  {
    id: 'profil',
    index: 1,
    title: 'Profil',
    description: 'Mon niveau, mes objectifs et mes préférences',
  },
  {
    id: 'preparation',
    index: 2,
    title: 'Préparation',
    description: 'Je prépare mon corps et j’adopte les bons repères',
  },
  {
    id: 'decouverte',
    index: 3,
    title: 'Découverte',
    description: 'Je découvre le mouvement et ses étapes clés',
  },
  {
    id: 'exploration',
    index: 4,
    title: 'Exploration',
    description: 'J’explore les détails, les zones clés et les explications',
  },
  {
    id: 'revision',
    index: 5,
    title: 'Révision',
    description: 'Je consolide mes acquis et je valide ma compréhension',
  },
];

/* ---------------- Knowledge Check ---------------- */

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'À quelle hauteur descendre lors d’un squat ?',
    options: [
      'Jusqu’à ce que les cuisses soient presque parallèles au sol.',
      'Le plus bas possible, sans limite.',
      'S’arrêter dès que les genoux se plient un peu.',
    ],
    correctIndex: 0,
    explanation:
      'La descente se poursuit jusqu’à ce que les cuisses soient presque parallèles au sol — ou jusqu’à la limite de votre mobilité, en gardant le dos droit.',
  },
  {
    id: 'q2',
    question: 'Que faire des genoux pendant la descente ?',
    options: [
      'Les laisser rentrer vers l’intérieur pour aller plus bas.',
      'Les garder dans l’axe des pieds, ni vers l’intérieur ni vers l’extérieur.',
      'Les pousser vers l’avant au-delà des pointes de pieds.',
    ],
    correctIndex: 1,
    explanation:
      'Les genoux suivent la direction des pointes de pieds : ni valgus (vers l’intérieur), ni poussée excessive vers l’avant.',
  },
  {
    id: 'q3',
    question: 'Où doit se répartir le poids du corps ?',
    options: [
      'Uniquement sur les orteils.',
      'Uniquement sur les talons.',
      'Sur tout le pied, talons au sol.',
    ],
    correctIndex: 2,
    explanation:
      'Le poids se répartit sur tout le pied, talons maintainus au sol, pour une base stable et une poussée efficace.',
  },
  {
    id: 'q4',
    question: 'Que signifie « le dos reste droit » ?',
    options: [
      'Une colonne rigide, parfaitement droite comme une planche.',
      'Une colonne neutre, ni arrondie ni surcambrée, le tronc engagé.',
      'Le torse penché en avant à 45° en permanence.',
    ],
    correctIndex: 1,
    explanation:
      'Le dos « droit » signifie en réalité neutre : la courbure naturelle est préservée, le tronc est engagé, la poitrine reste ouverte.',
  },
];

/* ---------------- Équipements Decathlon (liens publics) ---------------- */

export const EQUIPMENT: Equipment[] = [
  {
    id: 'mat',
    name: 'Tapis de fitness',
    benefit: 'Confort et stabilité',
    price: '14,99 €',
    url: 'https://www.decathlon.fr/browse/c0-tapis-de-sport/_/N-1yx4qjt',
    icon: '🧘',
    relatedMotions: ['yoga', 'pompes', 'squat'],
  },
  {
    id: 'bands',
    name: 'Bandes de résistance',
    benefit: 'Pour progresser en douceur',
    price: '9,99 €',
    url: 'https://www.decathlon.fr/browse/c0-elasques-et-bandes-de-musculation/_/N-1yx4trb',
    icon: '🎗️',
    relatedMotions: ['squat', 'pompes'],
  },
  {
    id: 'kettlebell',
    name: 'Kettlebell',
    benefit: 'Renforce tout le bas du corps',
    price: '19,99 €',
    url: 'https://www.decathlon.fr/browse/c0-kettlebells/_/N-1ykc9f2',
    icon: '🏋️',
    relatedMotions: ['squat'],
  },
  {
    id: 'shoes',
    name: 'Chaussures d’entraînement',
    benefit: 'Amorti et maintien',
    price: '39,99 €',
    url: 'https://www.decathlon.fr/browse/c0-chaussures-de-fitness/_/N-1yg5m1u',
    icon: '👟',
    relatedMotions: ['squat', 'pompes'],
  },
];

export function equipmentForMotion(motion: string): Equipment[] {
  const list = EQUIPMENT.filter((e) => e.relatedMotions.includes(motion as never));
  return list.length > 0 ? list : EQUIPMENT.slice(0, 3);
}

/* ---------------- Textes de personnalisation ---------------- */

export const LEVEL_LABELS: Record<SportLevel, string> = {
  debutant: 'Débutant·e',
  intermediaire: 'Intermédiaire',
  confirme: 'Confirmé·e',
  avance: 'Avancé·e',
};

export const GOAL_LABELS: Record<string, string> = {
  renforcement: 'Renforcement',
  mobilite: 'Mobilité',
  'perte-poids': 'Remise en forme',
  technique: 'Technique',
  relaxation: 'Relaxation',
};

export const PREFERENCE_LABELS: Record<string, string> = {
  essentiel: 'Explications essentielles',
  guide: 'Explications guidées',
};

/**
 * Résumé pédagogique personnalisé selon le profil.
 * Deux profils différents reçoivent des textes visiblement distincts (AC-02).
 */
export function personalizedSummary(profile: SportProfile): string {
  const goal = GOAL_LABELS[profile.goal] ?? profile.goal;
  const motion =
    profile.motion === 'squat'
      ? 'Squat'
      : profile.motion === 'pompes'
        ? 'Pompes'
        : 'Tadasana';

  const pace: Record<SportLevel, string> = {
    debutant:
      'Nous allons prendre le temps : chaque phase est décomposée, et la qualité du geste prime sur le nombre de répétitions.',
    intermediaire:
      'Vous connaissez déjà les bases : nous mettrons l’accent sur le contrôle et les points techniques fins.',
    confirme:
      'Vous pouvez travailler la précision : nous détaillerons les alignements et les appuis pour affiner votre exécution.',
    avance:
      'Nous irons droit aux détails techniques : angles, timing musculaire et variations de tempo.',
  };

  const goalLine: Record<string, string> = {
    renforcement: `Pour votre objectif « ${goal} », le ${motion} cible en priorité les grands groupes musculaires de la chaîne postérieure.`,
    mobilite: `Pour votre objectif « ${goal} », nous travaillerons l’amplitude contrôlée du ${motion}.`,
    'perte-poids': `Pour votre objectif « ${goal} », le ${motion} s’intègre bien dans des séries rythmées avec récupération courte.`,
    technique: `Pour votre objectif « ${goal} », chaque détail du ${motion} sera décortiqué phase par phase.`,
    relaxation: `Pour votre objectif « ${goal} », nous ralentirons le rythme du ${motion} pourcentrer sur la respiration et l’alignement.`,
  };

  const prefLine =
    profile.preference === 'essentiel'
      ? 'Vous avez choisi les explications essentielles : des consignes courtes, centrées sur les repères principaux.'
      : 'Vous avez choisi les explications guidées : des détails techniques et des contextes supplémentaires.';

  return `${pace[profile.level]} ${goalLine[profile.goal] ?? ''} ${prefLine}`;
}
