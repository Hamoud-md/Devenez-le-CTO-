import type { Movement, MotionId } from '../types';

/**
 * Données pédagogiques des mouvements.
 * Sources : recommandations générales de préparation physique
 * (formes classiques du squat, de la pompé et de la Tadasana).
 * Voir README pour le détail des références.
 */

const squat: Movement = {
  id: 'squat',
  name: 'Squat',
  tagline: 'Renforce les jambes, les hanches et le tronc.',
  description:
    'Un mouvement de base pour renforcer les jambes, les fessiers et améliorer la posture.',
  benefits: [
    'Renforce cuisses et fessiers',
    'Améliore la stabilité et l’équilibre',
    'Soutient une bonne posture au quotidien',
  ],
  duration: 5,
  phases: [
    {
      id: 'preparation',
      index: 1,
      name: 'Préparation',
      cueEssential: 'Placez les pieds à largeur de hanches, bras tendus devant.',
      cueGuided:
        'Placez les pieds légèrement plus larges que les hanches, pointes légèrement ouvertes. Engagez le tronc, levez les bras devant vous pour l’équilibre, le regard droit devant.',
      start: 0,
      end: 1,
      keyPoints: [
        'Pieds à largeur de hanches',
        'Poids réparti sur tout le pied',
        'Regard devant, dos droit',
      ],
      avoid: ['Pieds trop serrés', 'Genous qui rentrent vers l’intérieur'],
      tip: 'Imaginez une corde qui tire légèrement votre sommet de crâne vers le haut.',
    },
    {
      id: 'descente',
      index: 2,
      name: 'Descente',
      cueEssential: 'Poussez les hanches en arrière et pliez les genoux, contrôlez la descente.',
      cueGuided:
        'Initiez le mouvement en poussant les hanches vers l’arrière, comme pour vous asseoir sur une chaise. Gardez la poitrine ouverte et le dos droit, les genoux suivent la direction des pointes de pieds.',
      start: 1,
      end: 2,
      keyPoints: [
        'Hanches en arrière d’abord',
        'Dos droit, poitrine ouverte',
        'Genoux dans l’axe des pieds',
      ],
      avoid: ['Arrondir le dos', 'Laisser les genoux avancer trop loin', 'Décoller les talons'],
      tip: 'Imaginez que vous vous asseyez sur une chaise invisible.',
    },
    {
      id: 'position-basse',
      index: 3,
      name: 'Position basse',
      cueEssential: 'Descendez jusqu’à ce que les cuisses soient presque parallèles au sol.',
      cueGuided:
        'Vous êtes au point le plus bas du squat. Les hanches sont reculées, les genoux alignés avec les pieds, et le dos reste droit. Les quadriceps et les fessiers travaillent fortement.',
      start: 2,
      end: 3,
      keyPoints: [
        'Cuisses presque parallèles au sol',
        'Genoux dans l’axe des pieds (ni vers l’intérieur, ni vers l’extérieur)',
        'Poids réparti sur tout le pied',
      ],
      avoid: ['Genoux qui se touchent', 'Talons qui se décollent', 'Torse qui s’effondre'],
      tip: 'La profondeur dépend de votre mobilité : visez le contrôle plutôt que la profondeur.',
    },
    {
      id: 'remontee',
      index: 4,
      name: 'Remontée',
      cueEssential: 'Poussez dans vos pieds pour remonter en gardant l’alignement.',
      cueGuided:
        'Poussez fermement à travers les pieds, en gardant les genoux alignés. Contractez les fessiers en haut du mouvement. Le tronc reste engagé pendant toute la remontée.',
      start: 3,
      end: 4,
      keyPoints: [
        'Poussée à travers tout le pied',
        'Genoux stables, alignés',
        'Tronc engagé, dos droit',
      ],
      avoid: ['Verrouiller brutalement les genoux', 'Avancer les hanches plus vite que la poitrine'],
      tip: 'Pensez à « pousser le sol » plutôt que « tirer » avec les jambes.',
    },
    {
      id: 'fin',
      index: 5,
      name: 'Fin',
      cueEssential: 'Revenez à la position debout, respirez et recommencez.',
      cueGuided:
        'Revenez à la position de départ debout, épaules relâchées. Inspirez avant chaque répétition, expirez à l’effort. Prenez le temps de vous stabiliser.',
      start: 4,
      end: 5,
      keyPoints: [
        'Debout, stable',
        'Respiration maîtrisée',
        'Prêt·e pour la répétition suivante',
      ],
      tip: 'Deux secondes de récupération suffisent entre deux répétitions.',
    },
  ],
  hotspots: [
    {
      id: 'posture-spine',
      label: 'Posture & colonne',
      position: [0, 1.55, -0.12],
      phases: ['preparation', 'descente', 'position-basse', 'remontee'],
      essential: 'Gardez le dos droit et la poitrine ouverte.',
      guided:
        'La colonne reste neutre pendant tout le mouvement : ni arrondie, ni cambrée. Le tronc engagé protège le bas du dos.',
      anatomyRegion: 'dos',
    },
    {
      id: 'glutes',
      label: 'Fessiers',
      position: [-0.28, 0.95, -0.22],
      phases: ['descente', 'position-basse', 'remontee'],
      essential: 'Moteur principal de la remontée.',
      guided:
        'Les fessiers assurent la stabilité des hanches à la descente et la puissance de la poussée à la remontée.',
      anatomyRegion: 'fessiers',
    },
    {
      id: 'quadriceps',
      label: 'Quadriceps',
      position: [0.3, 0.75, 0.12],
      phases: ['descente', 'position-basse', 'remontee'],
      essential: 'Prolongez les genoux en remontant.',
      guided:
        'Les quadriceps (avant de la cuisse) freinent la descente puis étendent le genou pour vous relever.',
      anatomyRegion: 'quadriceps',
    },
    {
      id: 'knees',
      label: 'Genoux',
      position: [0.3, 0.5, 0.16],
      phases: ['descente', 'position-basse', 'remontee'],
      essential: 'Alignés avec les pieds, ni vers l’intérieur ni vers l’extérieur.',
      guided:
        'Gardez le genou dans la même direction que le pied pour protéger l’articulation. À la position basse, l’angle est d’environ 90° selon votre mobilité.',
      anatomyRegion: 'genoux',
    },
    {
      id: 'feet',
      label: 'Appui plantaire',
      position: [0.2, 0.05, 0.1],
      phases: ['preparation', 'descente', 'position-basse', 'remontee', 'fin'],
      essential: 'Poids réparti sur tout le pied, talons au sol.',
      guided:
        'Une base stable : poids réparti entre l’avant-pied et le talon, orteils actifs. Les talons ne se décollent jamais.',
      anatomyRegion: 'pieds',
    },
  ],
  muscles: [
    { name: 'Quadriceps', role: 'avant de la cuisse' },
    { name: 'Fessiers', role: 'stabilité et puissance' },
    { name: 'Ischio-jambiers', role: 'contrôle du mouvement' },
  ],
  fallbackIllustration:
    'Illustration séquentielle : debout → hanches en arrière → cuisses parallèles → remontée → debout.',
  license: 'Contenu pédagogique original — The Living Motion Atlas (2025)',
  credits: 'Rédigé pour la Nuit de l’Info 2025, défi Santé Posturale.',
};

const pompes: Movement = {
  id: 'pompes',
  name: 'Pompes',
  tagline: 'Renforce le haut du corps et le tronc.',
  description: 'Un mouvement au sol pour renforcer pectoraux, triceps et abdominaux.',
  benefits: [
    'Renforce pectoraux et triceps',
    'Sollicite le tronc en stabilité',
    'Améliore la coordination du haut du corps',
  ],
  duration: 5,
  phases: [
    {
      id: 'preparation',
      index: 1,
      name: 'Préparation',
      cueEssential: 'Mains sous les épaules, corps aligné de la tête aux talons.',
      cueGuided:
        'Placez les mains légèrement plus larges que les épaules. Le corps forme une ligne droite : tête, épaules, hanches et talons alignés. Le tronc est engagé, les fessiers contractés.',
      start: 0,
      end: 1,
      keyPoints: ['Mains sous les épaules', 'Corps aligné', 'Tronc engagé'],
      avoid: ['Fessiers qui s’affaissent', 'Élargir les mains trop loin'],
      tip: 'Contractez les abdominaux comme pour recevoir une petite frappe.',
    },
    {
      id: 'descente',
      index: 2,
      name: 'Descente',
      cueEssential: 'Pliez les coudes et descendez le corps en restant aligné.',
      cueGuided:
        'Les coudes partent vers l’arrière à environ 45° du corps, pas écartés à 90°. Le torse descend d’un bloc, sans rompre l’alignement.',
      start: 1,
      end: 2,
      keyPoints: ['Coudes à 45°', 'Corps d’une seule pièce', 'Descendre en contrôle'],
      avoid: ['Coudes écartés à 90°', 'Menton qui part en avant'],
      tip: 'Descendez jusqu’à ce que la poitrine approche le sol, sans le toucher brutalement.',
    },
    {
      id: 'position-basse',
      index: 3,
      name: 'Position basse',
      cueEssential: 'Poitrine proche du sol, corps toujours aligné.',
      cueGuided:
        'Position basse : poitrine à quelques centimètres du sol, coudes fléchis, ligne corps toujours droite. Les pectoraux et les triceps sont en tension maximale.',
      start: 2,
      end: 3,
      keyPoints: ['Poitrine proche du sol', 'Ligne droite maintenue', 'Cou relâché'],
      avoid: ['Hanches qui tombent', 'Bassin qui remonte en premier'],
      tip: 'Si l’alignement se rompt, reposez les genoux : la qualité prime sur le nombre.',
    },
    {
      id: 'remontee',
      index: 4,
      name: 'Remontée',
      cueEssential: 'Poussez dans vos mains pour remonter en gardant le tronc ferme.',
      cueGuided:
        'Poussez dans le sol à travers les paumes, les coudes se referment vers le corps. Le tronc reste rigidement aligné pendant toute la poussée.',
      start: 3,
      end: 4,
      keyPoints: ['Poussée à travers les paumes', 'Tronc ferme', 'Épaules basses'],
      avoid: ['Épaules qui remontent vers les oreilles'],
      tip: 'Imaginez que vous éloignez le sol de vous.',
    },
    {
      id: 'fin',
      index: 5,
      name: 'Fin',
      cueEssential: 'Bras tendus, alignement retrouvé, respirez.',
      cueGuided:
        'Bras tendus en haut du mouvement, épaules stables loin des oreilles. Inspirez à la descente, expirez à la poussée.',
      start: 4,
      end: 5,
      keyPoints: ['Bras tendus', 'Épaules stables', 'Respiration rythmée'],
      tip: 'Une pause d’une seconde en haut recentre la posture.',
    },
  ],
  hotspots: [
    {
      id: 'shoulders',
      label: 'Épaules',
      position: [0.4, 1.4, 0.1],
      phases: ['preparation', 'descente', 'remontee'],
      essential: 'Épaules stables, loin des oreilles.',
      guided:
        'Les épaules restent basses et stables : les omoplates se rapprochent légèrement à la descente.',
      anatomyRegion: 'epaules',
    },
    {
      id: 'chest',
      label: 'Pectoraux',
      position: [0, 1.25, 0.22],
      phases: ['descente', 'position-basse', 'remontee'],
      essential: 'Muscle moteur de la poussée.',
      guided: 'Les pectoraux assurent la poussée ; les triceps assistent à l’extension des coudes.',
      anatomyRegion: 'pectoraux',
    },
    {
      id: 'arms',
      label: 'Triceps',
      position: [0.42, 1.1, 0.05],
      phases: ['descente', 'remontee', 'fin'],
      essential: 'Prolongez les bras en remontant.',
      guided: 'Les triceps (arrière du bras) étendent le coude lors de la remontée.',
      anatomyRegion: 'triceps',
    },
    {
      id: 'core',
      label: 'Tronc',
      position: [0, 1.0, -0.05],
      phases: ['preparation', 'descente', 'position-basse', 'remontee'],
      essential: 'Gardez les abdominaux engagés.',
      guided: 'Un tronc engagé évite l’affaissement du bassin et protège le bas du dos.',
      anatomyRegion: 'abdominaux',
    },
    {
      id: 'feet',
      label: 'Appui',
      position: [0, 0.1, -0.55],
      phases: ['preparation', 'descente', 'position-basse', 'remontee', 'fin'],
      essential: 'Sur la pointe des pieds, corps aligné.',
      guided: 'Les orteils actifs et les talons poussés vers l’arrière complètent la ligne droite.',
      anatomyRegion: 'pieds',
    },
  ],
  muscles: [
    { name: 'Pectoraux', role: 'poussée' },
    { name: 'Triceps', role: 'extension des coudes' },
    { name: 'Abdominaux', role: 'stabilité du tronc' },
  ],
  fallbackIllustration:
    'Illustration séquentielle : appui → descente → poitrine proche du sol → poussée → bras tendus.',
  license: 'Contenu pédagogique original — The Living Motion Atlas (2025)',
  credits: 'Rédigé pour la Nuit de l’Info 2025, défi Santé Posturale.',
};

const yoga: Movement = {
  id: 'yoga',
  name: 'Yoga — Tadasana',
  tagline: 'Posture d’alignement : l’essentiel de la posture debout.',
  description: 'Une posture statique pour découvrir l’alignement du corps debout.',
  benefits: [
    'Prend conscience de sa posture',
    'Améliore l’alignement naturel',
    'Développe la stabilité et la respiration',
  ],
  duration: 5,
  phases: [
    {
      id: 'preparation',
      index: 1,
      name: 'Installation',
      cueEssential: 'Debout, pieds joints ou légèrement écartés, bras le long du corps.',
      cueGuided:
        'Tenez-vous debout, pieds parallèles à largeur de bassin. Les bras pendent librement le long du corps, paumes tournées vers l’avant, regard fixé devant vous.',
      start: 0,
      end: 1.5,
      keyPoints: ['Pieds parallèles', 'Poids équilibré', 'Regard devant'],
      tip: 'Fermez brièvement les yeux pour sentir votre point d’appui.',
    },
    {
      id: 'alignement',
      index: 2,
      name: 'Alignement',
      cueEssential: 'Alignez cheville, hanche, épaule et tête sur une ligne verticale.',
      cueGuided:
        'Imaginez une ligne verticale passant par vos chevilles, hanches, épaules et le sommet de votre crâne. Le bassin est neutre, ni basculé en avant ni en arrière.',
      start: 1.5,
      end: 3,
      keyPoints: [
        'Ligne verticale cheville → crâne',
        'Bassin neutre',
        'Épaules ouvertes',
      ],
      avoid: ['Cambrure excessive du bas du dos', 'Épaules qui remontent'],
      tip: 'La corde imaginaire au sommet du crâne allonge légèrement la colonne.',
    },
    {
      id: 'stabilite',
      index: 3,
      name: 'Stabilité',
      cueEssential: 'Ancrez les pieds, contractez doucement les cuisses et le tronc.',
      cueGuided:
        'Activez les quadriceps sans verrouiller les genoux. Les abdominaux se rappellent doucement. Les fessiers participent sans serrer exagérément.',
      start: 3,
      end: 4,
      keyPoints: [
        'Ancrage des pieds',
        'Cuisses actives sans crispation',
        'Tronc léger mais présent',
      ],
      avoid: ['Verrouillage des genoux', 'Apnée'],
      tip: 'Si vous tremblez un peu, c’est parfait : votre corps apprend l’équilibre.',
    },
    {
      id: 'respiration',
      index: 4,
      name: 'Respiration',
      cueEssential: 'Respirez calmement : inspirez par le nez, expirez lentement.',
      cueGuided:
        'Laissez la respiration devenir naturelle et profonde. Inspirez par le nez en gonflant les côtes, expirez lentement. Restez 5 à 10 cycles de respiration.',
      start: 4,
      end: 5,
      keyPoints: [
        'Respiration nasale',
        'Épaules relâchées',
        'Visage détendu',
      ],
      tip: 'Comptez mentalement : 4 temps d’inspiration, 6 temps d’expiration.',
    },
  ],
  hotspots: [
    {
      id: 'crown',
      label: 'Sommet du crâne',
      position: [0, 1.78, 0],
      phases: ['preparation', 'alignement', 'stabilite', 'respiration'],
      essential: 'Comme tiré vers le haut par une corde.',
      guided: 'Le sommet du crâne s’allonge vers le haut : la nuque reste longue et dégagée.',
    },
    {
      id: 'shoulders',
      label: 'Épaules',
      position: [0.38, 1.45, 0],
      phases: ['alignement', 'stabilite', 'respiration'],
      essential: 'Épaules basses et ouvertes.',
      guided: 'Les épaules roulent doucement vers l’arrière et descendent, libérant la poitrine.',
      anatomyRegion: 'epaules',
    },
    {
      id: 'pelvis',
      label: 'Bassin',
      position: [0, 1.0, 0],
      phases: ['alignement', 'stabilite'],
      essential: 'Bassin neutre, ni basculé.',
      guided: 'Le bassin est neutre : la ligne des os iliaques reste à peu près verticale, sans cambrure forcée.',
      anatomyRegion: 'abdominaux',
    },
    {
      id: 'knees',
      label: 'Genoux',
      position: [0.16, 0.55, 0.05],
      phases: ['stabilite', 'respiration'],
      essential: 'Actifs mais pas verrouillés.',
      guided: 'Les quadriceps sont actifs mais les genoux ne sont pas hyper-extensionnés.',
      anatomyRegion: 'genoux',
    },
    {
      id: 'feet',
      label: 'Points d’appui',
      position: [0.14, 0.04, 0.08],
      phases: ['preparation', 'alignement', 'stabilite', 'respiration'],
      essential: 'Poids réparti sur les trois points du pied.',
      guided:
        'Le poids se répartit entre le gros orteil, le petit orteil et le talon : une base triangulaire stable.',
      anatomyRegion: 'pieds',
    },
  ],
  muscles: [
    { name: 'Quadriceps', role: 'stabilité debout' },
    { name: 'Érecteurs du rachis', role: 'alignement de la colonne' },
    { name: 'Transverse abdominal', role: 'gainage léger' },
  ],
  fallbackIllustration:
    'Illustration : silhouette debout, ligne verticale d’alignement cheville → hanche → épaule → crâne.',
  license: 'Contenu pédagogique original — The Living Motion Atlas (2025)',
  credits: 'Rédigé pour la Nuit de l’Info 2025, défi Santé Posturale.',
};

export const MOVEMENTS: Record<MotionId, Movement> = {
  squat,
  pompes,
  yoga,
};

export const MOVEMENT_LIST: Movement[] = [squat, pompes, yoga];

export function getMovement(id: MotionId): Movement {
  return MOVEMENTS[id];
}
