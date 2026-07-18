import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground hover:opacity-90 active:opacity-80',
  secondary: 'bg-elevated text-text border border-border hover:bg-primary-soft',
  ghost: 'bg-transparent text-primary hover:bg-primary-soft',
  destructive: 'bg-destructive text-destructive-foreground hover:opacity-90 active:opacity-80',
};

const sizeClasses: Record<Size, string> = {
  sm: 'min-h-[2.25rem] px-3 text-sm',
  md: 'min-h-[2.75rem] px-4 text-[0.95rem]',
  lg: 'min-h-[3rem] px-5 text-base',
};

/** Restyled button primitive built on semantic tokens, not shadcn defaults. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
});
