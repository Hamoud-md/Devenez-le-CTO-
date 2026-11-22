import { lazy, Suspense, useState } from 'react';
import { AppProvider } from './engine/store';
import { Header, type ScreenId } from './components/navigation/Header';
import { DiscoverMe } from './screens/DiscoverMe';
import { LivingPath } from './screens/LivingPath';
import { MotionGuide } from './screens/MotionGuide';

// Chargement différé du laboratoire 3D (exigence de performance)
const MotionLab = lazy(() =>
  import('./screens/MotionLab').then((m) => ({ default: m.MotionLab })),
);

function LabFallback() {
  return (
    <div className="screen lab-fallback" role="status">
      <p>Chargement du visualiseur 3D…</p>
      <p className="lab-fallback__note">
        Si la 3D n’est pas disponible sur votre appareil, les instructions
        complètes restent consultables dans « Mon Guide ».
      </p>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<ScreenId>('discover');

  const navigate = (next: ScreenId) => {
    setScreen(next);
    // Défilement doux vers le haut (respecté si prefers-reduced-motion)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <AppProvider>
      <a className="skip-link" href="#main">
        Aller au contenu principal
      </a>
      <div className="app-shell">
        <Header current={screen} onNavigate={navigate} />
        <main id="main">
          {screen === 'discover' && (
            <DiscoverMe onDone={() => navigate('path')} />
          )}
          {screen === 'path' && (
            <LivingPath
              onNavigate={(s) => navigate(s === 'discover' ? 'discover' : s)}
            />
          )}
          {screen === 'lab' && (
            <Suspense fallback={<LabFallback />}>
              <MotionLab onBack={() => navigate('path')} />
            </Suspense>
          )}
          {screen === 'guide' && (
            <MotionGuide
              onNavigate={(s) => navigate(s === 'discover' ? 'discover' : s)}
            />
          )}
        </main>
        <footer className="app-footer">
          <p>
            The Living Motion Atlas — Nuit de l’Info 2025 · Défi « Devenez le CTO de
            votre Santé Posturale »
          </p>
          <p>
            Outil pédagogique. Ne fournit aucun diagnostic médical et ne certifie pas
            la qualité de votre exécution physique.
          </p>
        </footer>
      </div>
    </AppProvider>
  );
}
