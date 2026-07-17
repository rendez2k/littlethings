'use client';

import { useEffect, useState } from 'react';
import { CalendarClock, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { PlaceholderPanel } from '@/components/ui/placeholder-panel';
import { Button } from '@/components/ui/button';
import { Welcome } from '@/components/today/welcome';
import { HabitCard } from '@/components/habits/habit-card';
import { useHabitEditor } from '@/components/habits/habit-editor-provider';
import { useActiveHabits } from '@/features/habits/hooks';
import { isPausedOn, isScheduledOn } from '@/features/habits/schedule';
import { todayKey } from '@/lib/dates';

/**
 * Today — the main screen. Phase 3 shows the first-launch welcome and the
 * habits scheduled for today (tap to edit). Completion controls arrive in
 * Phase 4.
 */
export default function TodayPage() {
  const habits = useActiveHabits();
  const { openCreate, openEdit } = useHabitEditor();

  const [today, setToday] = useState<string | null>(null);
  const [dateLabel, setDateLabel] = useState('');
  useEffect(() => {
    const now = new Date();
    setToday(todayKey(now));
    setDateLabel(
      now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }),
    );
  }, []);

  // Wait until both the data and the local date are available on the client.
  if (habits === undefined || today === null) {
    return <PageHeader title="Today" subtitle=" " />;
  }

  if (habits.length === 0) {
    return <Welcome />;
  }

  const scheduled = habits.filter(
    (h) => h.status === 'active' && isScheduledOn(h, today) && !isPausedOn(h, today),
  );

  return (
    <>
      <PageHeader
        title="Today"
        subtitle={dateLabel || ' '}
        action={
          <Button
            size="sm"
            aria-label="Add habit"
            className="h-11 w-11 p-0"
            onClick={() => openCreate()}
          >
            <Plus aria-hidden="true" className="h-5 w-5" />
          </Button>
        }
      />
      {scheduled.length === 0 ? (
        <PlaceholderPanel
          icon={CalendarClock}
          title="Nothing planned for today."
          description="None of your habits are scheduled today. Enjoy the breather, or add something new."
          action={
            <Button onClick={() => openCreate()}>
              <Plus aria-hidden="true" className="h-4 w-4" />
              Add a habit
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {scheduled.map((habit) => (
            <li key={habit.id}>
              <HabitCard habit={habit} onOpen={openEdit} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
