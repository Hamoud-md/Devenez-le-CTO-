import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'mint';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconEnd?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconEnd,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`btn btn--${variant} btn--${size} ${className}`.trim()}
      {...rest}
    >
      {icon && <span className="btn__icon" aria-hidden="true">{icon}</span>}
      {children && <span className="btn__label">{children}</span>}
      {iconEnd && <span className="btn__icon" aria-hidden="true">{iconEnd}</span>}
    </button>
  );
}
