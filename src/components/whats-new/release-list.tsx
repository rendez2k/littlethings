'use client';

import { useLook } from '@/components/theme/appearance-provider';

export interface Release {
  version: string;
  date: string;
  items: string[];
}

/** The What's-new body (intro + release cards), styled per the look setting. */
export function ReleaseList({ releases, version }: { releases: Release[]; version: string }) {
  const look = useLook();

  if (look === 'classic') {
    return (
      <>
        <p className="text-muted">You&rsquo;re on version {version}. Here&rsquo;s what&rsquo;s new.</p>
        {releases.map((release) => (
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
      </>
    );
  }

  return (
    <>
      <p className="gd-body-sm">
        You&rsquo;re on version {version}. Here&rsquo;s what&rsquo;s new.
      </p>
      {releases.map((release) => (
        <section key={release.version} className="gd-card" style={{ padding: 16 }}>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 style={{ fontFamily: 'var(--gd-font-display)', fontSize: 18, color: 'var(--gd-cream)' }}>
              <em style={{ color: 'var(--gd-moss)', fontStyle: 'italic' }}>{release.date}</em>
            </h2>
            <span className="gd-eyebrow" style={{ flexShrink: 0 }}>
              v{release.version}
            </span>
          </div>
          <ul className="list-disc space-y-1.5 pl-5 gd-body-sm marker:text-[color:var(--gd-moss)]">
            {release.items.map((item) => (
              <li key={item} style={{ lineHeight: 1.5 }}>
                {item}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
