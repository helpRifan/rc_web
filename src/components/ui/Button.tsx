import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'terminal';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-accent-blue text-bg-deep hover:bg-accent-blue-bright disabled:bg-accent-blue-dim',
  secondary:
    'bg-bg-card text-fg-subtle border border-border-default hover:border-accent-blue disabled:opacity-50',
  ghost:
    'bg-transparent text-fg-muted hover:text-fg-primary disabled:opacity-50',
  terminal:
    'font-mono bg-bg-deep text-accent-blue border border-border-default hover:border-accent-blue disabled:opacity-50',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', disabled, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={[
          'rounded-lg font-medium transition-colors duration-200 cursor-pointer',
          'disabled:cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-deep',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(' ')}
        {...rest}
      />
    );
  },
);
Button.displayName = 'Button';
