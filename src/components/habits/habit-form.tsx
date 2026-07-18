'use client';

import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAppearance } from '@/components/theme/appearance-provider';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { habitFormSchema, type HabitDraft, type HabitFormValues } from '@/features/habits/schemas';
import { getHabitIcon, suggestIcon } from '@/features/habits/icons';
import { getHabitAccent } from '@/features/habits/colors';
import { ColorPicker, FrequencyPicker, IconPicker, TargetPicker } from './pickers';

interface HabitFormProps {
  formId: string;
  mode: 'create' | 'edit';
  initialDraft: HabitDraft;
  onSubmit: (draft: HabitDraft) => void;
  onDelete?: () => void;
}

export function HabitForm({ formId, mode, initialDraft, onSubmit, onDelete }: HabitFormProps) {
  const { resolvedTheme } = useAppearance();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const iconTouched = useRef(mode === 'edit');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: { ...initialDraft, endDate: initialDraft.endDate ?? null },
  });

  const name = watch('name');
  const color = watch('color');
  const icon = watch('icon');

  // Suggest an icon from the name until the user picks one manually.
  useEffect(() => {
    if (iconTouched.current) return;
    const suggested = suggestIcon(name ?? '');
    if (suggested) setValue('icon', suggested, { shouldDirty: false });
  }, [name, setValue]);

  const accent = getHabitAccent(color, resolvedTheme);
  const PreviewIcon = getHabitIcon(icon);

  return (
    <form
      id={formId}
      noValidate
      onSubmit={handleSubmit((values) =>
        onSubmit({
          ...values,
          name: values.name.trim(),
          notes: values.notes?.trim() ? values.notes.trim() : undefined,
          endDate: values.endDate ? values.endDate : null,
        }),
      )}
      className="space-y-7"
    >
      {/* Identity */}
      <div className="flex items-center gap-4">
        <span
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: accent.accent, color: accent.on }}
          aria-hidden="true"
        >
          <PreviewIcon className="h-8 w-8" />
        </span>
        <div className="flex-1">
          <Field id="habit-name" label="Name" error={errors.name?.message}>
            {(p) => <Input placeholder="What do you want to build?" {...p} {...register('name')} />}
          </Field>
        </div>
      </div>

      <FormRow label="Colour">
        <Controller
          control={control}
          name="color"
          render={({ field }) => <ColorPicker value={field.value} onChange={field.onChange} />}
        />
      </FormRow>

      <FormRow label="Icon">
        <Controller
          control={control}
          name="icon"
          render={({ field }) => (
            <IconPicker
              value={field.value}
              color={color}
              onChange={(v) => {
                iconTouched.current = true;
                field.onChange(v);
              }}
            />
          )}
        />
      </FormRow>

      <FormRow label="Frequency">
        <Controller
          control={control}
          name="schedule"
          render={({ field }) => <FrequencyPicker value={field.value} onChange={field.onChange} />}
        />
      </FormRow>

      <FormRow label="Reminder">
        <Controller
          control={control}
          name="reminder"
          render={({ field }) => (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Switch
                  ariaLabel="Enable reminder"
                  checked={field.value.enabled}
                  onChange={(enabled) => field.onChange({ ...field.value, enabled })}
                />
                <span className="text-sm text-muted">
                  {field.value.enabled ? 'Remind me at' : 'Off'}
                </span>
              </div>
              {field.value.enabled ? (
                <input
                  type="time"
                  aria-label="Reminder time"
                  value={field.value.time}
                  onChange={(e) => field.onChange({ ...field.value, time: e.target.value })}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-text focus:border-primary focus:outline-none"
                />
              ) : null}
            </div>
          )}
        />
      </FormRow>

      {/* Advanced (collapsed initially) */}
      <div className="rounded-card border border-border">
        <button
          type="button"
          aria-expanded={advancedOpen}
          onClick={() => setAdvancedOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span className="text-sm font-semibold text-text">Advanced options</span>
          <ChevronDown
            className={cn('h-5 w-5 text-muted transition-transform', advancedOpen && 'rotate-180')}
            aria-hidden="true"
          />
        </button>

        {advancedOpen ? (
          <div className="space-y-6 border-t border-border px-4 py-4">
            <FormRow label="Target">
              <Controller
                control={control}
                name="target"
                render={({ field }) => (
                  <TargetPicker value={field.value} onChange={field.onChange} />
                )}
              />
            </FormRow>

            <div className="grid grid-cols-2 gap-3">
              <Field id="habit-start" label="Start date" error={errors.startDate?.message}>
                {(p) => <Input type="date" {...p} {...register('startDate')} />}
              </Field>
              <Field id="habit-end" label="End date (optional)" error={errors.endDate?.message}>
                {(p) => <Input type="date" {...p} {...register('endDate')} />}
              </Field>
            </div>

            <Field id="habit-notes" label="Notes" error={errors.notes?.message}>
              {(p) => (
                <textarea
                  {...p}
                  {...register('notes')}
                  rows={3}
                  placeholder="Anything you want to remember"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-text placeholder:text-muted/70 focus:border-primary focus:outline-none"
                />
              )}
            </Field>
          </div>
        ) : null}
      </div>

      {mode === 'edit' && onDelete ? (
        <Button
          type="button"
          variant="ghost"
          onClick={onDelete}
          className="w-full text-destructive"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Delete habit
        </Button>
      ) : null}
    </form>
  );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-text">{label}</p>
      {children}
    </div>
  );
}
