import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/page-header';
import { AppearanceSettings } from '@/components/settings/appearance-settings';
import { SettingsRow, SettingsSection } from '@/components/settings/settings-section';
import { APP_VERSION } from '@/lib/constants';

export const metadata: Metadata = { title: 'Settings' };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" />

      <AppearanceSettings />

      <SettingsSection title="Data">
        <SettingsRow
          label="Export & import"
          description="JSON backup and restore arrives in a later phase."
        />
        <SettingsRow
          label="Everything stays on this device"
          description="Your habits are stored locally. Nothing is sent anywhere."
        />
      </SettingsSection>

      <SettingsSection title="Account">
        <SettingsRow
          label="Using Little Things without an account"
          description="No sign-in required. Optional cloud sync may be offered in the future so you can use multiple devices."
        />
      </SettingsSection>

      <SettingsSection title="About">
        <SettingsRow label="Version" control={<span className="text-sm text-muted">{APP_VERSION}</span>} />
        <SettingsRow label="Privacy" description="Little Things does not track you or run ads." />
      </SettingsSection>
    </>
  );
}
