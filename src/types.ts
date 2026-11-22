/**
 * Types partagés — The Living Motion Atlas
 */

/* ---------------- Profil & QCM ---------------- */

export type SportLevel = 'debutant' | 'intermediaire' | 'confirme' | 'avance';

export type Goal = 'renforcement' | 'mobilite' | 'perte-poids' | 'technique' | 'relaxation';

export type MotionId = 'squat' | 'pompes' | 'yoga';

export type LearningPreference = 'essentiel' | 'guide';

export interface SportProfile {
  level: SportLevel;
  activities: string[];
  goal: Goal;
  motion: MotionId;
  preference: LearningPreference;
}

export type ProfileKey = keyof SportProfile;

export type QuestionOptionValue = string;

export interface QuestionOption {
  value: QuestionOptionValue;
  label: string;
  description?: string;
  icon?: string;
  /** Masquer cette option selon les réponses déjà données */
  showIf?: (answers: Partial<Record<string, QuestionOptionValue>>) => boolean;
}

export interface Question {
  id: string;
  /** Intitulé */
  title: string;
  /** Sous-titre pédagogique */
  hint?: string;
  /** Pourquoi on pose la question */
  why?: string;
  options: QuestionOption[];
  /** Une seule réponse possible */
  multi?: boolean;
  /** Question conditionnelle : n'apparaît que si ces règles sont satisfaites */
  visibleIf?: (answers: Partial<Record<string, QuestionOptionValue>>) => boolean;
}

/* ---------------- Mouvements & phases ---------------- */

export type DetailMode = 'essentiel' | 'guide';

export interface Hotspot {
  id: string;
  /** Libellé court affiché sur le point */
  label: string;
  /** Position relative sur le modèle (unités normalisées -1..1) */
  position: [number, number, number];
  /** Phases pendant lesquelles le point est pertinent */
  phases: string[];
  /** Texte court (mode essentiel) */
  essential: string;
  /** Texte détaillé (mode guidé) */
  guided: string;
  /** Région anatomique optionnelle */
  anatomyRegion?: 'quadriceps' | 'fessiers' | 'ischio-jambiers' | 'dos' | 'genoux' | 'pieds' | 'triceps' | 'pectoraux' | 'abdominaux' | 'epaules';
}

export interface Phase {
  id: string;
  index: number;
  /** Nom affiché */
  name: string;
  /** Consigne courte (essentiel) */
  cueEssential: string;
  /** Consigne détaillée (guidé) */
  cueGuided: string;
  /** Secondes de début dans l'animation */
  start: number;
  /** Secondes de fin */
  end: number;
  /** Repères clés */
  keyPoints: string[];
  /** À éviter */
  avoid?: string[];
  /** Astuce contextuelle (mode guidé) */
  tip?: string;
}

export interface Movement {
  id: MotionId;
  name: string;
  tagline: string;
  description: string;
  benefits: string[];
  duration: number;
  phases: Phase[];
  hotspots: HotspotsList;
  muscles: { name: string; role: string }[];
  /** Illustration de repli si la 3D échoue */
  fallbackIllustration: string;
  license: string;
  credits: string;
}

export type HotspotsList = Hotspot[];

/* ---------------- Parcours ---------------- */

export type PathStepId =
  | 'profil'
  | 'preparation'
  | 'decouverte'
  | 'exploration'
  | 'revision';

export type StepStatus = 'locked' | 'available' | 'active' | 'done';

export interface PathStep {
  id: PathStepId;
  index: number;
  title: string;
  description: string;
}

export interface GuidanceState {
  currentStep: PathStepId;
  completed: PathStepId[];
}

/* ---------------- Knowledge Check ---------------- */

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/* ---------------- Équipements ---------------- */

export interface Equipment {
  id: string;
  name: string;
  benefit: string;
  price: string;
  url: string;
  icon: string;
  relatedMotions: MotionId[];
}

/* ---------------- Progression sauvegardée ---------------- */

export interface SavedProgress {
  profile: SportProfile | null;
  guidance: GuidanceState;
  detailMode: DetailMode;
  anatomyLayer: boolean;
  hotspotsEnabled: boolean;
  quizAnswers: Record<string, number>;
  completedPhases: Record<string, string[]>;
  version: number;
}
