import type { HTMLAttributes, ReactNode } from 'react';
import './Card.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'mint' | 'dark' | 'outline';
  padding?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Card({
  variant = 'light',
  padding = 'md',
  className = '',
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={`card card--${variant} card--pad-${padding} ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}
