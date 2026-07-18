'use client';

import { Check } from 'lucide-react';
import { useAppearance } from '@/components/theme/appearance-provider';
import {
  accentVariant,
  PALETTES,
  PALETTE_LABELS,
  PALETTE_SWATCHES,
  type Palette,
  type ResolvedTheme,
} from '@/features/settings/appearance';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Switch } from '@/components/ui/switch';
import { SettingsRow, SettingsSection } from './settings-section';
import { cn } from '@/lib/cn';

export function AppearanceSettings() {
  const { appearance, resolvedTheme, setAppearance } = useAppearance();

  return (
    <SettingsSection title="Appearance">
      <SettingsRow label="Theme" description="Match your device or choose a look.">
        <SegmentedControl
          ariaLabel="Theme"
          value={appearance.theme}
          onChange={(theme) => setAppearance({ theme })}
          options={[
            { value: 'system', label: 'System' },
            { value: 'light', label: 'Light' },
            { value: 'pastel', label: 'Pastel' },
            { value: 'dark', label: 'Dark' },
          ]}
        />
      </SettingsRow>

      <SettingsRow label="Accent palette" description="Sets primary controls and highlights.">
        <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Accent palette">
          {PALETTES.map((palette) => (
            <PaletteSwatch
              key={palette}
              palette={palette}
              selected={appearance.palette === palette}
              theme={resolvedTheme}
              onSelect={() => setAppearance({ palette })}
            />
          ))}
        </div>
      </SettingsRow>

      <SettingsRow label="Habit cards" description="How much breathing room each card has.">
        <SegmentedControl
          ariaLabel="Card density"
          value={appearance.density}
          onChange={(density) => setAppearance({ density })}
          options={[
            { value: 'comfortable', label: 'Comfortable' },
            { value: 'compact', label: 'Compact' },
          ]}
        />
      </SettingsRow>

      <SettingsRow
        label="Reduced motion"
        description="Minimise transitions and animations."
        control={
          <Switch
            ariaLabel="Reduced motion"
            checked={appearance.reducedMotion}
            onChange={(reducedMotion) => setAppearance({ reducedMotion })}
          />
        }
      />
    </SettingsSection>
  );
}

function PaletteSwatch({
  palette,
  selected,
  theme,
  onSelect,
}: {
  palette: Palette;
  selected: boolean;
  theme: ResolvedTheme;
  onSelect: () => void;
}) {
  const variant = accentVariant(theme);
  const color = PALETTE_SWATCHES[palette][variant];
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={PALETTE_LABELS[palette]}
      title={PALETTE_LABELS[palette]}
      onClick={onSelect}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-surface transition',
        selected ? 'ring-focus' : 'ring-transparent hover:ring-border',
      )}
      style={{ backgroundColor: color }}
    >
      {selected ? (
        <Check
          aria-hidden="true"
          className="h-5 w-5"
          strokeWidth={3}
          style={{ color: variant === 'dark' ? '#17151f' : '#ffffff' }}
        />
      ) : null}
    </button>
  );
}
