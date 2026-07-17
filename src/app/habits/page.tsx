'use client';

import { ListTodo, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { PlaceholderPanel } from '@/components/ui/placeholder-panel';
import { Button } from '@/components/ui/button';
import { HabitCard } from '@/components/habits/habit-card';
import { useHabitEditor } from '@/components/habits/habit-editor-provider';
import { useActiveHabits, useArchivedHabits } from '@/features/habits/hooks';

/**
 * Habits — all active and archived habits. Phase 3 lists them and opens the
 * editor on tap. Search, ordering and pause/archive actions land in Phase 5.
 */
export default function HabitsPage() {
  const active = useActiveHabits();
  const archived = useArchivedHabits();
  const { openCreate, openEdit } = useHabitEditor();

  const addButton = (
    <Button size="sm" aria-label="Add habit" className="h-11 w-11 p-0" onClick={() => openCreate()}>
      <Plus aria-hidden="true" className="h-5 w-5" />
    </Button>
  );

  if (active === undefined) {
    return <PageHeader title="Habits" subtitle=" " action={addButton} />;
  }

  return (
    <>
      <PageHeader title="Habits" subtitle="Everything you're building" action={addButton} />

      {active.length === 0 && (archived?.length ?? 0) === 0 ? (
        <PlaceholderPanel
          icon={ListTodo}
          title="No habits yet"
          description="Create your first habit to start building better days."
          action={
            <Button onClick={() => openCreate()}>
              <Plus aria-hidden="true" className="h-4 w-4" />
              Add a habit
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {active.length > 0 ? (
            <section>
              <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted">
                Active
              </h2>
              <ul className="space-y-3">
                {active.map((habit) => (
                  <li key={habit.id}>
                    <HabitCard habit={habit} onOpen={openEdit} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {archived && archived.length > 0 ? (
            <section>
              <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted">
                Archived
              </h2>
              <ul className="space-y-3">
                {archived.map((habit) => (
                  <li key={habit.id}>
                    <HabitCard habit={habit} onOpen={openEdit} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </>
  );
}
