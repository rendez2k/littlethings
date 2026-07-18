'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { BarChart3, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { PlaceholderPanel } from '@/components/ui/placeholder-panel';
import { Card } from '@/components/ui/card';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { useActiveHabits, useAllCompletions } from '@/features/habits/hooks';
import { useAppSettings } from '@/features/settings/hooks';
import { computeInsights, type InsightsRange } from '@/features/insights/insights';
import { todayKey, type Weekday } from '@/lib/dates';

const ChartFallback = () => <div className="h-32 animate-pulse rounded-lg bg-border/40" />;

const TrendChart = dynamic(
  () => import('@/components/charts/trend-chart').then((m) => m.TrendChart),
  { ssr: false, loading: ChartFallback },
);
const BarList = dynamic(() => import('@/components/charts/bar-list').then((m) => m.BarList), {
  ssr: false,
  loading: ChartFallback,
});
const WeekdayBars = dynamic(
  () => import('@/components/charts/weekday-bars').then((m) => m.WeekdayBars),
  { ssr: false, loading: ChartFallback },
);

const RANGE_OPTIONS = [
  { value: 'week' as const, label: 'Week' },
  { value: 'month' as const, label: 'Month' },
  { value: 'year' as const, label: 'Year' },
];

const RANGE_NOUN: Record<InsightsRange, string> = {
  week: 'this week',
  month: 'this month',
  year: 'this year',
};

const DAY_NAME: Record<Weekday, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

function unitLabel(value: number, unit: 'day' | 'week' | 'month') {
  return value === 1 ? unit : `${unit}s`;
}

export default function InsightsPage() {
  const habits = useActiveHabits();
  const completions = useAllCompletions();
  const settings = useAppSettings();
  const [range, setRange] = useState<InsightsRange>('week');
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(todayKey(new Date())), []);

  const insights = useMemo(() => {
    if (!habits || !completions || !today) return null;
    return computeInsights(habits, completions, range, today, settings.weekStartsOn);
  }, [habits, completions, today, range, settings.weekStartsOn]);

  if (!insights || habits === undefined) {
    return <PageHeader title="Insights" subtitle="Your progress at a glance" />;
  }

  if (habits.length === 0) {
    return (
      <>
        <PageHeader title="Insights" subtitle="Your progress at a glance" />
        <PlaceholderPanel
          icon={BarChart3}
          title="No insights yet"
          description="Create a habit and check a few days off — your trends and streaks will appear here."
        />
      </>
    );
  }

  const rangeNoun = RANGE_NOUN[range];
  const pct = Math.round(insights.completionRate * 100);

  const trendValues = insights.trend.filter((p) => p.ratio !== null).map((p) => p.ratio as number);
  const trendAvg = trendValues.length
    ? Math.round((trendValues.reduce((a, b) => a + b, 0) / trendValues.length) * 100)
    : null;
  const trendSummary =
    trendAvg === null
      ? `Completion trend for ${rangeNoun}. Not enough data yet.`
      : `Completion trend for ${rangeNoun}, averaging ${trendAvg}%.`;

  const consistentSummary =
    insights.mostConsistentDay === null
      ? 'Track a few more days to find your most consistent day.'
      : `Your most consistent day is ${DAY_NAME[insights.mostConsistentDay]}.`;

  const lowData = insights.opportunities === 0;

  return (
    <>
      <PageHeader title="Insights" subtitle="Your progress at a glance" />

      <div className="mb-5">
        <SegmentedControl
          ariaLabel="Insights range"
          value={range}
          onChange={setRange}
          options={RANGE_OPTIONS}
        />
      </div>

      {lowData ? (
        <PlaceholderPanel
          icon={Sparkles}
          title="Your insights are just getting started"
          description={`Nothing tracked ${rangeNoun} yet. Check off a habit or two and your trends will grow.`}
        />
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <StatTile label={`Completion ${rangeNoun}`} value={`${pct}%`} />
            <StatTile label={`Perfect days ${rangeNoun}`} value={String(insights.perfectDays)} />
            <StatTile
              label={`Current streak`}
              value={`${insights.currentStreak}`}
              hint={unitLabel(insights.currentStreak, insights.streakUnit)}
            />
            <StatTile
              label="Best streak"
              value={`${insights.bestStreak}`}
              hint={unitLabel(insights.bestStreak, insights.streakUnit)}
            />
          </div>

          <Card>
            <h2 className="mb-1 text-sm font-semibold text-text">Completion trend</h2>
            <p className="mb-3 text-xs text-muted">{trendSummary}</p>
            <TrendChart points={insights.trend} summary={trendSummary} />
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold text-text">Habit performance</h2>
            {insights.habitPerformance.length ? (
              <BarList items={insights.habitPerformance} />
            ) : (
              <p className="text-sm text-muted">No habits scheduled {rangeNoun}.</p>
            )}
          </Card>

          <Card>
            <h2 className="mb-1 text-sm font-semibold text-text">Most consistent day</h2>
            <p className="mb-3 text-xs text-muted">{consistentSummary}</p>
            <WeekdayBars weekdays={insights.weekdays} mostConsistent={insights.mostConsistentDay} />
          </Card>

          <p className="px-1 text-center text-xs text-muted">
            {insights.totalCompletions} completion{insights.totalCompletions === 1 ? '' : 's'}{' '}
            {rangeNoun}. Every one counts.
          </p>
        </div>
      )}
    </>
  );
}

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-card border border-border bg-surface p-4 shadow-card">
      <p className="text-2xl font-bold text-text">
        {value}
        {hint ? <span className="ml-1 text-sm font-medium text-muted">{hint}</span> : null}
      </p>
      <p className="mt-0.5 text-xs text-muted">{label}</p>
    </div>
  );
}
