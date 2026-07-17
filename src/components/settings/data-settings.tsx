'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { SettingsRow, SettingsSection } from './settings-section';
import { createDataService } from '@/features/data/service';
import type { ExportBundle } from '@/features/data/schema';

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function dateStamp() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function DataSettings() {
  const confirm = useConfirm();
  const data = useMemo(() => createDataService(), []);
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<ExportBundle | null>(null);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  const handleExport = async () => {
    download(`little-things-backup-${dateStamp()}.json`, await data.exportJson());
    setMessage({ tone: 'ok', text: 'Backup downloaded.' });
  };

  const handleFile = async (file: File) => {
    setMessage(null);
    try {
      const bundle = data.parse(await file.text());
      setPending(bundle);
    } catch (err) {
      setMessage({ tone: 'error', text: err instanceof Error ? err.message : 'Import failed.' });
    }
  };

  const applyImport = async (mode: 'merge' | 'replace') => {
    if (!pending) return;
    const { backup, counts } = await data.importBundle(pending, mode);
    if (mode === 'replace') {
      download(`little-things-backup-before-import-${dateStamp()}.json`, backup);
    }
    setPending(null);
    setMessage({
      tone: 'ok',
      text: `Imported ${counts.habits} habits, ${counts.completions} completions and ${counts.goals} goals.`,
    });
    // Reload so appearance and all views reflect the imported data.
    window.setTimeout(() => window.location.reload(), 600);
  };

  const handleClearHistory = async () => {
    const ok = await confirm({
      title: 'Clear all completion history?',
      description:
        'Your habits stay, but every completion record is removed. This can’t be undone.',
      confirmLabel: 'Clear history',
      destructive: true,
    });
    if (!ok) return;
    const n = await data.clearHistory();
    setMessage({ tone: 'ok', text: `Cleared ${n} completion${n === 1 ? '' : 's'}.` });
  };

  const handleReset = async () => {
    const ok = await confirm({
      title: 'Reset the whole app?',
      description:
        'This deletes all habits, goals, history and settings from this device. Consider exporting a backup first.',
      confirmLabel: 'Reset everything',
      destructive: true,
    });
    if (!ok) return;
    await data.resetAll();
    window.location.href = '/';
  };

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <SettingsSection title="Data">
      {isDev ? (
        <SettingsRow
          label="Add demo data"
          description="Development only — seeds sample habits and goals."
          control={
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                const { seedDemoData } = await import('@/features/dev/seed');
                await seedDemoData();
                setMessage({ tone: 'ok', text: 'Demo data added.' });
              }}
            >
              Seed
            </Button>
          }
        />
      ) : null}
      <SettingsRow
        label="Export data"
        description="Download a JSON backup of everything on this device."
        control={
          <Button size="sm" variant="secondary" onClick={handleExport}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Export
          </Button>
        }
      />

      <SettingsRow label="Import data" description="Restore from a JSON backup.">
        <input
          ref={fileInput}
          type="file"
          aria-label="Backup file"
          accept="application/json,.json"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = '';
          }}
        />
        {pending ? (
          <div className="rounded-xl border border-border bg-background p-3">
            <p className="text-sm text-text">
              Found {pending.habits.length} habits, {pending.completions.length} completions and{' '}
              {pending.goals.length} goals.
            </p>
            <p className="mt-1 text-xs text-muted">
              Merge keeps what you have; Replace swaps everything (a backup is saved first).
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => applyImport('merge')}>
                Merge
              </Button>
              <Button size="sm" variant="destructive" onClick={() => applyImport('replace')}>
                Replace
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPending(null)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => fileInput.current?.click()}>
            <Upload className="h-4 w-4" aria-hidden="true" />
            Choose a backup file
          </Button>
        )}
      </SettingsRow>

      {message ? (
        <SettingsRow
          label={message.text}
          description={message.tone === 'error' ? 'Please try a different file.' : undefined}
        />
      ) : null}

      <Link href="/habits" className="block">
        <SettingsRow
          label="Archived habits"
          description="Manage archived habits on the Habits screen."
          control={<ChevronRight className="h-5 w-5 text-muted" aria-hidden="true" />}
        />
      </Link>

      <SettingsRow
        label="Clear completed history"
        description="Remove all completion records, keep your habits."
        control={
          <Button size="sm" variant="secondary" onClick={handleClearHistory}>
            Clear
          </Button>
        }
      />

      <SettingsRow
        label="Reset application"
        description="Delete everything and start fresh."
        control={
          <Button size="sm" variant="destructive" onClick={handleReset}>
            Reset
          </Button>
        }
      />
    </SettingsSection>
  );
}
