import type { Metadata } from 'next';
import { SubPage } from '@/components/layout/sub-page';
import { APP_VERSION } from '@/lib/constants';

export const metadata: Metadata = { title: "What's new" };

interface Release {
  version: string;
  date: string;
  items: string[];
}

const RELEASES: Release[] = [
  {
    version: '0.1.0',
    date: 'First release',
    items: [
      'Track habits privately on your device — no account needed.',
      'Daily, weekday, times-per-week/month, every-N-days and one-off schedules.',
      'Simple, count and duration targets with gentle streaks.',
      'A bucket list for your longer-term goals.',
      'Insights: completion trends, perfect days and your most consistent day.',
      'Light, dark and system themes with six accent palettes.',
      'Export and import your data as JSON.',
      'Installable as an app and fully usable offline.',
    ],
  },
];

export default function WhatsNewPage() {
  return (
    <SubPage title="What's new">
      <p className="text-muted">
        You&rsquo;re on version {APP_VERSION}. Here&rsquo;s what&rsquo;s new.
      </p>
      {RELEASES.map((release) => (
        <section key={release.version} className="rounded-card border border-border bg-surface p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-base font-semibold text-text">Version {release.version}</h2>
            <span className="text-xs text-muted">{release.date}</span>
          </div>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted marker:text-primary">
            {release.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </SubPage>
  );
}
