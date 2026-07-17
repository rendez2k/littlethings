'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  Archive,
  ArrowDown,
  ArrowUp,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { getHabitService } from '@/features/habits/hooks';
import { useConfirm } from '@/components/ui/confirm-dialog';
import type { Habit } from '@/features/habits/schemas';

interface Props {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDeleted?: () => void;
}

const itemClass =
  'flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-text outline-none data-[highlighted]:bg-primary-soft';

export function HabitActionsMenu({ habit, onEdit, onMoveUp, onMoveDown, onDeleted }: Props) {
  const confirm = useConfirm();
  const service = getHabitService();
  const archived = habit.status === 'archived';
  const paused = habit.status === 'paused';

  const handleDelete = async () => {
    const ok = await confirm({
      title: `Delete “${habit.name}”?`,
      description: 'This removes the habit and its history from this device. It can’t be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    await service.softDelete(habit.id);
    onDeleted?.();
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={`Actions for ${habit.name}`}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-primary-soft hover:text-text"
        >
          <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-[11rem] rounded-2xl border border-border bg-elevated p-1.5 shadow-sheet"
        >
          {!archived ? (
            <DropdownMenu.Item className={itemClass} onSelect={() => onEdit(habit)}>
              <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
            </DropdownMenu.Item>
          ) : null}

          {!archived ? (
            <DropdownMenu.Item
              className={itemClass}
              onSelect={() => (paused ? service.resume(habit.id) : service.pause(habit.id))}
            >
              {paused ? (
                <>
                  <Play className="h-4 w-4" aria-hidden="true" /> Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4" aria-hidden="true" /> Pause
                </>
              )}
            </DropdownMenu.Item>
          ) : null}

          {onMoveUp ? (
            <DropdownMenu.Item className={itemClass} onSelect={onMoveUp}>
              <ArrowUp className="h-4 w-4" aria-hidden="true" /> Move up
            </DropdownMenu.Item>
          ) : null}
          {onMoveDown ? (
            <DropdownMenu.Item className={itemClass} onSelect={onMoveDown}>
              <ArrowDown className="h-4 w-4" aria-hidden="true" /> Move down
            </DropdownMenu.Item>
          ) : null}

          <DropdownMenu.Item
            className={itemClass}
            onSelect={() => (archived ? service.unarchive(habit.id) : service.archive(habit.id))}
          >
            {archived ? (
              <>
                <RotateCcw className="h-4 w-4" aria-hidden="true" /> Restore
              </>
            ) : (
              <>
                <Archive className="h-4 w-4" aria-hidden="true" /> Archive
              </>
            )}
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-border" />

          <DropdownMenu.Item
            className={cn(itemClass, 'text-destructive data-[highlighted]:bg-destructive/10')}
            onSelect={handleDelete}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
