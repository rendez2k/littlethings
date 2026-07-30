'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getHabitService, useHabit } from '@/features/habits/hooks';
import { suggestIcon, DEFAULT_ICON } from '@/features/habits/icons';
import { syncLocalNotifications } from '@/features/reminders/local-sync';
import { useConfirm } from '@/components/ui/confirm-dialog';
import type { HabitColor, Schedule, Target } from '@/features/habits/schemas';
import { ScreenEnter } from '@/components/garden/motion';
import { Seed } from '@/components/garden/plant';
import { gardenColor, gardenVar, type GardenColor } from '@/components/garden/mapping';
import { todayKey, type Weekday } from '@/lib/dates';

const GARDEN_TO_HABIT: Record<GardenColor, HabitColor> = {
  moss: 'mint',
  bloom: 'peach',
  sky: 'sky',
  gold: 'lemon',
  plum: 'lavender',
};
const COLORS: GardenColor[] = ['moss', 'bloom', 'sky', 'gold', 'plum'];

type FreqType = Schedule['type'];
const FREQS: [FreqType, string][] = [
  ['daily', 'Every day'],
  ['weekdays', 'Certain days'],
  ['times_per_week', 'Times a week'],
  ['times_per_month', 'Times a month'],
  ['every_n_days', 'Every few days'],
  ['once', 'One-off'],
];
const WEEKDAYS: [Weekday, string][] = [
  [0, 'S'],
  [1, 'M'],
  [2, 'T'],
  [3, 'W'],
  [4, 'T'],
  [5, 'F'],
  [6, 'S'],
];
type TargetType = Target['type'];
const TARGETS: [TargetType, string][] = [
  ['boolean', 'Just showed up'],
  ['count', 'A number'],
  ['duration', 'Minutes'],
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="gd-eyebrow">{children}</div>;
}

function Stepper({ value, min, max, onChange, suffix }: { value: number; min: number; max: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'var(--gd-bg-soft)', border: '1px solid var(--gd-hair)', borderRadius: 999, padding: '4px 6px' }}>
      <button type="button" aria-label="Decrease" onClick={() => onChange(Math.max(min, value - 1))} style={{ width: 30, height: 30, borderRadius: 999, border: 'none', background: 'transparent', color: 'var(--gd-cream)', cursor: 'pointer', fontSize: 18 }}>
        −
      </button>
      <span className="gd-numeric" style={{ minWidth: 44, textAlign: 'center', fontSize: 15 }}>
        {value}
        {suffix ? <span style={{ color: 'var(--gd-cream-faint)', fontSize: 12 }}> {suffix}</span> : null}
      </span>
      <button type="button" aria-label="Increase" onClick={() => onChange(Math.min(max, value + 1))} style={{ width: 30, height: 30, borderRadius: 999, border: 'none', background: 'transparent', color: 'var(--gd-moss)', cursor: 'pointer', fontSize: 18 }}>
        +
      </button>
    </div>
  );
}

function PlantEditor() {
  const router = useRouter();
  const confirm = useConfirm();
  const search = useSearchParams();
  const editId = search.get('id');
  const existing = useHabit(editId);
  const isEdit = Boolean(editId);

  const [ready, setReady] = useState(!editId);
  const [name, setName] = useState('');
  const [color, setColor] = useState<GardenColor>('moss');
  const [freq, setFreq] = useState<FreqType>('daily');
  const [weekdays, setWeekdays] = useState<Weekday[]>([1, 2, 3, 4, 5]);
  const [perWeek, setPerWeek] = useState(3);
  const [perMonth, setPerMonth] = useState(5);
  const [interval, setInterval] = useState(2);
  const [kind, setKind] = useState<TargetType>('boolean');
  const [amount, setAmount] = useState(1);
  const [unit, setUnit] = useState('times');
  const [reminderOn, setReminderOn] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const [startDate, setStartDate] = useState(todayKey(new Date()));
  const [endDate, setEndDate] = useState('');
  const [more, setMore] = useState(false);
  const [saving, setSaving] = useState(false);

  // Prefill when editing.
  useEffect(() => {
    if (!editId || !existing || ready) return;
    const h = existing;
    setName(h.name);
    setColor(gardenColor(h.color));
    setFreq(h.schedule.type);
    if (h.schedule.type === 'weekdays') setWeekdays(h.schedule.weekdays);
    if (h.schedule.type === 'times_per_week') setPerWeek(h.schedule.timesPerWeek);
    if (h.schedule.type === 'times_per_month') setPerMonth(h.schedule.timesPerMonth);
    if (h.schedule.type === 'every_n_days') setInterval(h.schedule.intervalDays);
    setKind(h.target.type);
    if (h.target.type !== 'boolean') {
      setAmount(h.target.amount);
      setUnit(h.target.type === 'duration' ? 'minutes' : h.target.unit);
    }
    setReminderOn(h.reminder.enabled);
    setReminderTime(h.reminder.time);
    setNotes(h.notes ?? '');
    setStartDate(h.startDate);
    setEndDate(h.endDate ?? '');
    if (h.notes || h.endDate) setMore(true);
    setReady(true);
  }, [editId, existing, ready]);

  const scheduleFor = useMemo((): Schedule => {
    switch (freq) {
      case 'weekdays':
        return { type: 'weekdays', weekdays: weekdays.length ? [...weekdays].sort() : [1] };
      case 'times_per_week':
        return { type: 'times_per_week', timesPerWeek: perWeek };
      case 'times_per_month':
        return { type: 'times_per_month', timesPerMonth: perMonth };
      case 'every_n_days':
        return { type: 'every_n_days', intervalDays: interval };
      case 'once':
        return { type: 'once' };
      default:
        return { type: 'daily' };
    }
  }, [freq, weekdays, perWeek, perMonth, interval]);

  const targetFor = useMemo((): Target => {
    if (kind === 'count') return { type: 'count', amount: Math.max(1, amount), unit: unit.trim() || 'times' };
    if (kind === 'duration') return { type: 'duration', amount: Math.max(1, amount), unit: 'minutes' };
    return { type: 'boolean' };
  }, [kind, amount, unit]);

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      const draft = {
        name: trimmed,
        notes: notes.trim() || undefined,
        icon: isEdit && existing ? existing.icon : suggestIcon(trimmed) ?? DEFAULT_ICON,
        color: GARDEN_TO_HABIT[color],
        schedule: scheduleFor,
        target: targetFor,
        reminder: { enabled: reminderOn, time: reminderTime },
        startDate,
        endDate: endDate ? endDate : null,
      };
      if (isEdit && editId) {
        await getHabitService().update(editId, draft);
      } else {
        await getHabitService().create(draft);
      }
      void syncLocalNotifications();
      router.push(isEdit && editId ? `/habits/${editId}` : '/habits');
    } catch {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!editId) return;
    const ok = await confirm({
      title: `Pull up “${name}”?`,
      description: 'This removes the plant and its whole history from this device. It can’t be undone.',
      confirmLabel: 'Pull it up',
      destructive: true,
    });
    if (!ok) return;
    await getHabitService().softDelete(editId);
    router.push('/habits');
  };

  if (editId && !ready) return <div style={{ padding: '54px 24px' }} />;

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
          {saving ? 'Saving…' : isEdit ? 'Save' : 'Plant'}
        </button>
      </div>

      <ScreenEnter stagger={40}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--gd-bg-soft-2)', border: '1.5px dashed var(--gd-moss)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Seed color={gardenVar(color)} size={38} />
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h1 className="gd-h1" style={{ fontSize: 26, lineHeight: 1.15 }}>
            {isEdit ? (
              <>
                Tend this <em>plant</em>
              </>
            ) : (
              <>
                Plant a new <em style={{ color: 'var(--gd-bloom)' }}>seed</em>
              </>
            )}
          </h1>
        </div>

        <div style={{ marginTop: 24 }}>
          <label className="gd-eyebrow" htmlFor="seed-name">
            Name it
          </label>
          <input id="seed-name" className="gd-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Read for twenty minutes" style={{ marginTop: 6 }} />
        </div>

        <div style={{ marginTop: 20 }}>
          <Eyebrow>A colour to grow in</Eyebrow>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Choose ${c}`}
                style={{ width: 34, height: 34, borderRadius: '50%', background: gardenVar(c), border: color === c ? '2px solid var(--gd-cream)' : '2px solid transparent', boxShadow: color === c ? `0 0 0 3px ${gardenVar(c)}` : 'none', padding: 0, cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <Eyebrow>How often to tend it</Eyebrow>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {FREQS.map(([k, l]) => (
              <button key={k} type="button" onClick={() => setFreq(k)} className={'gd-chip' + (freq === k ? ' gd-chip--active' : '')}>
                {l}
              </button>
            ))}
          </div>
          {freq === 'weekdays' ? (
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              {WEEKDAYS.map(([d, l]) => {
                const on = weekdays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setWeekdays((ws) => (on ? ws.filter((x) => x !== d) : [...ws, d]))}
                    style={{ width: 36, height: 36, borderRadius: 999, border: `1px solid ${on ? 'var(--gd-moss)' : 'var(--gd-hair)'}`, background: on ? 'var(--gd-moss)' : 'var(--gd-bg-soft)', color: on ? 'var(--gd-bg)' : 'var(--gd-cream)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          ) : null}
          {freq === 'times_per_week' ? (
            <div style={{ marginTop: 10 }}>
              <Stepper value={perWeek} min={1} max={7} onChange={setPerWeek} suffix="a week" />
            </div>
          ) : null}
          {freq === 'times_per_month' ? (
            <div style={{ marginTop: 10 }}>
              <Stepper value={perMonth} min={1} max={31} onChange={setPerMonth} suffix="a month" />
            </div>
          ) : null}
          {freq === 'every_n_days' ? (
            <div style={{ marginTop: 10 }}>
              <Stepper value={interval} min={1} max={365} onChange={setInterval} suffix="days apart" />
            </div>
          ) : null}
        </div>

        <div style={{ marginTop: 20 }}>
          <Eyebrow>How you&rsquo;ll know it&rsquo;s tended</Eyebrow>
          <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {TARGETS.map(([k, l]) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                style={{ padding: '10px 8px', borderRadius: 10, textAlign: 'center', fontSize: 11, background: kind === k ? 'var(--gd-bg-soft-2)' : 'var(--gd-bg-soft)', color: 'var(--gd-cream)', cursor: 'pointer', border: `1px solid ${kind === k ? 'var(--gd-moss)' : 'var(--gd-hair)'}` }}
              >
                {l}
              </button>
            ))}
          </div>
          {kind === 'count' ? (
            <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <Stepper value={amount} min={1} max={1000} onChange={setAmount} />
              <input aria-label="Unit" className="gd-field" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="glasses" style={{ width: 140, fontSize: 15, fontFamily: 'var(--gd-font-ui)' }} />
              <span className="gd-body-sm">a day</span>
            </div>
          ) : null}
          {kind === 'duration' ? (
            <div style={{ marginTop: 10 }}>
              <Stepper value={amount} min={1} max={600} onChange={setAmount} suffix="min a day" />
            </div>
          ) : null}
        </div>

        <div style={{ marginTop: 20 }}>
          <Eyebrow>A gentle nudge</Eyebrow>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, gap: 12 }}>
            <button
              type="button"
              role="switch"
              aria-checked={reminderOn}
              aria-label="Enable reminder"
              onClick={() => setReminderOn((v) => !v)}
              style={{ width: 46, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer', background: reminderOn ? 'var(--gd-moss)' : 'var(--gd-hair)', position: 'relative', transition: 'background 200ms', flexShrink: 0 }}
            >
              <span style={{ position: 'absolute', top: 3, left: reminderOn ? 21 : 3, width: 22, height: 22, borderRadius: 999, background: 'var(--gd-cream)', transition: 'left 200ms' }} />
            </button>
            {reminderOn ? (
              <input type="time" aria-label="Reminder time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="gd-field" style={{ width: 140, fontFamily: 'var(--gd-font-mono)', fontSize: 15 }} />
            ) : (
              <span className="gd-body-sm">Off</span>
            )}
          </div>
        </div>

        <button type="button" onClick={() => setMore((v) => !v)} className="gd-eyebrow" style={{ marginTop: 22, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'block' }}>
          {more ? '– Fewer options' : '+ More options'}
        </button>
        {more ? (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <Eyebrow>Planted on</Eyebrow>
                <input type="date" aria-label="Start date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="gd-field" style={{ marginTop: 6, fontFamily: 'var(--gd-font-mono)', fontSize: 14 }} />
              </div>
              <div>
                <Eyebrow>Until (optional)</Eyebrow>
                <input type="date" aria-label="End date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="gd-field" style={{ marginTop: 6, fontFamily: 'var(--gd-font-mono)', fontSize: 14 }} />
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <Eyebrow>Notes</Eyebrow>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Anything you want to remember" className="gd-field" style={{ marginTop: 6, fontFamily: 'var(--gd-font-ui)', fontSize: 15, resize: 'vertical' }} />
            </div>
          </div>
        ) : null}

        {isEdit ? (
          <button type="button" onClick={remove} className="gd-btn gd-btn--ghost" style={{ width: '100%', marginTop: 24, color: 'var(--gd-danger)', borderColor: 'var(--gd-hair)' }}>
            Pull this plant up
          </button>
        ) : null}
      </ScreenEnter>
    </div>
  );
}

export default function PlantEditorPage() {
  return (
    <Suspense fallback={<div style={{ padding: '54px 24px' }} />}>
      <PlantEditor />
    </Suspense>
  );
}
