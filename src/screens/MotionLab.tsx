import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getMovement } from '../data/movements';
import { useApp } from '../engine/store';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { MotionScene } from '../three/MotionScene';
import type { DetailMode, MotionId } from '../types';
import './MotionLab.css';

const MOTION_OPTIONS: { id: MotionId; label: string; icon: string }[] = [
  { id: 'squat', label: 'Squat', icon: '🏃' },
  { id: 'pompes', label: 'Pompes', icon: '💪' },
  { id: 'yoga', label: 'Yoga — Tadasana', icon: '🧘' },
];

interface MotionLabProps {
  onBack: () => void;
}

/**
 * Écran 03 — Motion Discovery Lab.
 * Visualiseur 3D, Motion Scrubber, Hotspots, Motion Microscope,
 * Adaptive Detail, couche anatomique, Replay One Step.
 */
export function MotionLab({ onBack }: MotionLabProps) {
  const {
    profile,
    detailMode,
    setDetailMode,
    anatomyLayer,
    setAnatomyLayer,
    hotspotsEnabled,
    setHotspotsEnabled,
    reducedMotion,
  } = useApp();

  const [motion, setMotion] = useState<MotionId>(profile?.motion ?? 'squat');
  const movement = useMemo(() => getMovement(motion), [motion]);

  /* --- Timeline --- */
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [cameraPreset, setCameraPreset] = useState<
    'front' | 'side' | 'back' | 'top'
  >('side');
  const [resetKey, setResetKey] = useState(0);

  /* --- Hotspots & microscope --- */
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [microscopeOpen, setMicroscopeOpen] = useState(false);
  const [microscopeRestore, setMicroscopeRestore] = useState<{
    time: number;
    camera: typeof cameraPreset;
    hotspot: string | null;
  } | null>(null);

  /* --- Lecture automatique à l'entrée --- */
  useEffect(() => {
    if (reducedMotion) return;
    setPlaying(true);
    return () => setPlaying(false);
  }, [reducedMotion]);

  useEffect(() => {
    setTime(0);
    setPlaying(false);
    setActiveHotspot(null);
  }, [motion]);

  const scrubRef = useRef<HTMLInputElement>(null);

  const activePhase = useMemo(
    () =>
      movement.phases.find((p) => time >= p.start && time < p.end) ??
      movement.phases[movement.phases.length - 1],
    [movement, time],
  );

  const activeHotspotData = useMemo(
    () => movement.hotspots.find((h) => h.id === activeHotspot) ?? null,
    [movement, activeHotspot],
  );

  /* --- Scrubber accessible : flèches clavier --- */
  const onScrubKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const step = 0.25;
    if (e.key === 'ArrowRight') {
      setTime((t) => Math.min(movement.duration, t + step));
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      setTime((t) => Math.max(0, t - step));
      e.preventDefault();
    } else if (e.key === 'Home') {
      setTime(0);
      e.preventDefault();
    } else if (e.key === 'End') {
      setTime(movement.duration);
      e.preventDefault();
    } else if (e.key === ' ') {
      setPlaying((p) => !p);
      e.preventDefault();
    }
  };

  /* --- Replay One Step (AC-09) --- */
  const replayPhase = useCallback(
    (phaseId: string) => {
      const phase = movement.phases.find((p) => p.id === phaseId);
      if (!phase) return;
      setTime(phase.start);
      setPlaying(true);
    },
    [movement],
  );

  const goToPhase = (phaseId: string) => {
    const phase = movement.phases.find((p) => p.id === phaseId);
    if (!phase) return;
    setTime(phase.start);
    setPlaying(false);
    setActiveHotspot(null);
  };

  const prevPhase = () => {
    const idx = movement.phases.findIndex((p) => p.id === activePhase.id);
    if (idx > 0) goToPhase(movement.phases[idx - 1].id);
    else setTime(0);
  };

  const nextPhase = () => {
    const idx = movement.phases.findIndex((p) => p.id === activePhase.id);
    if (idx < movement.phases.length - 1) goToPhase(movement.phases[idx + 1].id);
  };

  /* --- Motion Microscope (AC-07) : zoom + restauration --- */
  const openMicroscope = () => {
    setMicroscopeRestore({
      time,
      camera: cameraPreset,
      hotspot: activeHotspot,
    });
    setMicroscopeOpen(true);
    setPlaying(false);
  };

  const closeMicroscope = () => {
    setMicroscopeOpen(false);
    if (microscopeRestore) {
      setTime(microscopeRestore.time);
      setCameraPreset(microscopeRestore.camera);
      setActiveHotspot(microscopeRestore.hotspot);
      setResetKey((k) => k + 1);
    }
  };

  const toggleDetailMode = (mode: DetailMode) => setDetailMode(mode);

  const cue =
    detailMode === 'essentiel'
      ? activePhase.cueEssential
      : activePhase.cueGuided;

  return (
    <div className="lab screen anim-fade-up">
      <div className="lab__toolbar">
        <Button variant="ghost" onClick={onBack} icon="←">
          Retour au parcours
        </Button>

        <label className="lab__motion-select">
          <span className="visually-hidden">Mouvement affiché</span>
          <select
            value={motion}
            onChange={(e) => setMotion(e.target.value as MotionId)}
          >
            {MOTION_OPTIONS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

        <div className="lab__mode-toggle" role="group" aria-label="Mode pédagogique">
          <button
            type="button"
            className={detailMode === 'essentiel' ? 'is-active' : ''}
            aria-pressed={detailMode === 'essentiel'}
            onClick={() => toggleDetailMode('essentiel')}
          >
            Essentiel
          </button>
          <button
            type="button"
            className={detailMode === 'guide' ? 'is-active' : ''}
            aria-pressed={detailMode === 'guide'}
            onClick={() => toggleDetailMode('guide')}
          >
            Guidé
          </button>
        </div>
      </div>

      <div className="lab__grid">
        {/* ---------- Colonne gauche : outils ---------- */}
        <aside className="lab__sidebar">
          <Card padding="md" variant="light">
            <h2 className="lab__side-title">Vue de l’exercice</h2>
            <div className="lab__camera-views">
              {(['front', 'side', 'back', 'top'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`lab__camera-btn ${cameraPreset === v ? 'is-active' : ''}`}
                  aria-pressed={cameraPreset === v}
                  onClick={() => {
                    setCameraPreset(v);
                    setResetKey((k) => k + 1);
                  }}
                >
                  <span aria-hidden="true">
                    {v === 'front' ? '🧍' : v === 'side' ? '↔️' : v === 'back' ? '🔙' : '⬇️'}
                  </span>
                  {v === 'front'
                    ? 'Face'
                    : v === 'side'
                      ? 'Profil'
                      : v === 'back'
                        ? 'Dos'
                        : 'Dessus'}
                </button>
              ))}
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="lab__reset-cam"
              onClick={() => setResetKey((k) => k + 1)}
              icon="↺"
            >
              Réinitialiser la caméra
            </Button>
          </Card>

          <Card padding="md" variant="light">
            <h2 className="lab__side-title">Réglages</h2>
            <ul className="lab__toggles">
              <li>
                <label className="lab__toggle">
                  <input
                    type="checkbox"
                    checked={hotspotsEnabled}
                    onChange={(e) => setHotspotsEnabled(e.target.checked)}
                  />
                  <span>Points interactifs (Hotspots)</span>
                </label>
              </li>
              <li>
                <label className="lab__toggle">
                  <input
                    type="checkbox"
                    checked={anatomyLayer}
                    onChange={(e) => setAnatomyLayer(e.target.checked)}
                  />
                  <span>Couche anatomique (facultative)</span>
                </label>
              </li>
              <li>
                <label className="lab__toggle">
                  <input
                    type="checkbox"
                    checked={detailMode === 'guide'}
                    onChange={(e) => setDetailMode(e.target.checked ? 'guide' : 'essentiel')}
                  />
                  <span>Explications détaillées</span>
                </label>
              </li>
            </ul>
          </Card>

          <Card padding="md" variant="mint">
            <h2 className="lab__side-title">Muscles sollicités</h2>
            <ul className="lab__muscles">
              {movement.muscles.map((m) => (
                <li key={m.name}>
                  <strong>{m.name}</strong>
                  <small>{m.role}</small>
                </li>
              ))}
            </ul>
          </Card>
        </aside>

        {/* ---------- Centre : visualiseur ---------- */}
        <div className="lab__stage">
          <div className="lab__stage-header">
            <span className="lab__lab-icon" aria-hidden="true">
              🧪
            </span>
            <div>
              <h1>Motion Discovery Lab</h1>
              <p>
                Explorez le mouvement : {movement.name} — {movement.tagline}
              </p>
            </div>
          </div>

          <div className={`lab__viewer ${microscopeOpen ? 'is-zoomed' : ''}`}>
            <MotionScene
              motion={motion}
              movement={movement}
              time={time}
              playing={playing && !microscopeOpen}
              speed={speed}
              onTimeChange={setTime}
              hotspotsEnabled={hotspotsEnabled}
              activeHotspot={activeHotspot}
              onSelectHotspot={(id) =>
                setActiveHotspot((prev) => (prev === id ? null : id))
              }
              anatomyLayer={anatomyLayer}
              cameraPreset={microscopeOpen ? 'side' : cameraPreset}
              onResetCamera={() => setResetKey((k) => k + 1)}
              resetKey={resetKey}
            />

            {/* Panneau hotspots superposé */}
            {activeHotspotData && (
              <Card className="lab__hotspot-panel" padding="md">
                <div className="lab__hotspot-head">
                  <h3>{activeHotspotData.label}</h3>
                  <button
                    type="button"
                    className="lab__close"
                    aria-label="Fermer l’explication"
                    onClick={() => setActiveHotspot(null)}
                  >
                    ✕
                  </button>
                </div>
                <p>
                  {detailMode === 'essentiel'
                    ? activeHotspotData.essential
                    : activeHotspotData.guided}
                </p>
                <Button
                  variant="mint"
                  size="sm"
                  onClick={openMicroscope}
                  icon="🔍"
                >
                  Zoom (Motion Microscope)
                </Button>
              </Card>
            )}
          </div>

          {/* ---- Motion Scrubber ---- */}
          <div className="lab__transport">
            <button
              type="button"
              className="lab__play"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'Mettre en pause' : 'Lire l’animation'}
            >
              {playing ? '⏸' : '▶'}
            </button>

            <button
              type="button"
              className="lab__transport-btn"
              onClick={prevPhase}
              aria-label="Phase précédente"
            >
              ⏮
            </button>
            <button
              type="button"
              className="lab__transport-btn"
              onClick={nextPhase}
              aria-label="Phase suivante"
            >
              ⏭
            </button>

            <span className="lab__time" aria-hidden="true">
              {time.toFixed(1).padStart(4, '0')}s / {movement.duration.toFixed(1)}s
            </span>

            <input
              ref={scrubRef}
              type="range"
              className="lab__scrubber"
              min={0}
              max={movement.duration}
              step={0.01}
              value={time}
              onChange={(e) => {
                setPlaying(false);
                setTime(Number(e.target.value));
              }}
              onKeyDown={onScrubKeyDown}
              aria-label="Curseur temporel de l’animation"
              aria-valuetext={`${time.toFixed(1)} secondes sur ${movement.duration}`}
            />

            <label className="lab__speed">
              <span className="visually-hidden">Vitesse de lecture</span>
              <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
                <option value={0.5}>0,5×</option>
                <option value={1}>1,0×</option>
                <option value={1.5}>1,5×</option>
                <option value={2}>2,0×</option>
              </select>
            </label>

            <button
              type="button"
              className="lab__transport-btn"
              onClick={() => {
                setTime(0);
                setPlaying(true);
              }}
              aria-label="Revoir depuis le début"
            >
              ↺
            </button>
          </div>

          {/* ---- Phases du mouvement ---- */}
          <div className="lab__phases">
            <h2>Phases du mouvement</h2>
            <ul>
              {movement.phases.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className={`lab__phase ${p.id === activePhase.id ? 'is-active' : ''}`}
                    onClick={() => goToPhase(p.id)}
                    aria-pressed={p.id === activePhase.id}
                  >
                    <span className="lab__phase-index">{p.index}</span>
                    <span className="lab__phase-body">
                      <strong>{p.name}</strong>
                      <small>
                        {p.start.toFixed(0)}:00 – {p.end.toFixed(0)}:00
                      </small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---------- Colonne droite : explications ---------- */}
        <aside className="lab__explain">
          <Card padding="md" variant="light">
            <div className="lab__explain-head">
              <span className="lab__phase-badge">
                {activePhase.index} / {movement.phases.length}
              </span>
              <h2>{activePhase.name}</h2>
            </div>

            <p className="lab__cue">{cue}</p>

            {detailMode === 'guide' && activePhase.tip && (
              <p className="lab__tip">💡 {activePhase.tip}</p>
            )}

            <h3>Repères clés</h3>
            <ul className="lab__keypoints">
              {activePhase.keyPoints.map((k) => (
                <li key={k}>
                  <span aria-hidden="true">✓</span> {k}
                </li>
              ))}
            </ul>

            {activePhase.avoid && activePhase.avoid.length > 0 && (
              <>
                <h3 className="is-danger">À éviter</h3>
                <ul className="lab__avoid">
                  {activePhase.avoid.map((a) => (
                    <li key={a}>
                      <span aria-hidden="true">✕</span> {a}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="lab__replay">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => replayPhase(activePhase.id)}
                icon="↺"
              >
                Revoir cette étape
              </Button>
            </div>
          </Card>

          {/* Liste des hotspots */}
          {hotspotsEnabled && (
            <Card padding="md" variant="mint">
              <h3 className="lab__side-title">Points interactifs</h3>
              <ul className="lab__hotspot-list">
                {movement.hotspots
                  .filter((h) => h.phases.includes(activePhase.id))
                  .map((h) => (
                    <li key={h.id}>
                      <button
                        type="button"
                        className={activeHotspot === h.id ? 'is-active' : ''}
                        onClick={() =>
                          setActiveHotspot((prev) => (prev === h.id ? null : h.id))
                        }
                        aria-pressed={activeHotspot === h.id}
                      >
                        <span className="lab__hotspot-dot" aria-hidden="true" />
                        {h.label}
                      </button>
                    </li>
                  ))}
                {movement.hotspots.filter((h) => h.phases.includes(activePhase.id))
                  .length === 0 && (
                  <li className="lab__empty">Aucun point pour cette phase.</li>
                )}
              </ul>
            </Card>
          )}

          {/* Alternative si la 3D échoue (AC-13) — affichée en dessous */}
          <Card padding="md" variant="outline">
            <h3 className="lab__side-title">Alternative sans 3D</h3>
            <p className="lab__fallback">{movement.fallbackIllustration}</p>
            <details>
              <summary>Instructions complètes</summary>
              <ol className="lab__fallback-list">
                {movement.phases.map((p) => (
                  <li key={p.id}>
                    <strong>
                      {p.index}. {p.name}
                    </strong>
                    <br />
                    {detailMode === 'essentiel' ? p.cueEssential : p.cueGuided}
                  </li>
                ))}
              </ol>
            </details>
          </Card>
        </aside>
      </div>

      {/* ---------- Motion Microscope (overlay) ---------- */}
      {microscopeOpen && (
        <div
          className="lab__microscope"
          role="dialog"
          aria-modal="true"
          aria-label="Motion Microscope — vue agrandie"
        >
          <div className="lab__microscope-head">
            <h2>🔍 Motion Microscope</h2>
            <button
              type="button"
              className="lab__close"
              onClick={closeMicroscope}
              aria-label="Fermer le microscope et restaurer la vue"
              autoFocus
            >
              ✕
            </button>
          </div>

          <div className="lab__microscope-body">
            <div className="lab__microscope-canvas">
              <MotionScene
                motion={motion}
                movement={movement}
                time={time}
                playing={false}
                speed={1}
                onTimeChange={() => {}}
                hotspotsEnabled={hotspotsEnabled}
                activeHotspot={activeHotspot}
                onSelectHotspot={(id) => setActiveHotspot(id)}
                anatomyLayer
                cameraPreset="side"
                onResetCamera={() => {}}
                resetKey={resetKey + 1000}
              />
            </div>

            <div className="lab__microscope-info">
              <h3>
                Zoom : {activeHotspotData?.label ?? activePhase.name}
              </h3>
              <p>
                {activeHotspotData
                  ? detailMode === 'essentiel'
                    ? activeHotspotData.essential
                    : activeHotspotData.guided
                  : detailMode === 'essentiel'
                    ? activePhase.cueEssential
                    : activePhase.cueGuided}
              </p>
              <div className="lab__microscope-meta">
                <span>Phase : {activePhase.name}</span>
                <span>Temps : {time.toFixed(1)}s</span>
              </div>
              <p className="lab__microscope-note">
                À la fermeture, la phase, le point de vue et l’élément sélectionné
                sont restaurés.
              </p>
              <Button variant="primary" onClick={closeMicroscope}>
                Fermer et restaurer la vue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
