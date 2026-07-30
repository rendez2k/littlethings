'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getCompletionService, getHabitService, useHabit, useCompletionsForHabit } from '@/features/habits/hooks';
import { useAppSettings } from '@/features/settings/hooks';
import { syncLocalNotifications } from '@/features/reminders/local-sync';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { computeStreak } from '@/features/streaks/streak';
import { isSatisfied } from '@/features/completions/logic';
import { Plant, GrowthThread } from '@/components/garden/plant';
import { GardenMonth } from '@/components/garden/month';
import { FireflyField, AnimatedNumber, ScreenEnter } from '@/components/garden/motion';
import { gardenColor, gardenColorVar, stageFromStreak } from '@/components/garden/mapping';
import type { Habit } from '@/features/habits/schemas';
import type { Completion } from '@/features/completions/schemas';

const DAY = 86_400_000;

function pullQuote(streak: number): string {
  if (streak >= 100) return 'A hundred days. This isn’t a habit any more — it’s just who you are.';
  if (streak >= 60) return 'Two months of quiet tending. The roots are deep now.';
  if (streak >= 30) return 'Fully bloomed. You showed up on the ordinary days, and it added up.';
  if (streak >= 7) return 'A week of small yeses. This is how gardens begin.';
  if (streak >= 1) return 'You planted something today. Come back tomorrow and water it.';
  return 'Every plant starts as a seed in the dark. Begin whenever you’re ready.';
}

function weeklyGrowth(completions: Completion[], habit: Habit, today: Date): number[] {
  const kept = new Set<string>();
  for (const c of completions) {
    if (c.deletedAt) continue;
    if (c.state === 'skipped' || isSatisfied(habit.target, c.value)) kept.add(c.date);
  }
  const stageForCount = (n: number) => (n >= 6 ? 4 : n >= 4 ? 3 : n >= 2 ? 2 : n >= 1 ? 1 : 0);
  const out: number[] = [];
  for (let w = 6; w >= 0; w--) {
    let count = 0;
    for (let d = 0; d < 7; d++) {
      const day = new Date(today.getTime() - (w * 7 + d) * DAY);
      const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      if (kept.has(key)) count++;
    }
    out.push(stageForCount(count));
  }
  return out;
}

function StatCard({ label, value, suffix, color }: { label: string; value: ReactNode; suffix?: string; color?: string }) {
  return (
    <div className="gd-card" style={{ padding: '12px 10px' }}>
      <div className="gd-eyebrow">{label}</div>
      <div style={{ fontFamily: 'var(--gd-font-display)', fontSize: 22, color: color ?? 'var(--gd-cream)', marginTop: 2, lineHeight: 1 }}>
        {value}
        {suffix ? <span style={{ fontSize: 12, color: 'var(--gd-cream-faint)' }}>{suffix}</span> : null}
      </div>
    </div>
  );
}

export default function PlantDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? null;
  const router = useRouter();
  const confirm = useConfirm();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const habit = useHabit(id);
  const completions = useCompletionsForHabit(id);
  const settings = useAppSettings();

  const toggleDay = (date: string, kept: boolean) => {
    if (!id) return;
    if (kept) void getCompletionService().clear(id, date);
    else void getCompletionService().complete(id, date);
  };
  const deletePlant = async () => {
    if (!id || !habit) return;
    const ok = await confirm({
      title: `Pull up “${habit.name}”?`,
      description: 'This removes the plant and its whole history from this device. It can’t be undone.',
      confirmLabel: 'Pull it up',
      destructive: true,
    });
    if (!ok) return;
    await getHabitService().softDelete(id);
    router.push('/habits');
  };
  const togglePause = async () => {
    if (!id || !habit) return;
    if (habit.status === 'paused') await getHabitService().resume(id);
    else await getHabitService().pause(id);
    void syncLocalNotifications();
  };
  const toggleArchive = async () => {
    if (!id || !habit) return;
    if (habit.status === 'archived') await getHabitService().unarchive(id);
    else {
      await getHabitService().archive(id);
      router.push('/habits');
    }
    void syncLocalNotifications();
  };

  const derived = useMemo(() => {
    if (!habit || completions === undefined) return null;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const streak = computeStreak(habit, completions, today, settings.weekStartsOn);
    const stage = stageFromStreak(streak.current);
    const planted = Math.max(0, Math.floor((now.getTime() - new Date(habit.createdAt).getTime()) / DAY));
    const monthPrefix = today.slice(0, 7);
    const keptThisMonth = new Set<string>();
    for (const c of completions) {
      if (c.deletedAt || !c.date.startsWith(monthPrefix)) continue;
      if (c.state === 'skipped' || isSatisfied(habit.target, c.value)) keptThisMonth.add(c.date);
    }
    return {
      streak,
      stage,
      planted,
      color: gardenColorVar(habit.color),
      species: gardenColor(habit.color),
      growth: weeklyGrowth(completions, habit, now),
      monthKept: keptThisMonth.size,
      monthElapsed: now.getDate(),
    };
  }, [habit, completions, settings.weekStartsOn]);

  if (!mounted || habit === undefined || !derived) return <div style={{ padding: '54px 22px' }} />;
  if (habit === null) {
    return (
      <div style={{ padding: '54px 22px' }}>
        <Link href="/habits" className="gd-eyebrow" style={{ textDecoration: 'none' }}>
          ‹ All plants
        </Link>
        <div className="gd-body" style={{ marginTop: 16 }}>This plant is no longer here.</div>
      </div>
    );
  }

  const { streak, stage, planted, color, species, growth, monthKept, monthElapsed } = derived;
  const words = habit.name.split(' ');
  const lead = words.slice(0, -1).join(' ');
  const last = words[words.length - 1];

  return (
    <div style={{ padding: '54px 22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Link href="/habits" className="gd-eyebrow" style={{ textDecoration: 'none', letterSpacing: '0.2em' }}>
          ‹ All plants
        </Link>
        <Link href={`/plant?id=${habit.id}`} className="gd-eyebrow gd-eyebrow--accent" style={{ textDecoration: 'none' }}>
          Edit
        </Link>
      </div>

      <ScreenEnter stagger={50}>
        <div
          style={{
            borderRadius: 20,
            padding: '28px 16px 16px',
            background: 'linear-gradient(180deg, oklch(0.24 0.04 160), var(--gd-bg-soft))',
            border: '1px solid var(--gd-hair)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <FireflyField count={5} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Plant stage={stage} color={color} species={species} size={160} />
          </div>
          <div className="gd-soil" style={{ width: '80%', marginTop: 4 }} />
        </div>

        <div style={{ marginTop: 18 }}>
          <h1 className="gd-h1" style={{ fontSize: 28, lineHeight: 1.1 }}>
            {lead ? `${lead} ` : ''}
            <em style={{ color: stage === 4 ? 'var(--gd-bloom)' : 'var(--gd-moss)' }}>{last}.</em>
          </h1>
          <div className="gd-meta" style={{ marginTop: 4 }}>
            Planted {planted} {planted === 1 ? 'day' : 'days'} ago · {stage === 4 ? 'fully bloomed' : `stage ${stage} of 4`}
          </div>
        </div>

        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <StatCard label="Streak" value={<AnimatedNumber value={streak.current} />} suffix="d" color={color} />
          <StatCard label="Longest" value={streak.best} suffix="d" color="var(--gd-bloom)" />
          <StatCard label="This month" value={`${monthKept}/${monthElapsed}`} color="var(--gd-gold)" />
        </div>

        <div style={{ marginTop: 22 }}>
          <div className="gd-eyebrow">Growth</div>
          <div className="gd-card" style={{ marginTop: 10, padding: '18px 14px' }}>
            <GrowthThread stages={growth} color={color} species={species} labels={['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7']} />
          </div>
        </div>

        <div className="gd-card gd-card--accent" style={{ marginTop: 18, padding: '16px 18px' }}>
          <div className="gd-quote">&ldquo;{pullQuote(streak.current)}&rdquo;</div>
        </div>

        <div style={{ marginTop: 22 }}>
          <div className="gd-eyebrow">Fix a day</div>
          <div className="gd-card" style={{ marginTop: 10, padding: 16 }}>
            <GardenMonth habit={habit} completions={completions ?? []} color={color} weekStartsOn={settings.weekStartsOn} onToggle={toggleDay} />
          </div>
        </div>

        <div style={{ marginTop: 18, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link href={`/plant?id=${habit.id}`} className="gd-btn gd-btn--ghost" style={{ textDecoration: 'none', flex: '1 1 auto', textAlign: 'center' }}>
            Edit
          </Link>
          <button type="button" onClick={togglePause} className="gd-btn gd-btn--ghost" style={{ flex: '1 1 auto' }}>
            {habit.status === 'paused' ? 'Resume' : 'Pause'}
          </button>
          <button type="button" onClick={toggleArchive} className="gd-btn gd-btn--ghost" style={{ flex: '1 1 auto' }}>
            {habit.status === 'archived' ? 'Unarchive' : 'Archive'}
          </button>
          <button type="button" onClick={deletePlant} className="gd-btn gd-btn--ghost" style={{ flex: '1 1 auto', color: 'var(--gd-danger)' }}>
            Pull up
          </button>
        </div>
      </ScreenEnter>
    </div>
  );
}
