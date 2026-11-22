import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  DetailMode,
  GuidanceState,
  PathStepId,
  SavedProgress,
  SportProfile,
} from '../types';
import { buildProfile } from '../data/questions';
import { completeStep, goToStep, INITIAL_GUIDANCE, progress, stepStatus } from './guidance';
import { clearProgress, loadProgress, saveProgress } from './persistence';

interface AppState {
  /* Profil */
  answers: Record<string, string | string[]>;
  setAnswer: (questionId: string, value: string | string[]) => void;
  profile: SportProfile | null;
  saveProfile: () => void;
  clearProfile: () => void;

  /* Parcours */
  guidance: GuidanceState;
  completeStep: (step: PathStepId) => void;
  goToStep: (step: PathStepId) => void;
  stepStatus: (step: PathStepId) => ReturnType<typeof stepStatus>;
  progress: ReturnType<typeof progress>;

  /* Préférences */
  detailMode: DetailMode;
  setDetailMode: (mode: DetailMode) => void;
  anatomyLayer: boolean;
  setAnatomyLayer: (v: boolean) => void;
  hotspotsEnabled: boolean;
  setHotspotsEnabled: (v: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;

  /* Quiz */
  quizAnswers: Record<string, number>;
  setQuizAnswer: (questionId: string, choice: number) => void;

  /* Divers */
  saved: boolean;
  resetAll: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [initial] = useState<SavedProgress>(() => loadProgress());
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [profile, setProfile] = useState<SportProfile | null>(initial.profile);
  const [guidance, setGuidance] = useState<GuidanceState>(initial.guidance);
  const [detailMode, setDetailMode] = useState<DetailMode>(initial.detailMode);
  const [anatomyLayer, setAnatomyLayer] = useState(initial.anatomyLayer);
  const [hotspotsEnabled, setHotspotsEnabled] = useState(initial.hotspotsEnabled);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>(initial.quizAnswers);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [saved, setSaved] = useState(true);

  // Préférence système : prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Persistance automatique
  useEffect(() => {
    const data: SavedProgress = {
      profile,
      guidance,
      detailMode,
      anatomyLayer,
      hotspotsEnabled,
      quizAnswers,
      completedPhases: {},
      version: 1,
    };
    setSaved(saveProgress(data));
  }, [profile, guidance, detailMode, anatomyLayer, hotspotsEnabled, quizAnswers]);

  const setAnswer = useCallback((questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const saveProfile = useCallback(() => {
    const built = buildProfile(answers);
    if (built) setProfile(built);
  }, [answers]);

  const clearProfile = useCallback(() => {
    setProfile(null);
    setAnswers({});
  }, []);

  const completeGuidanceStep = useCallback((step: PathStepId) => {
    setGuidance((prev) => completeStep(prev, step));
  }, []);

  const navigateStep = useCallback((step: PathStepId) => {
    setGuidance((prev) => goToStep(prev, step));
  }, []);

  const statusOf = useCallback(
    (step: PathStepId) => stepStatus(guidance, step),
    [guidance],
  );

  const setQuizAnswer = useCallback((questionId: string, choice: number) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: choice }));
  }, []);

  const resetAll = useCallback(() => {
    clearProgress();
    setAnswers({});
    setProfile(null);
    setGuidance(INITIAL_GUIDANCE);
    setDetailMode('guide');
    setAnatomyLayer(false);
    setHotspotsEnabled(true);
    setQuizAnswers({});
  }, []);

  const value = useMemo<AppState>(
    () => ({
      answers,
      setAnswer,
      profile,
      saveProfile,
      clearProfile,
      guidance,
      completeStep: completeGuidanceStep,
      goToStep: navigateStep,
      stepStatus: statusOf,
      progress: progress(guidance),
      detailMode,
      setDetailMode,
      anatomyLayer,
      setAnatomyLayer,
      hotspotsEnabled,
      setHotspotsEnabled,
      reducedMotion,
      setReducedMotion,
      quizAnswers,
      setQuizAnswer,
      saved,
      resetAll,
    }),
    [
      answers,
      setAnswer,
      profile,
      saveProfile,
      clearProfile,
      guidance,
      completeGuidanceStep,
      navigateStep,
      statusOf,
      detailMode,
      anatomyLayer,
      hotspotsEnabled,
      reducedMotion,
      quizAnswers,
      setQuizAnswer,
      saved,
      resetAll,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
