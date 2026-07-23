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
import {
  cancelAllLocalNotifications,
  isLocalNotificationsAvailable,
  localNotificationPermission,
  requestLocalNotificationPermission,
} from '@/lib/native-notifications';
import {
  localRemindersEnabled,
  setLocalRemindersEnabled,
  syncLocalNotifications,
} from '@/features/reminders/local-sync';

export function ReminderSettings() {
  // Detect the native Local Notifications plugin after mount (avoids a
  // hydration mismatch — it's false during SSR / the first client render).
  const [native, setNative] = useState(false);
  useEffect(() => {
    setNative(isLocalNotificationsAvailable());
  }, []);

  return native ? <NativeReminders /> : <WebPushReminders />;
}

/* --------------------------- Native (Capacitor) --------------------------- */

function NativeReminders() {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    localNotificationPermission()
      .then((perm) => setEnabled(localRemindersEnabled() && perm === 'granted'))
      .catch(() => {});
  }, []);

  const turnOn = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const granted = await requestLocalNotificationPermission();
      if (!granted) {
        setMessage('Notifications are blocked. Allow them for Little Things in your device settings.');
        return;
      }
      setLocalRemindersEnabled(true);
      await syncLocalNotifications();
      setEnabled(true);
      setMessage('Reminders are on. Set a reminder time on any habit.');
    } catch {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const turnOff = async () => {
    setBusy(true);
    try {
      setLocalRemindersEnabled(false);
      await cancelAllLocalNotifications();
      setEnabled(false);
      setMessage('Reminders turned off.');
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
            ? 'Scheduled on this device — you’ll be nudged at each habit’s reminder time, even offline.'
            : 'A gentle notification at each habit’s reminder time, scheduled right on your device.'
        }
        control={
          enabled ? (
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
      {message ? <SettingsRow label={message} /> : null}
    </SettingsSection>
  );
}

/* ------------------------------- Web Push -------------------------------- */

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

function WebPushReminders() {
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
        const base = REASON_MESSAGE[result.reason ?? ''] ?? 'Couldn’t turn on reminders.';
        setMessage(result.detail ? `${base} (${result.detail})` : base);
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
