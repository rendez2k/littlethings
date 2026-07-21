'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { NAV_ITEMS } from './nav-items';

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className={cn(
        'z-40 shrink-0 border-t border-border bg-surface/85 backdrop-blur-lg',
        'pb-safe-bottom',
      )}
    >
      <ul className="mx-auto flex max-w-app items-stretch justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex min-h-[3.25rem] flex-col items-center justify-center gap-1 rounded-xl py-2 text-[0.6875rem] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted hover:text-text',
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn('h-6 w-6 transition-transform', active && 'scale-105')}
                  strokeWidth={active ? 2.4 : 2}
                />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
