import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function SettingsSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('mb-6', className)}>
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </h2>
      <div className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
        {children}
      </div>
    </section>
  );
}

export function SettingsRow({
  label,
  description,
  control,
  children,
}: {
  label: string;
  description?: string;
  /** Trailing control rendered inline with the label. */
  control?: ReactNode;
  /** Full-width content rendered beneath the label (e.g. a picker). */
  children?: ReactNode;
}) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[0.95rem] font-medium text-text">{label}</p>
          {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
        </div>
        {control ? <div className="shrink-0">{control}</div> : null}
      </div>
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}
