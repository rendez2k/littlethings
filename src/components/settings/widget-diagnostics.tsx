'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Button } from '@/components/ui/button';
import { SettingsRow, SettingsSection } from './settings-section';
import { useActiveHabits, useAllCompletions, useCompletionsForDate } from '@/features/habits/hooks';
import { buildDayView } from '@/features/completions/day-view';
import { buildWidgetSnapshot } from '@/features/widget/snapshot';
import { pushWidgetSnapshotResult } from '@/features/widget/bridge';
import { todayKey } from '@/lib/dates';

const OUTCOME: Record<string, string> = {
  sent: 'Snapshot sent to the widget ✓ — check the home screen in a minute.',
  unavailable: 'The LKWidget plugin isn’t in this build. The app can’t reach the widget.',
  error: 'The widget plugin was called but returned an error.',
};

/**
 * A native-only diagnostic for the home-screen widget: shows whether the plugin
 * is detected and lets you push today's snapshot on demand. Hidden on the web /
 * PWA (there's no widget there).
 */
export function WidgetDiagnostics() {
  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setToday(todayKey(new Date()));
  }, []);

  const habits = useActiveHabits();
  const completionsForDate = useCompletionsForDate(today);
  const allCompletions = useAllCompletions();

  if (!mounted || !Capacitor.isNativePlatform()) return null;

  const available = Capacitor.isPluginAvailable('LKWidget');

  const syncNow = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const ever = new Set<string>();
      for (const c of allCompletions ?? []) if (!c.deletedAt) ever.add(c.habitId);
      const view = buildDayView(habits ?? [], completionsForDate ?? [], today, today, ever);
      const snapshot = buildWidgetSnapshot(view, today, new Date().toISOString());
      const result = await pushWidgetSnapshotResult(snapshot);
      setMessage(OUTCOME[result] ?? 'Done.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SettingsSection title="Widget">
      <SettingsRow
        label="Home-screen widget"
        description="Shows today’s progress on your home screen."
        control={
          <span className="text-sm text-muted">{available ? 'Detected' : 'Not detected'}</span>
        }
      />
      <SettingsRow
        label="Sync the widget now"
        description="Pushes today’s snapshot to the widget."
        control={
          <Button size="sm" disabled={busy} onClick={syncNow}>
            {busy ? 'Syncing…' : 'Sync now'}
          </Button>
        }
      />
      {message ? <SettingsRow label={message} /> : null}
    </SettingsSection>
  );
}
