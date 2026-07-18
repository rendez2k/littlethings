'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { AppearanceSettings } from '@/components/settings/appearance-settings';
import { HabitSettings } from '@/components/settings/habit-settings';
import { DataSettings } from '@/components/settings/data-settings';
import { AccountSettings } from '@/components/settings/account-settings';
import { SettingsRow, SettingsSection } from '@/components/settings/settings-section';
import { Footer } from '@/components/layout/footer';
import { APP_VERSION } from '@/lib/constants';

function LinkRow({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description?: string;
}) {
  return (
    <Link href={href} className="block">
      <SettingsRow
        label={label}
        description={description}
        control={<ChevronRight className="h-5 w-5 text-muted" aria-hidden="true" />}
      />
    </Link>
  );
}

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" />

      <AppearanceSettings />
      <HabitSettings />
      <DataSettings />
      <AccountSettings />

      <SettingsSection title="About">
        <SettingsRow
          label="Version"
          control={<span className="text-sm text-muted">{APP_VERSION}</span>}
        />
        <LinkRow href="/whats-new" label="What's new" />
        <LinkRow
          href="/settings/install"
          label="Install Little Things"
          description="Add it to your home screen"
        />
        <LinkRow href="/settings/privacy" label="Privacy" />
        <LinkRow href="/settings/terms" label="Terms" />
        <a href="mailto:redwards2k@gmail.com?subject=Little%20Things%20feedback" className="block">
          <SettingsRow
            label="Feedback"
            description="Tell us what would make this better"
            control={<ChevronRight className="h-5 w-5 text-muted" aria-hidden="true" />}
          />
        </a>
      </SettingsSection>

      <Footer />
    </>
  );
}
