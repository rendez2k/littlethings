import type { Metadata } from 'next';
import { SubPage } from '@/components/layout/sub-page';

export const metadata: Metadata = { title: 'Privacy' };

export default function PrivacyPage() {
  return (
    <SubPage title="Privacy">
      <p>
        Little Things is private by design. Your habits, goals and history are stored{' '}
        <strong>only on this device</strong>, in your browser&rsquo;s local storage. They are not
        sent to any server.
      </p>
      <p>
        There is <strong>no analytics, no advertising and no tracking</strong>. We don&rsquo;t
        collect usage data, and there are no third-party trackers in the app.
      </p>
      <p>
        Because your data lives on this device, clearing your browser data or uninstalling the app
        will remove it. Use <strong>Export data</strong> in Settings to keep a backup.
      </p>
      <p>
        If you choose to create an optional account in a future update, only the information needed
        to sign in and sync would be involved, and it would always be optional. Signing in or out
        never deletes your local data.
      </p>
      <p className="text-muted">
        This page describes how the app actually behaves today. It will be updated if the behaviour
        changes.
      </p>
    </SubPage>
  );
}
