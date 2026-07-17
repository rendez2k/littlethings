import type { DateKey } from '@/lib/dates';
import { DEFAULT_ICON } from './icons';
import type { Habit, HabitDraft } from './schemas';

/** A blank draft for a brand-new habit, anchored at `today`. */
export function emptyDraft(today: DateKey): HabitDraft {
  return {
    name: '',
    notes: undefined,
    icon: DEFAULT_ICON,
    color: 'lavender',
    schedule: { type: 'daily' },
    target: { type: 'boolean' },
    reminder: { enabled: false, time: '09:00' },
    startDate: today,
    endDate: null,
  };
}

/** Map an existing habit to an editable draft. */
export function habitToDraft(habit: Habit): HabitDraft {
  return {
    name: habit.name,
    notes: habit.notes,
    icon: habit.icon,
    color: habit.color,
    schedule: habit.schedule,
    target: habit.target,
    reminder: habit.reminder,
    startDate: habit.startDate,
    endDate: habit.endDate,
  };
}
