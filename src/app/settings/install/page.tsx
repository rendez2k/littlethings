import type { Metadata } from 'next';
import { SubPage } from '@/components/layout/sub-page';

export const metadata: Metadata = { title: 'Install' };

function Steps({ title, steps }: { title: string; steps: string[] }) {
  return (
    <section className="rounded-card border border-border bg-surface p-4">
      <h2 className="mb-2 text-base font-semibold text-text">{title}</h2>
      <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted marker:text-primary">
        {steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
    </section>
  );
}

export default function InstallPage() {
  return (
    <SubPage title="Install Little Things">
      <p className="text-muted">
        Add Little Things to your home screen to use it like a native app — full screen and offline.
      </p>
      <Steps
        title="iPhone & iPad (Safari)"
        steps={[
          'Open Little Things in Safari.',
          'Tap the Share button (the square with an arrow).',
          'Scroll down and tap “Add to Home Screen”.',
          'Tap “Add” — the icon appears on your home screen.',
        ]}
      />
      <Steps
        title="Android (Chrome)"
        steps={[
          'Open Little Things in Chrome.',
          'Tap the ⋮ menu in the top right.',
          'Tap “Install app” or “Add to Home screen”.',
          'Confirm — the app installs to your launcher.',
        ]}
      />
      <Steps
        title="Desktop (Chrome & Edge)"
        steps={[
          'Open Little Things in your browser.',
          'Look for the install icon in the address bar, or open the ⋮ menu.',
          'Choose “Install Little Things”.',
        ]}
      />
      <p className="text-muted">
        Notifications and install options vary by browser and operating system, so the exact wording
        may differ on your device.
      </p>
    </SubPage>
  );
}
