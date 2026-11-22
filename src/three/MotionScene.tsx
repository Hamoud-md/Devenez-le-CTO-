import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Grid, OrbitControls } from '@react-three/drei';
import type { Movement, MotionId } from '../types';
import { SkeletonFigure } from './SkeletonFigure';
import { HotspotMarkers } from './HotspotMarkers';

interface MotionSceneProps {
  motion: MotionId;
  movement: Movement;
  time: number;
  playing: boolean;
  speed: number;
  onTimeChange: (t: number) => void;
  hotspotsEnabled: boolean;
  activeHotspot: string | null;
  onSelectHotspot: (id: string) => void;
  anatomyLayer: boolean;
  cameraPreset: 'front' | 'side' | 'back' | 'top';
  onResetCamera: () => void;
  resetKey: number;
}

/**
 * Motion Scene — visualiseur 3D (Phase A).
 * Squelette procédural + hotspots + contrôle caméra + grille.
 */
export function MotionScene({
  motion,
  movement,
  time,
  playing,
  speed,
  onTimeChange,
  hotspotsEnabled,
  activeHotspot,
  onSelectHotspot,
  anatomyLayer,
  cameraPreset,
  resetKey,
}: MotionSceneProps) {
  const cameraPos: Record<string, [number, number, number]> = {
    front: [0, 1.4, 4.2],
    side: [4.2, 1.4, 0],
    back: [0, 1.4, -4.2],
    top: [0, 5, 0.6],
  };

  return (
    <div className="scene3d" role="img" aria-label={`Visualisation 3D du mouvement : ${movement.name}`}>
      <Canvas
        key={resetKey}
        shadows
        dpr={[1, 1.75]}
        camera={{ position: cameraPos[cameraPreset], fov: 42 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0a1628');
        }}
      >
        <fog attach="fog" args={['#0a1628', 9, 22]} />

        {/* Éclairage */}
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[4, 6, 3]}
          intensity={1.4}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-4, 3, -4]} intensity={0.5} color="#7fd8ff" />
        <pointLight position={[0, 1, 3]} intensity={0.4} color="#2ed573" />

        {/* Sol */}
        <Grid
          position={[0, -0.001, 0]}
          args={[12, 12]}
          cellSize={0.5}
          cellThickness={0.6}
          cellColor="#16304f"
          sectionSize={2.5}
          sectionThickness={1}
          sectionColor="#1f4066"
          fadeDistance={16}
          infiniteGrid
        />
        <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={6} blur={2.4} far={3} />

        {/* Plateforme */}
        <mesh position={[0, -0.02, 0]} receiveShadow>
          <cylinderGeometry args={[1.5, 1.55, 0.05, 48]} />
          <meshStandardMaterial color="#0f2038" roughness={0.8} />
        </mesh>

        <Suspense fallback={null}>
          <SkeletonFigure
            motion={motion}
            time={time}
            playing={playing}
            speed={speed}
            duration={movement.duration}
            onTimeChange={onTimeChange}
          />
        </Suspense>

        {/* Couche anatomique simplifiée (facultative) : zones musculaires en surbrillance */}
        {anatomyLayer && <AnatomyOverlay motion={motion} time={time} />}

        <HotspotMarkers
          hotspots={movement.hotspots}
          movement={movement}
          motion={motion}
          time={time}
          activeId={activeHotspot}
          onSelect={onSelectHotspot}
          enabled={hotspotsEnabled}
        />

        <OrbitControls
          enablePan={false}
          minDistance={2.2}
          maxDistance={9}
          maxPolarAngle={Math.PI / 1.85}
          target={[0, 1, 0]}
        />
      </Canvas>

      <div className="scene3d__badge" aria-hidden="true">
        360° · Glissez pour tourner
      </div>
    </div>
  );
}

/**
 * Couche anatomique simplifiée : sphères translucides sur les groupes
 * musculaires principaux. Facultative et pédagogique — pas une encyclopédie.
 */
function AnatomyOverlay({ motion, time }: { motion: MotionId; time: number }) {
  // Positions approximatives suivant la racine (même logique que les hotspots)
  const depth = motion === 'squat' ? Math.sin(Math.min(time, 5) / 5 * Math.PI) : 0;

  const regions =
    motion === 'pompes'
      ? [
          { id: 'pecs', pos: [0, 0.62, -0.45] as [number, number, number], color: '#ff7a5c' },
          { id: 'arms', pos: [0.3, 0.7, -0.5] as [number, number, number], color: '#ffb35c' },
        ]
      : motion === 'yoga'
        ? [
            { id: 'core', pos: [0, 1.1, 0] as [number, number, number], color: '#7cc4ff' },
            { id: 'legs', pos: [0.1, 0.5, 0] as [number, number, number], color: '#86efac' },
          ]
        : [
            { id: 'quads', pos: [0.16, 0.62 - depth * 0.15, 0.06] as [number, number, number], color: '#ff7a5c' },
            { id: 'glutes', pos: [-0.1, 0.92 - depth * 0.3, -0.16] as [number, number, number], color: '#ffb35c' },
            { id: 'core', pos: [0, 1.15 - depth * 0.2, 0] as [number, number, number], color: '#7cc4ff' },
          ];

  return (
    <group>
      {regions.map((r) => (
        <mesh key={r.id} position={r.pos}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial
            color={r.color}
            transparent
            opacity={0.35}
            roughness={0.3}
            emissive={r.color}
            emissiveIntensity={0.25}
          />
        </mesh>
      ))}
    </group>
  );
}
