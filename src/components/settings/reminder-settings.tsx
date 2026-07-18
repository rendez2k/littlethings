'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SettingsRow, SettingsSection } from './settings-section';
import {
  disablePush,
  enablePush,
  getExistingSubscription,
  isPushConfigured,
  isPushSupported,
} from '@/lib/push/client';
import { syncReminders } from '@/features/reminders/sync';

const REASON_MESSAGE: Record<string, string> = {
  denied: 'Notifications are blocked. Enable them for this site in your browser settings.',
  unsupported: 'This browser doesn’t support notifications.',
  'not-configured': 'Reminders aren’t set up for this deployment yet.',
  'store-failed': 'Couldn’t save your subscription. Please try again.',
  'bad-subscription': 'Your browser returned an unexpected subscription.',
  'subscribe-failed':
    'Couldn’t subscribe on this device. On iPhone, open Little Things from the Home Screen (not Safari), then try again.',
  timeout: 'This took too long and timed out. Check your connection and try again.',
  unexpected: 'Something went wrong. Please try again.',
};

export function ReminderSettings() {
  const [supported, setSupported] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setSupported(isPushSupported());
    getExistingSubscription()
      .then((sub) => setEnabled(Boolean(sub)))
      .catch(() => {});
  }, []);

  if (!isPushConfigured) {
    return (
      <SettingsSection title="Reminders">
        <SettingsRow
          label="Reminders aren’t set up yet"
          description="Habit reminder times are saved, but sending notifications needs a one-time setup (see the app’s push guide)."
        />
      </SettingsSection>
    );
  }

  const turnOn = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const result = await enablePush();
      if (result.ok) {
        await syncReminders().catch(() => {});
        setEnabled(true);
        setMessage('Reminders are on for this device.');
      } else {
        setMessage(REASON_MESSAGE[result.reason ?? ''] ?? 'Couldn’t turn on reminders.');
      }
    } catch {
      setMessage(REASON_MESSAGE.unexpected!);
    } finally {
      setBusy(false);
    }
  };

  const turnOff = async () => {
    setBusy(true);
    try {
      await disablePush().catch(() => {});
      setEnabled(false);
      setMessage('Reminders turned off for this device.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SettingsSection title="Reminders">
      <SettingsRow
        label={enabled ? 'Reminders on' : 'Turn on reminders'}
        description={
          enabled
            ? 'You’ll be reminded at each habit’s set time on this device.'
            : 'Get a gentle notification at each habit’s reminder time.'
        }
        control={
          !supported ? (
            <span className="text-sm text-muted">Unsupported</span>
          ) : enabled ? (
            <Button size="sm" variant="secondary" disabled={busy} onClick={turnOff}>
              Turn off
            </Button>
          ) : (
            <Button size="sm" disabled={busy} onClick={turnOn}>
              {busy ? 'Enabling…' : 'Enable'}
            </Button>
          )
        }
      />
      <SettingsRow
        label="On iPhone"
        description="Install Little Things to your Home Screen first — iOS only allows notifications for installed apps."
      />
      {message ? <SettingsRow label={message} /> : null}
    </SettingsSection>
  );
}
