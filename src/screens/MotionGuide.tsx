import { useMemo, useState } from 'react';
import { getMovement } from '../data/movements';
import { EQUIPMENT, GOAL_LABELS, LEVEL_LABELS, PREFERENCE_LABELS, QUIZ, personalizedSummary } from '../data/content';
import { useApp } from '../engine/store';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import type { MotionId } from '../types';
import './MotionGuide.css';

interface MotionGuideProps {
  onNavigate: (screen: 'discover' | 'path' | 'lab') => void;
}

/**
 * Écran 04 — My Motion Guide.
 * Résumé personnalisé, étapes, révision, Knowledge Check,
 * recommandations d'équipements.
 */
export function MotionGuide({ onNavigate }: MotionGuideProps) {
  const { profile, detailMode, quizAnswers, setQuizAnswer } = useApp();

  const motion: MotionId = profile?.motion ?? 'squat';
  const movement = useMemo(() => getMovement(motion), [motion]);

  const [stepIndex, setStepIndex] = useState(0);
  const currentPhase = movement.phases[Math.min(stepIndex, movement.phases.length - 1)];

  const [validated, setValidated] = useState<Record<string, boolean>>({});

  const summary = profile
    ? personalizedSummary(profile)
    : 'Complétez le questionnaire Discover Me pour obtenir un résumé personnalisé.';

  const quizScore = useMemo(() => {
    const answered = QUIZ.filter((q) => quizAnswers[q.id] !== undefined);
    const correct = answered.filter((q) => quizAnswers[q.id] === q.correctIndex);
    return { answered: answered.length, correct: correct.length, total: QUIZ.length };
  }, [quizAnswers]);

  const equipment = EQUIPMENT.filter((e) => e.relatedMotions.includes(motion));

  const cue = detailMode === 'essentiel' ? currentPhase.cueEssential : currentPhase.cueGuided;

  return (
    <div className="guide screen anim-fade-up">
      <header className="guide__hero">
        <div>
          <p className="guide__eyebrow">Écran 04 — Summary & Reinforcement</p>
          <h1>
            My Motion <em>Guide</em>
          </h1>
          <p className="guide__lead">
            Votre récapitulatif personnalisé pour progresser, revoir et consolider
            votre mouvement.
          </p>
        </div>
        <Button variant="mint" onClick={() => onNavigate('lab')} icon="🧊">
          Revoir l’animation 3D
        </Button>
      </header>

      <div className="guide__grid">
        {/* ---- Colonne gauche : profil + mouvement ---- */}
        <div className="guide__col">
          <Card padding="md">
            <h2 className="guide__card-title">👤 Votre profil</h2>
            {profile ? (
              <ul className="guide__profile-list">
                <li>
                  <span aria-hidden="true">📊</span>
                  <strong>Niveau :</strong> {LEVEL_LABELS[profile.level]}
                </li>
                <li>
                  <span aria-hidden="true">🎯</span>
                  <strong>Objectif :</strong> {GOAL_LABELS[profile.goal]}
                </li>
                <li>
                  <span aria-hidden="true">📖</span>
                  <strong>Préférence :</strong> {PREFERENCE_LABELS[profile.preference]}
                </li>
                <li>
                  <span aria-hidden="true">🏃</span>
                  <strong>Mouvement :</strong> {movement.name}
                </li>
              </ul>
            ) : (
              <p className="guide__empty">
                Aucun profil enregistré.{' '}
                <button type="button" className="guide__link" onClick={() => onNavigate('discover')}>
                  Créer mon profil →
                </button>
              </p>
            )}
          </Card>

          <Card padding="md" variant="mint">
            <h2 className="guide__card-title">✨ Résumé personnalisé</h2>
            <p className="guide__summary">{summary}</p>
          </Card>

          <Card padding="md">
            <h2 className="guide__card-title">💪 Bénéfices</h2>
            <ul className="guide__benefits">
              {movement.benefits.map((b) => (
                <li key={b}>
                  <span aria-hidden="true">✓</span> {b}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* ---- Colonne centrale : étapes ---- */}
        <div className="guide__col guide__col--wide">
          <Card padding="md">
            <div className="guide__steps-head">
              <h2 className="guide__card-title">
                <span aria-hidden="true">📚</span> Les étapes du {movement.name}
              </h2>
              <span className="guide__step-counter">
                Étape {currentPhase.index} / {movement.phases.length}
              </span>
            </div>

            <div className="guide__step-viewer">
              <div className="guide__step-visual" aria-hidden="true">
                <div className="guide__silhouette" data-phase={currentPhase.id} />
                <span className="guide__phase-name">{currentPhase.name}</span>
              </div>

              <div className="guide__step-text">
                <h3>{currentPhase.name}</h3>
                <p>{cue}</p>
                <ul className="guide__checkpoints">
                  {currentPhase.keyPoints.map((k) => (
                    <li key={k}>
                      <span aria-hidden="true">✓</span> {k}
                    </li>
                  ))}
                </ul>
                {detailMode === 'guide' && currentPhase.tip && (
                  <p className="guide__tip">💡 {currentPhase.tip}</p>
                )}
              </div>
            </div>

            <div className="guide__step-nav">
              <div className="guide__step-dots" role="tablist" aria-label="Étapes du mouvement">
                {movement.phases.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={i === stepIndex}
                    aria-label={`Étape ${p.index} : ${p.name}`}
                    className={`guide__dot ${i === stepIndex ? 'is-active' : ''} ${i < stepIndex ? 'is-done' : ''}`}
                    onClick={() => setStepIndex(i)}
                  >
                    {p.index}
                  </button>
                ))}
              </div>

              <div className="guide__step-buttons">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                  disabled={stepIndex === 0}
                  icon="←"
                >
                  Étape précédente
                </Button>
                <Button
                  variant="mint"
                  size="sm"
                  onClick={() => setStepIndex((i) => i)}
                  icon="↺"
                >
                  Revoir cette étape
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    setStepIndex((i) => Math.min(movement.phases.length - 1, i + 1))
                  }
                  disabled={stepIndex === movement.phases.length - 1}
                  iconEnd="→"
                >
                  Étape suivante
                </Button>
              </div>
            </div>
          </Card>

          {/* ---- Knowledge Check ---- */}
          <Card padding="md" className="guide__quiz">
            <div className="guide__quiz-head">
              <h2 className="guide__card-title">
                <span aria-hidden="true">✅</span> Knowledge Check
              </h2>
              <span className="guide__optional">Optionnel</span>
            </div>
            <p className="guide__quiz-note">
              Mesure votre compréhension des informations présentées — pas votre
              capacité physique.
            </p>

            <ul className="guide__quiz-list">
              {QUIZ.map((q) => {
                const chosen = quizAnswers[q.id];
                const isDone = validated[q.id] === true;
                const isCorrect = chosen === q.correctIndex;
                return (
                  <li key={q.id} className="guide__quiz-item">
                    <p className="guide__quiz-question">{q.question}</p>
                    <div className="guide__quiz-options" role="radiogroup" aria-label={q.question}>
                      {q.options.map((opt, i) => {
                        const selected = chosen === i;
                        const showResult = isDone;
                        const cls = showResult
                          ? i === q.correctIndex
                            ? 'is-correct'
                            : selected
                              ? 'is-wrong'
                              : ''
                          : selected
                            ? 'is-selected'
                            : '';
                        return (
                          <button
                            key={opt}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            className={`guide__quiz-option ${cls}`}
                            disabled={isDone}
                            onClick={() => setQuizAnswer(q.id, i)}
                          >
                            <span className="guide__radio" aria-hidden="true" />
                            {opt}
                            {showResult && i === q.correctIndex && (
                              <span className="guide__quiz-tag is-ok">Bonne réponse</span>
                            )}
                            {showResult && selected && i !== q.correctIndex && (
                              <span className="guide__quiz-tag is-ko">Votre réponse</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {isDone && (
                      <p className={`guide__quiz-explain ${isCorrect ? 'is-ok' : 'is-ko'}`}>
                        {isCorrect ? '✓ Correct — ' : '↺ À revoir — '}
                        {q.explanation}
                      </p>
                    )}

                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={chosen === undefined || isDone}
                      onClick={() => setValidated((v) => ({ ...v, [q.id]: true }))}
                    >
                      Valider ma réponse
                    </Button>
                  </li>
                );
              })}
            </ul>

            <p className="guide__score" role="status">
              Score : {quizScore.correct} / {quizScore.total} répondues correctement
            </p>
          </Card>
        </div>

        {/* ---- Colonne droite : équipements ---- */}
        <div className="guide__col">
          <Card padding="md">
            <h2 className="guide__card-title">
              <span aria-hidden="true">🎒</span> Équipements recommandés
            </h2>
            <p className="guide__equip-note">Suggestions contextuelles — ouverture dans un nouvel onglet.</p>
            <ul className="guide__equip-list">
              {(equipment.length > 0 ? equipment : EQUIPMENT.slice(0, 3)).map((e) => (
                <li key={e.id}>
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="guide__equip-card"
                  >
                    <span className="guide__equip-icon" aria-hidden="true">
                      {e.icon}
                    </span>
                    <span className="guide__equip-body">
                      <strong>{e.name}</strong>
                      <small>{e.benefit}</small>
                    </span>
                    <span className="guide__equip-price">
                      {e.price} <span aria-hidden="true">↗</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Card>

          <Card padding="md" variant="dark">
            <h2 className="guide__card-title guide__card-title--light">
              🧭 Continuer
            </h2>
            <p className="guide__next">
              Vous pouvez revoir n’importe quelle étape sans recommencer votre
              parcours.
            </p>
            <div className="guide__next-actions">
              <Button variant="mint" onClick={() => onNavigate('path')} icon="←">
                Revenir au parcours
              </Button>
              <Button variant="secondary" onClick={() => onNavigate('lab')} icon="🧊">
                Explorer en 3D
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
