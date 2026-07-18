import { todayKey, type DateKey } from '@/lib/dates';
import { getHabitService } from '@/features/habits/hooks';
import { getGoalService } from '@/features/goals/hooks';
import type { HabitDraft } from '@/features/habits/schemas';

/**
 * Optional demo data for development (brief §26). Never called automatically —
 * only from a clearly-labelled dev action, so real users never get seeded.
 */
function draft(
  partial: Omit<HabitDraft, 'startDate' | 'reminder' | 'endDate'>,
  today: DateKey,
): HabitDraft {
  return {
    ...partial,
    reminder: { enabled: false, time: '09:00' },
    startDate: today,
    endDate: null,
  };
}

export async function seedDemoData(now: Date = new Date()): Promise<void> {
  const today = todayKey(now);
  const habits = getHabitService();

  await habits.create(
    draft(
      {
        name: 'Drink water',
        icon: 'droplet',
        color: 'sky',
        schedule: { type: 'daily' },
        target: { type: 'count', amount: 8, unit: 'glasses' },
      },
      today,
    ),
  );
  await habits.create(
    draft(
      {
        name: 'Meditate',
        icon: 'flower',
        color: 'lavender',
        schedule: { type: 'daily' },
        target: { type: 'duration', amount: 10, unit: 'minutes' },
      },
      today,
    ),
  );
  await habits.create(
    draft(
      {
        name: 'Exercise',
        icon: 'dumbbell',
        color: 'mint',
        schedule: { type: 'weekdays', weekdays: [1, 3, 5] },
        target: { type: 'boolean' },
      },
      today,
    ),
  );
  await habits.create(
    draft(
      {
        name: 'Read a book',
        icon: 'book-open',
        color: 'peach',
        schedule: { type: 'daily' },
        target: { type: 'boolean' },
      },
      today,
    ),
  );
  await habits.create(
    draft(
      {
        name: 'No sugary drinks',
        icon: 'ban',
        color: 'rose',
        schedule: { type: 'daily' },
        target: { type: 'boolean' },
      },
      today,
    ),
  );

  const goals = getGoalService();
  await goals.create({ title: 'Run a half marathon' });
  await goals.create({ title: 'Read 24 books this year' });
}
