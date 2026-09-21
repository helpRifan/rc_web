import { HTMLAttributes, ReactNode } from 'react';

type Tone = 'neutral' | 'blue' | 'gold';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  children?: ReactNode;
  className?: string;
}

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-bg-card text-fg-muted border-border-subtle',
  blue: 'bg-accent-blue-dim/20 text-accent-blue-bright border-accent-blue-dim',
  gold: 'bg-accent-gold-dim/20 text-accent-gold border-accent-gold-dim',
};

export function Badge({ tone = 'neutral', className = '', ...rest }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium',
        toneClasses[tone],
        className,
      ].join(' ')}
      {...rest}
    />
  );
}
