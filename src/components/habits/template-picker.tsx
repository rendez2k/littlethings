'use client';

import { Plus } from 'lucide-react';
import { useAppearance } from '@/components/theme/appearance-provider';
import {
  HABIT_TEMPLATES,
  TEMPLATE_CATEGORIES,
  type HabitTemplate,
} from '@/features/habits/templates';
import { getHabitIcon } from '@/features/habits/icons';
import { getHabitAccent } from '@/features/habits/colors';
import { scheduleLabel } from '@/features/habits/labels';

/** Grouped template list; selecting one hands it back to the editor to prefill. */
export function TemplatePicker({ onPick }: { onPick: (template: HabitTemplate) => void }) {
  const { resolvedTheme } = useAppearance();

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">Start from a template and tweak anything before saving.</p>
      {TEMPLATE_CATEGORIES.map((category) => {
        const items = HABIT_TEMPLATES.filter((t) => t.category === category);
        if (items.length === 0) return null;
        return (
          <section key={category}>
            <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted">
              {category}
            </h3>
            <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
              {items.map((template) => {
                const Icon = getHabitIcon(template.draft.icon);
                const { accent, soft } = getHabitAccent(template.draft.color, resolvedTheme);
                return (
                  <li key={template.id}>
                    <button
                      type="button"
                      onClick={() => onPick(template)}
                      className="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-primary-soft"
                    >
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: soft, color: accent }}
                        aria-hidden="true"
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-text">
                          {template.draft.name}
                        </span>
                        <span className="block truncate text-sm text-muted">
                          {scheduleLabel(template.draft.schedule)}
                        </span>
                      </span>
                      <Plus className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
