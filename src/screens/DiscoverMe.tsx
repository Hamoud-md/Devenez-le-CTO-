import { useMemo, useState } from 'react';
import { QUESTIONS, visibleQuestions } from '../data/questions';
import { useApp } from '../engine/store';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import './DiscoverMe.css';

/**
 * Écran 01 — Discover Me (Adaptive QCM).
 * Une question à la fois, retour arrière, progression,
 * questions conditionnelles selon les réponses.
 */

export function DiscoverMe({ onDone }: { onDone: () => void }) {
  const { answers, setAnswer, saveProfile, profile } = useApp();

  const visible = useMemo(() => visibleQuestions(answers), [answers]);
  const [index, setIndex] = useState(0);

  const current = visible[Math.min(index, visible.length - 1)];
  const isLast = index === visible.length - 1;
  const progressPercent = ((index + 1) / visible.length) * 100;

  const rawAnswer = answers[current.id];
  const selected = current.multi
    ? Array.isArray(rawAnswer)
      ? rawAnswer
      : []
    : typeof rawAnswer === 'string'
      ? [rawAnswer]
      : [];

  const answered = selected.length > 0;
  const canGoNext = answered;

  const toggleOption = (value: string) => {
    if (current.multi) {
      const list = Array.isArray(rawAnswer) ? rawAnswer : [];
      const next = list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value];
      setAnswer(current.id, next);
    } else {
      setAnswer(current.id, value);
    }
  };

  const goNext = () => {
    if (!canGoNext) return;
    if (isLast) {
      saveProfile();
      onDone();
      return;
    }
    setIndex((i) => i + 1);
  };

  const goBack = () => setIndex((i) => Math.max(0, i - 1));

  return (
    <div className="discover screen anim-fade-up">
      <div className="discover__hero">
        <div className="discover__hero-text">
          <p className="discover__eyebrow">Écran 01 — Adaptive QCM</p>
          <h1 className="discover__title">
            Discover <em>Me</em>
          </h1>
          <p className="discover__lead">
            Un questionnaire rapide et adaptatif pour créer votre parcours
            d’apprentissage personnalisé.
          </p>
          <ul className="discover__pillars">
            <li>
              <span aria-hidden="true">🎯</span> Votre profil sportif
            </li>
            <li>
              <span aria-hidden="true">📈</span> Vos objectifs réels
            </li>
            <li>
              <span aria-hidden="true">🧭</span> Un parcours sur mesure
            </li>
          </ul>
        </div>
        <div className="discover__hero-art" aria-hidden="true">
          <div className="discover__figure discover__figure--1" />
          <div className="discover__figure discover__figure--2" />
          <div className="discover__figure discover__figure--3" />
        </div>
      </div>

      <Card className="discover__quiz" padding="lg">
        <div className="discover__progress-row">
          <span className="discover__step-label">
            Étape {index + 1} sur {visible.length}
          </span>
          <ProgressBar value={progressPercent} tone="mint" />
          <span className="discover__percent">{Math.round(progressPercent)} %</span>
        </div>

        <div className="discover__question" key={current.id}>
          <h2>{current.title}</h2>
          {current.hint && <p className="discover__hint">{current.hint}</p>}

          <div
            className="discover__options"
            role={current.multi ? 'group' : 'radiogroup'}
            aria-label={current.title}
          >
            {current.options.map((opt) => {
              const isSelected = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  role={current.multi ? 'checkbox' : 'radio'}
                  aria-checked={isSelected}
                  className={`discover__option ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => toggleOption(opt.value)}
                >
                  <span className="discover__option-icon" aria-hidden="true">
                    {opt.icon ?? '•'}
                  </span>
                  <span className="discover__option-body">
                    <strong>{opt.label}</strong>
                    {opt.description && (
                      <small>{opt.description}</small>
                    )}
                  </span>
                  <span className="discover__option-check" aria-hidden="true">
                    {isSelected ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>

          {current.multi && (
            <p className="discover__multi-note">
              Plusieurs réponses possibles — sélectionnez-en au moins une.
            </p>
          )}
        </div>

        {current.why && (
          <Card variant="mint" className="discover__why" padding="md">
            <strong>💡 Pourquoi cette question ?</strong>
            <p>{current.why}</p>
          </Card>
        )}

        <div className="discover__actions">
          <Button
            variant="secondary"
            onClick={goBack}
            disabled={index === 0}
            icon="←"
          >
            Précédent
          </Button>
          <Button
            variant="primary"
            onClick={goNext}
            disabled={!canGoNext}
            iconEnd={isLast ? '✓' : '→'}
          >
            {isLast ? 'Terminer' : 'Suivant'}
          </Button>
        </div>
      </Card>

      {profile && (
        <p className="discover__saved-note" role="status">
          Profil déjà enregistré : {profile.level} · {profile.motion}. Vous pouvez le
          refaire pour le modifier.
        </p>
      )}

      {/* Indicateur de visibilité des questions (adaptativité) */}
      <p className="discover__adaptive-note">
        {QUESTIONS.length} questions au total · {visible.length} affichées selon vos
        réponses.
      </p>
    </div>
  );
}
