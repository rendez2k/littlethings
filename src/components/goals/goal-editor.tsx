'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { Sheet } from '@/components/ui/sheet';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { getGoalService } from '@/features/goals/hooks';
import { goalFormSchema, type Goal, type GoalFormValues } from '@/features/goals/schemas';

const FORM_ID = 'goal-editor-form';

interface Props {
  open: boolean;
  goal: Goal | null;
  onClose: () => void;
}

export function GoalEditor({ open, goal, onClose }: Props) {
  const confirm = useConfirm();

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
      title={goal ? 'Edit goal' : 'New goal'}
      description="Create or edit a bucket-list goal"
      leftSlot={
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
      }
      rightSlot={
        <Button type="submit" form={FORM_ID} size="sm">
          Save
        </Button>
      }
    >
      {open ? (
        <GoalForm
          key={goal?.id ?? 'new'}
          goal={goal}
          confirmDelete={async () => {
            if (!goal) return;
            const ok = await confirm({
              title: `Delete “${goal.title}”?`,
              description: 'This removes the goal from this device.',
              confirmLabel: 'Delete',
              destructive: true,
            });
            if (ok) {
              await getGoalService().remove(goal.id);
              onClose();
            }
          }}
          onSaved={onClose}
        />
      ) : null}
    </Sheet>
  );
}

function GoalForm({
  goal,
  onSaved,
  confirmDelete,
}: {
  goal: Goal | null;
  onSaved: () => void;
  confirmDelete: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: goal?.title ?? '',
      notes: goal?.notes ?? undefined,
      targetDate: goal?.targetDate ?? null,
    },
  });

  return (
    <form
      id={FORM_ID}
      noValidate
      className="space-y-5"
      onSubmit={handleSubmit(async (values) => {
        const service = getGoalService();
        if (goal) await service.update(goal.id, values);
        else await service.create(values);
        onSaved();
      })}
    >
      <Field id="goal-title" label="Goal" error={errors.title?.message}>
        {(p) => <Input placeholder="e.g. Run a half marathon" {...p} {...register('title')} />}
      </Field>

      <Field id="goal-date" label="Target date (optional)" error={errors.targetDate?.message}>
        {(p) => <Input type="date" {...p} {...register('targetDate')} />}
      </Field>

      <Field id="goal-notes" label="Notes" error={errors.notes?.message}>
        {(p) => (
          <textarea
            {...p}
            {...register('notes')}
            rows={4}
            placeholder="Why does this matter to you?"
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-text placeholder:text-muted/70 focus:border-primary focus:outline-none"
          />
        )}
      </Field>

      {goal ? (
        <Button
          type="button"
          variant="ghost"
          onClick={confirmDelete}
          className="w-full text-destructive"
          disabled={isSubmitting}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Delete goal
        </Button>
      ) : null}
    </form>
  );
}
