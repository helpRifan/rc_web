import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  children?: ReactNode;
  className?: string;
}

export function Card({ elevated = false, className = '', ...rest }: CardProps) {
  return (
    <div
      className={[
        'rounded-xl border border-border-subtle',
        elevated ? 'bg-bg-elevated' : 'bg-bg-card',
        className,
      ].join(' ')}
      {...rest}
    />
  );
}
