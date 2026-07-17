'use client';

import { getSettingsRepository, useAppSettings } from '@/features/settings/hooks';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Switch } from '@/components/ui/switch';
import { SettingsRow, SettingsSection } from './settings-section';

export function HabitSettings() {
  const settings = useAppSettings();
  const update = (patch: Parameters<ReturnType<typeof getSettingsRepository>['update']>[0]) =>
    getSettingsRepository().update(patch);

  return (
    <SettingsSection title="Habits">
      <SettingsRow label="First day of week">
        <SegmentedControl
          ariaLabel="First day of week"
          value={String(settings.weekStartsOn)}
          onChange={(v) => update({ weekStartsOn: v === '0' ? 0 : 1 })}
          options={[
            { value: '1', label: 'Monday' },
            { value: '0', label: 'Sunday' },
          ]}
        />
      </SettingsRow>

      <SettingsRow
        label="Show streaks"
        description="Display streak flames on habits."
        control={
          <Switch
            ariaLabel="Show streaks"
            checked={settings.showStreaks}
            onChange={(showStreaks) => update({ showStreaks })}
          />
        }
      />

      <SettingsRow
        label="Motivational messages"
        description="Gentle encouragement here and there."
        control={
          <Switch
            ariaLabel="Motivational messages"
            checked={settings.showMotivationalMessages}
            onChange={(showMotivationalMessages) => update({ showMotivationalMessages })}
          />
        }
      />

      <SettingsRow
        label="Completion sound"
        description="A soft sound when you complete a habit."
        control={
          <Switch
            ariaLabel="Completion sound"
            checked={settings.completionSound}
            onChange={(completionSound) => update({ completionSound })}
          />
        }
      />
    </SettingsSection>
  );
}
