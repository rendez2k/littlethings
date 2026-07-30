'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getHabitService } from '@/features/habits/hooks';
import { suggestIcon, DEFAULT_ICON } from '@/features/habits/icons';
import type { HabitColor, Schedule, Target } from '@/features/habits/schemas';
import { Seed } from '@/components/garden/plant';
import { ScreenEnter } from '@/components/garden/motion';
import { gardenVar, type GardenColor } from '@/components/garden/mapping';
import { todayKey } from '@/lib/dates';

const GARDEN_TO_HABIT: Record<GardenColor, HabitColor> = {
  moss: 'mint',
  bloom: 'peach',
  sky: 'sky',
  gold: 'lemon',
  plum: 'lavender',
};

type Freq = 'daily' | 'weekdays' | 'xperweek' | 'some';
type Kind = 'bool' | 'count' | 'dur';

const SCHEDULE_FOR: Record<Freq, Schedule> = {
  daily: { type: 'daily' },
  weekdays: { type: 'weekdays', weekdays: [1, 2, 3, 4, 5] },
  xperweek: { type: 'times_per_week', timesPerWeek: 3 },
  some: { type: 'every_n_days', intervalDays: 2 },
};

const TARGET_FOR: Record<Kind, Target> = {
  bool: { type: 'boolean' },
  count: { type: 'count', amount: 1, unit: 'times' },
  dur: { type: 'duration', amount: 20, unit: 'minutes' },
};

const COLORS: GardenColor[] = ['moss', 'bloom', 'sky', 'gold', 'plum'];
const FREQS: [Freq, string][] = [
  ['daily', 'Every day'],
  ['weekdays', 'Weekdays'],
  ['xperweek', 'A few a week'],
  ['some', 'Some days'],
];
const KINDS: [Kind, string][] = [
  ['bool', 'Just showed up'],
  ['count', 'A number'],
  ['dur', '20 min'],
];

export default function PlantPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [color, setColor] = useState<GardenColor>('moss');
  const [freq, setFreq] = useState<Freq>('daily');
  const [kind, setKind] = useState<Kind>('bool');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      await getHabitService().create({
        name: trimmed,
        icon: suggestIcon(trimmed) ?? DEFAULT_ICON,
        color: GARDEN_TO_HABIT[color],
        schedule: SCHEDULE_FOR[freq],
        target: TARGET_FOR[kind],
        reminder: { enabled: false, time: '09:00' },
        startDate: todayKey(new Date()),
        endDate: null,
      });
      router.push('/habits');
    } catch {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '54px 24px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button type="button" onClick={() => router.back()} className="gd-eyebrow" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!name.trim() || saving}
          className="gd-eyebrow gd-eyebrow--accent"
          style={{ background: 'none', border: 'none', cursor: name.trim() ? 'pointer' : 'default', padding: 0, fontWeight: 700, opacity: name.trim() ? 1 : 0.4 }}
        >
          {saving ? 'Planting…' : 'Plant'}
        </button>
      </div>

      <ScreenEnter stagger={50}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              background: 'var(--gd-bg-soft-2)',
              border: '1.5px dashed var(--gd-moss)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Seed color={gardenVar(color)} size={40} />
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h1 className="gd-h1" style={{ fontSize: 26, lineHeight: 1.15 }}>
            Plant a new <em style={{ color: 'var(--gd-bloom)' }}>seed</em>
          </h1>
        </div>

        <div style={{ marginTop: 24 }}>
          <label className="gd-eyebrow" htmlFor="seed-name">
            Name it
          </label>
          <input
            id="seed-name"
            className="gd-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Read for twenty minutes"
            style={{ marginTop: 6 }}
          />
        </div>

        <div style={{ marginTop: 20 }}>
          <div className="gd-eyebrow">A colour to grow in</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Choose ${c}`}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: gardenVar(c),
                  border: color === c ? '2px solid var(--gd-cream)' : '2px solid transparent',
                  boxShadow: color === c ? `0 0 0 3px ${gardenVar(c)}` : 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div className="gd-eyebrow">How often to tend it</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {FREQS.map(([k, l]) => (
              <button key={k} type="button" onClick={() => setFreq(k)} className={'gd-chip' + (freq === k ? ' gd-chip--active' : '')}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div className="gd-eyebrow">How you&rsquo;ll know it&rsquo;s tended</div>
          <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {KINDS.map(([k, l]) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                style={{
                  padding: '10px 8px',
                  borderRadius: 10,
                  textAlign: 'center',
                  fontSize: 11,
                  background: kind === k ? 'var(--gd-bg-soft-2)' : 'var(--gd-bg-soft)',
                  color: 'var(--gd-cream)',
                  cursor: 'pointer',
                  border: `1px solid ${kind === k ? 'var(--gd-moss)' : 'var(--gd-hair)'}`,
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </ScreenEnter>
    </div>
  );
}
