'use client';

import { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { PlaceholderPanel } from '@/components/ui/placeholder-panel';
import { Button } from '@/components/ui/button';
import { GoalRow } from '@/components/goals/goal-row';
import { GoalEditor } from '@/components/goals/goal-editor';
import { useGoals } from '@/features/goals/hooks';
import type { Goal } from '@/features/goals/schemas';

/**
 * Goals — a bucket list of longer-term projects and things to complete
 * (brief §1). Simpler than habits: no schedule, just a checklist.
 */
export default function GoalsPage() {
  const goals = useGoals();
  const [editing, setEditing] = useState<Goal | null>(null);
  const [open, setOpen] = useState(false);

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (goal: Goal) => {
    setEditing(goal);
    setOpen(true);
  };

  const addButton = (
    <Button size="sm" aria-label="Add goal" className="h-11 w-11 p-0" onClick={openNew}>
      <Plus aria-hidden="true" className="h-5 w-5" />
    </Button>
  );

  const openGoals = (goals ?? []).filter((g) => !g.done);
  const doneGoals = (goals ?? []).filter((g) => g.done);

  return (
    <>
      <PageHeader title="Goals" subtitle="Your bucket list" action={addButton} />

      {goals === undefined ? null : goals.length === 0 ? (
        <PlaceholderPanel
          icon={Target}
          title="Dream a little"
          description="Add the bigger things you want to do — a trip, a skill, a project. No schedule, just a list to work towards."
          action={
            <Button onClick={openNew}>
              <Plus aria-hidden="true" className="h-4 w-4" />
              Add a goal
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {openGoals.length > 0 ? (
            <ul className="space-y-3">
              {openGoals.map((goal) => (
                <li key={goal.id}>
                  <GoalRow goal={goal} onEdit={openEdit} />
                </li>
              ))}
            </ul>
          ) : null}

          {doneGoals.length > 0 ? (
            <section>
              <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted">
                Done ({doneGoals.length})
              </h2>
              <ul className="space-y-3">
                {doneGoals.map((goal) => (
                  <li key={goal.id}>
                    <GoalRow goal={goal} onEdit={openEdit} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}

      <GoalEditor open={open} goal={editing} onClose={() => setOpen(false)} />
    </>
  );
}
