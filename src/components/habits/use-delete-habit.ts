'use client';

import { useConfirm } from '@/components/ui/confirm-dialog';
import { getHabitService } from '@/features/habits/hooks';
import type { Habit } from '@/features/habits/schemas';

/**
 * Returns a handler that confirms, then soft-deletes a habit. Shared by the
 * actions menu and the swipe-to-delete gesture so the confirmation copy and
 * behaviour stay in one place.
 */
export function useDeleteHabit(onDeleted?: () => void) {
  const confirm = useConfirm();
  return async (habit: Habit) => {
    const ok = await confirm({
      title: `Delete “${habit.name}”?`,
      description: 'This removes the habit and its history from this device. It can’t be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    await getHabitService().softDelete(habit.id);
    onDeleted?.();
  };
}
