import Link from 'next/link';
import type { ComponentProps } from 'react';

type Props = ComponentProps<typeof Link> & { variant?: 'primary' | 'secondary' };

const VARIANTS = {
  primary: 'bg-rc-accent text-rc-bg hover:bg-rc-accent-deep',
  secondary: 'border border-rc-line text-rc-ink hover:border-rc-muted',
} as const;

export function ButtonLink({ variant = 'primary', className = '', ...props }: Props) {
  return (
    <Link
      {...props}
      className={`type-ui inline-flex min-h-12 items-center justify-center rounded-md px-6 transition-colors ${VARIANTS[variant]} ${className}`}
    />
  );
}
