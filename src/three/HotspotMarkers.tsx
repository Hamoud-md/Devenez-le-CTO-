import { Html } from '@react-three/drei';
import { useMemo } from 'react';
import type { Hotspot, Movement, MotionId } from '../types';
import { getPoseAt } from './poses';

interface HotspotMarkersProps {
  hotspots: Hotspot[];
  movement: Movement;
  motion: MotionId;
  time: number;
  activeId: string | null;
  onSelect: (id: string) => void;
  enabled: boolean;
}

/** Trouve la phase correspondant à un instant de la timeline. */
function phaseAtTime(movement: Movement, time: number): string {
  const phase =
    movement.phases.find((p) => time >= p.start && time < p.end) ??
    movement.phases[movement.phases.length - 1];
  return phase.id;
}

/**
 * Points interactifs ancrés au modèle (Phase A — test hotspots).
 * La position suit la translation/rotation de la racine du squelette,
 * et le point se masque selon la phase active du mouvement.
 */
export function HotspotMarkers({
  hotspots,
  movement,
  motion,
  time,
  activeId,
  onSelect,
  enabled,
}: HotspotMarkersProps) {
  const pose = useMemo(() => getPoseAt(motion, time), [motion, time]);

  if (!enabled) return null;

  const currentPhase = phaseAtTime(movement, time);

  return (
    <group position={pose.rootPos} rotation={pose.rootRot}>
      {hotspots.map((h) => {
        if (!h.phases.includes(currentPhase)) return null;
        const isActive = activeId === h.id;

        return (
          <Html
            key={h.id}
            position={h.position}
            center
            distanceFactor={7}
            zIndexRange={[10, 0]}
          >
            <button
              type="button"
              className={`hotspot3d ${isActive ? 'is-active' : ''}`}
              aria-label={`Point d'intérêt : ${h.label}`}
              aria-pressed={isActive}
              onClick={() => onSelect(h.id)}
            >
              <span className="hotspot3d__dot" aria-hidden="true" />
              <span className="hotspot3d__label">{h.label}</span>
            </button>
          </Html>
        );
      })}
    </group>
  );
}
