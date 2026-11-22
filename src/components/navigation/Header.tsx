import { useApp } from '../../engine/store';
import './Header.css';

export type ScreenId = 'discover' | 'path' | 'lab' | 'guide';

const NAV: { id: ScreenId; label: string; icon: string }[] = [
  { id: 'discover', label: 'Découvrir', icon: '🧭' },
  { id: 'path', label: 'Mon Parcours', icon: '🛣️' },
  { id: 'lab', label: 'Explorer', icon: '🧊' },
  { id: 'guide', label: 'Mon Guide', icon: '📖' },
];

interface HeaderProps {
  current: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

export function Header({ current, onNavigate }: HeaderProps) {
  const { saved, resetAll, profile } = useApp();

  return (
    <header className="header">
      <div className="header__inner">
        <a
          className="header__brand"
          href="#main"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('discover');
          }}
        >
          <span className="header__logo" aria-hidden="true">
            <svg viewBox="0 0 40 40" width="34" height="34" role="img">
              <circle cx="20" cy="20" r="19" fill="var(--mint-500)" />
              <path
                d="M11 26c3-1 5-4 6-7 1.5 3 4 5.5 8 6"
                stroke="var(--green-900)"
                strokeWidth="2.6"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="25.5" cy="12.5" r="3" fill="var(--green-900)" />
            </svg>
          </span>
          <span className="header__titles">
            <strong>The Living Motion Atlas</strong>
            <small>Apprenez · Explorez · Bougez mieux</small>
          </span>
        </a>

        <nav className="header__nav" aria-label="Navigation principale">
          <ul>
            {NAV.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`header__link ${current === item.id ? 'is-active' : ''}`}
                  aria-current={current === item.id ? 'page' : undefined}
                  onClick={() => onNavigate(item.id)}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header__meta">
          <span
            className={`header__save ${saved ? 'is-ok' : 'is-warn'}`}
            title={saved ? 'Progression sauvegardée sur cet appareil' : 'Sauvegarde impossible'}
          >
            <span aria-hidden="true">{saved ? '✓' : '⚠'}</span>
            <span className="header__save-text">
              {saved ? 'Sauvegardé' : 'Non sauvegardé'}
            </span>
          </span>
          {profile && (
            <button
              type="button"
              className="header__reset"
              onClick={() => {
                if (window.confirm('Réinitialiser votre profil et votre progression ?')) {
                  resetAll();
                  onNavigate('discover');
                }
              }}
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Navigation mobile */}
      <nav className="header__mobile-nav" aria-label="Navigation mobile">
        <ul>
          {NAV.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`header__mobile-link ${current === item.id ? 'is-active' : ''}`}
                aria-current={current === item.id ? 'page' : undefined}
                onClick={() => onNavigate(item.id)}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
