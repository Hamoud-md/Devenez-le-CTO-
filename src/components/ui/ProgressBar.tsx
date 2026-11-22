import './ProgressBar.css';

interface ProgressBarProps {
  value: number; // 0..100
  label?: string;
  showPercent?: boolean;
  tone?: 'green' | 'mint';
}

export function ProgressBar({
  value,
  label,
  showPercent = false,
  tone = 'green',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="progress">
      {label && <span className="progress__label">{label}</span>}
      <div
        className={`progress__track progress__track--${tone}`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progression'}
      >
        <div
          className="progress__fill"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showPercent && <span className="progress__value">{clamped} %</span>}
    </div>
  );
}
