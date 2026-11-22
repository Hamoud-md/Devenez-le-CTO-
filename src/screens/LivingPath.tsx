import { useApp } from '../engine/store';
import { PATH_STEPS } from '../data/content';
import { LEVEL_LABELS, GOAL_LABELS, PREFERENCE_LABELS } from '../data/content';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import type { PathStepId } from '../types';
import './LivingPath.css';

interface LivingPathProps {
  onNavigate: (screen: 'discover' | 'lab' | 'guide') => void;
}

const STEP_ICONS: Record<PathStepId, string> = {
  profil: '📋',
  preparation: '⏱️',
  decouverte: '🎬',
  exploration: '🧊',
  revision: '🎯',
};

export function LivingPath({ onNavigate }: LivingPathProps) {
  const { profile, guidance, stepStatus, completeStep, goToStep, progress } = useApp();

  const currentStepData = PATH_STEPS.find((s) => s.id === guidance.currentStep);
  const nextStep = PATH_STEPS.find(
    (s) => s.index === (currentStepData?.index ?? 1) + 1,
  );

  const handleOpen = (id: PathStepId) => {
    const status = stepStatus(id);
    if (status === 'locked') return;

    goToStep(id);

    switch (id) {
      case 'profil':
        onNavigate('discover');
        break;
      case 'preparation':
      case 'decouverte':
      case 'exploration':
        onNavigate('lab');
        break;
      case 'revision':
        onNavigate('guide');
        break;
    }
  };

  const handleContinue = () => {
    if (!currentStepData) return;
    // Termine l'étape courante puis ouvre la suivante
    completeStep(currentStepData.id);
    const after = PATH_STEPS.find((s) => s.index === currentStepData.index + 1);
    if (after) {
      switch (after.id) {
        case 'profil':
          onNavigate('discover');
          break;
        case 'revision':
          onNavigate('guide');
          break;
        default:
          onNavigate('lab');
      }
    } else {
      onNavigate('guide');
    }
  };

  return (
    <div className="path screen anim-fade-up">
      <header className="path__header">
        <div>
          <p className="path__eyebrow">Écran 02 — Personalized Learning Journey</p>
          <h1 className="path__title">
            <span aria-hidden="true">🗺️</span> My Living Path
          </h1>
          <p className="path__subtitle">Mon parcours d’apprentissage personnalisé</p>
        </div>
        <div className="path__silhouettes" aria-hidden="true">
          <span>🧍</span>
          <span>🧎</span>
          <span>🏃</span>
        </div>
      </header>

      {/* Carte profil */}
      <Card className="path__profile-card" padding="md">
        <div className="path__profile-icon" aria-hidden="true">
          🏃
        </div>
        <div className="path__profile-body">
          <h2>
            Mon parcours :{' '}
            <em>
              {profile
                ? profile.motion === 'squat'
                  ? 'Squat'
                  : profile.motion === 'pompes'
                    ? 'Pompes'
                    : 'Yoga — Tadasana'
                : 'à définir'}
            </em>
          </h2>
          <p>
            {profile ? (
              <>
                {LEVEL_LABELS[profile.level]} · {GOAL_LABELS[profile.goal]} ·{' '}
                {PREFERENCE_LABELS[profile.preference]}
              </>
            ) : (
              'Complétez le questionnaire pour personnaliser votre parcours.'
            )}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => onNavigate('discover')}>
          ✏️ Modifier
        </Button>
      </Card>

      {/* Étapes */}
      <ol className="path__steps">
        {PATH_STEPS.map((step) => {
          const status = stepStatus(step.id);
          const isCurrent = guidance.currentStep === step.id;
          return (
            <li key={step.id} className="path__step-item">
              <div
                className={`path__node path__node--${status}`}
                aria-hidden="true"
              >
                {status === 'done' ? '✓' : status === 'locked' ? '🔒' : STEP_ICONS[step.id]}
              </div>
              <button
                type="button"
                className={`path__step path__step--${status} ${isCurrent ? 'is-current' : ''}`}
                onClick={() => handleOpen(step.id)}
                disabled={status === 'locked'}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span className="path__step-main">
                  <strong>
                    {step.index}. {step.title}
                  </strong>
                  <small>{step.description}</small>
                </span>
                <span className={`path__badge path__badge--${status}`}>
                  {status === 'done' && '✓ Terminé'}
                  {status === 'active' && '▶ En cours'}
                  {status === 'available' && 'Disponible'}
                  {status === 'locked' && 'À venir'}
                </span>
                <span className="path__chevron" aria-hidden="true">
                  ›
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Avancement */}
      <Card className="path__progress-card" padding="md">
        <div className="path__progress-label">
          <strong>Mon avancée</strong>
          <span>
            {progress.done} / {progress.total} étapes
          </span>
        </div>
        <ProgressBar
          value={progress.percent}
          showPercent
          tone="mint"
          label="Progression du parcours"
        />
        <div className="path__continue">
          <p>
            {currentStepData
              ? `Prochaine action : ${currentStepData.title} — ${currentStepData.description}.`
              : 'Parcours terminé, bravo !'}
          </p>
          <Button variant="primary" onClick={handleContinue} iconEnd="→">
            {nextStep ? `Continuer vers ${nextStep.title}` : 'Voir mon résumé'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
