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
    version: '0.2.15',
    date: 'See your history',
    items: [
      'A new History section in Insights — a colourful contribution heatmap for every habit, with your current and best streaks.',
      'A little history sparkline on each row in the Habits tab, in the habit’s colour.',
    ],
  },
  {
    version: '0.2.14',
    date: 'Reminders that reach Android',
    items: [
      'Reminders now work natively on Android and iPhone in the app — scheduled right on your device, no account needed.',
      'Swipe right to edit on Today too (not just delete).',
    ],
  },
  {
    version: '0.2.13',
    date: 'Swipe & spring',
    items: [
      'Swipe a habit left to delete, or right to edit — with a soft, springy snap.',
      'Gentle new touches throughout: rows ease in, buttons give a little spring when pressed.',
    ],
  },
  {
    version: '0.2.12',
    date: 'One-offs, groups & confetti',
    items: [
      'A little confetti when you complete a habit or finish a goal (respects Reduced motion).',
      'One-off habits now wait for you on Today until you get to them, then tick off and drift away.',
      'More precise Habits groups: Every few days, Monthly and One-off are their own sections now.',
    ],
  },
  {
    version: '0.2.11',
    date: 'Tidier habit list',
    items: [
      'The Habits tab now groups your habits into Multiple times a day, Daily and Weekly, so the list is easier to scan.',
    ],
  },
  {
    version: '0.2.10',
    date: 'Closing the gap',
    items: [
      'Fixed a big empty gap that appeared below the bottom bar — the app fills the screen again while the page stays put.',
    ],
  },
  {
    version: '0.2.9',
    date: 'No more bouncing',
    items: [
      'Fixed the whole page (and bottom bar) sliding up and down on iPhone — the screen now stays put while only your list scrolls.',
    ],
  },
  {
    version: '0.2.8',
    date: 'A little buzz',
    items: [
      'A gentle haptic tap when you tick off a habit, hit a count goal, or finish a bucket-list goal (on supported devices).',
    ],
  },
  {
    version: '0.2.7',
    date: 'Bottom bar, truly pinned',
    items: [
      'The bottom bar now sits correctly from the very first frame on iPhone — no more starting high and dropping into place after you tap or rotate.',
    ],
  },
  {
    version: '0.2.6',
    date: 'A rock-steady bottom bar',
    items: [
      'The bottom navigation now stays put at the bottom on every screen — no more shifting between pages when installed.',
    ],
  },
  {
    version: '0.2.5',
    date: 'Feels more like an app',
    items: [
      'A steadier launch when installed to your Home Screen — no keyboard springing open, no top-bar jump.',
      'The menu tidies itself once installed, hiding the bits you only need in a browser.',
    ],
  },
  {
    version: '0.2.1',
    date: 'A face for every goal',
    items: [
      'Goals can now have an icon — pick from travel, fitness, learning, home and more.',
      'We suggest a fitting icon from your goal’s name as you type.',
      'Your goals list shows each icon at a glance.',
    ],
  },
  {
    version: '0.2.0',
    date: 'Personal touches',
    items: [
      'A new Pastel theme — soft, gently tinted surfaces.',
      'Tell us your name at setup for a warm welcome and personal encouragement.',
      'Kinder nudges on Today that celebrate your progress.',
      'Faster time and count pickers — hold to change quickly, or type a value.',
      'Look ahead: the Today date strip now moves into future weeks.',
      'A helpful prompt to install Little Things on your home screen.',
    ],
  },
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
