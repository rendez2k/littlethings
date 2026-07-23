'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ListTodo, Plus, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { PlaceholderPanel } from '@/components/ui/placeholder-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HabitListRow } from '@/components/habits/habit-list-row';
import { useHabitEditor } from '@/components/habits/habit-editor-provider';
import {
  getHabitService,
  useActiveHabits,
  useAllCompletions,
  useArchivedHabits,
} from '@/features/habits/hooks';
import { useAppSettings } from '@/features/settings/hooks';
import { groupHabits } from '@/features/habits/categories';
import type { Habit } from '@/features/habits/schemas';
import type { Completion } from '@/features/completions/schemas';
import { todayKey, type DateKey } from '@/lib/dates';

export default function HabitsPage() {
  const active = useActiveHabits();
  const archived = useArchivedHabits();
  const allCompletions = useAllCompletions();
  const settings = useAppSettings();
  const { openCreate, openEdit } = useHabitEditor();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [today, setToday] = useState<DateKey | null>(null);
  useEffect(() => setToday(todayKey(new Date())), []);

  const completionsByHabit = useMemo(() => {
    const grouped = new Map<string, Completion[]>();
    for (const c of allCompletions ?? []) {
      const list = grouped.get(c.habitId) ?? [];
      list.push(c);
      grouped.set(c.habitId, list);
    }
    return grouped;
  }, [allCompletions]);

  const open = (habit: Habit) => router.push(`/habits/${habit.id}`);

  const totalCount = (active?.length ?? 0) + (archived?.length ?? 0);
  const showSearch = totalCount > 5;

  const needle = query.trim().toLowerCase();
  const visibleActive = useMemo(
    () => (active ?? []).filter((h) => h.name.toLowerCase().includes(needle)),
    [active, needle],
  );
  const visibleArchived = useMemo(
    () => (archived ?? []).filter((h) => h.name.toLowerCase().includes(needle)),
    [archived, needle],
  );

  const groups = useMemo(() => groupHabits(visibleActive), [visibleActive]);

  // Reorder within a group by swapping the two habits' positions in the full
  // active order (which is what `reorder` persists).
  const moveInGroup = async (groupItems: Habit[], index: number, delta: number) => {
    if (!active) return;
    const target = index + delta;
    if (target < 0 || target >= groupItems.length) return;
    const order = active.map((h) => h.id);
    const ia = order.indexOf(groupItems[index]!.id);
    const ib = order.indexOf(groupItems[target]!.id);
    if (ia < 0 || ib < 0) return;
    [order[ia], order[ib]] = [order[ib]!, order[ia]!];
    await getHabitService().reorder(order);
  };

  const addButton = (
    <Button size="sm" aria-label="Add habit" className="h-11 w-11 p-0" onClick={() => openCreate()}>
      <Plus aria-hidden="true" className="h-5 w-5" />
    </Button>
  );

  if (active === undefined) {
    return <PageHeader title="Habits" subtitle=" " action={addButton} />;
  }

  const empty = totalCount === 0;

  return (
    <>
      <PageHeader title="Habits" subtitle="Everything you're building" action={addButton} />

      {empty ? (
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
          {showSearch ? (
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <Input
                type="search"
                aria-label="Search habits"
                placeholder="Search habits"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          ) : null}

          {groups.map((group) => (
            <section key={group.key}>
              <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted">
                {group.label}
              </h2>
              <ul className="space-y-3">
                {group.habits.map((habit, i) => (
                  <li key={habit.id} className="motion-safe:animate-row-in">
                    <HabitListRow
                      habit={habit}
                      onOpen={open}
                      onEdit={openEdit}
                      completions={completionsByHabit.get(habit.id)}
                      today={today}
                      weekStartsOn={settings.weekStartsOn}
                      onMoveUp={!query && i > 0 ? () => moveInGroup(group.habits, i, -1) : undefined}
                      onMoveDown={
                        !query && i < group.habits.length - 1
                          ? () => moveInGroup(group.habits, i, 1)
                          : undefined
                      }
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {visibleArchived.length > 0 ? (
            <section>
              <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted">
                Archived
              </h2>
              <ul className="space-y-3">
                {visibleArchived.map((habit) => (
                  <li key={habit.id} className="motion-safe:animate-row-in">
                    <HabitListRow habit={habit} onOpen={open} onEdit={openEdit} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {query && visibleActive.length === 0 && visibleArchived.length === 0 ? (
            <p className="px-1 text-sm text-muted">No habits match “{query}”.</p>
          ) : null}
        </div>
      )}
    </>
  );
}
