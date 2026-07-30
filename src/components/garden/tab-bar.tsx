'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Tab {
  href: string;
  label: string;
  key: 'garden' | 'plants' | 'seeds' | 'season' | 'shed';
}

const TABS: Tab[] = [
  { href: '/', label: 'Garden', key: 'garden' },
  { href: '/habits', label: 'Plants', key: 'plants' },
  { href: '/goals', label: 'Seeds', key: 'seeds' },
  { href: '/insights', label: 'Season', key: 'season' },
  { href: '/settings', label: 'Shed', key: 'shed' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function TabIcon({ tab, on }: { tab: Tab['key']; on: boolean }) {
  const c = on ? 'var(--gd-moss)' : 'var(--gd-cream-faint)';
  const p = { stroke: c, strokeWidth: 1.6, strokeLinecap: 'round' as const, fill: 'none' };
  if (tab === 'garden')
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 20 Q8 14 12 14 Q16 14 20 20" {...p} />
        <circle cx="12" cy="10" r="3" {...p} />
        <path d="M12 7 L12 3" {...p} />
      </svg>
    );
  if (tab === 'plants')
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20 L12 8" {...p} />
        <path d="M8 12 Q6 10 6 8 Q9 8 11 11" {...p} />
        <path d="M16 10 Q18 8 18 6 Q15 6 13 9" {...p} />
      </svg>
    );
  if (tab === 'seeds')
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <ellipse cx="12" cy="12" rx="4" ry="6" {...p} />
        <path d="M12 6 L12 18" stroke={c} strokeWidth="1.4" opacity="0.5" />
      </svg>
    );
  if (tab === 'shed')
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 11 L12 5 L20 11" {...p} />
        <path d="M6 11 L6 20 L18 20 L18 11" {...p} />
        <path d="M11 20 L11 15" {...p} />
      </svg>
    );
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" {...p} />
      <path d="M12 8 L12 12 L15 14" {...p} />
    </svg>
  );
}

export function GardenTabBar() {
  const pathname = usePathname();
  // Hidden on the modal-ish detail / add-habit surfaces (handoff §Navigation).
  if (pathname.startsWith('/habits/') || pathname === '/plant') return null;
  return (
    <nav className="gd-tabbar" aria-label="Primary">
      {TABS.map((t) => {
        const active = isActive(pathname, t.href);
        return (
          <Link key={t.key} href={t.href} className="gd-tab" aria-current={active ? 'page' : undefined}>
            <TabIcon tab={t.key} on={active} />
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
