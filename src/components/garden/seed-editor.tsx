'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getGoalService } from '@/features/goals/hooks';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { GOAL_ICONS, getGoalIcon, suggestGoalIcon, DEFAULT_GOAL_ICON } from '@/features/goals/icons';
import type { Goal } from '@/features/goals/schemas';

const ICON_KEYS = Object.keys(GOAL_ICONS);

/**
 * A bespoke garden editor for a seed (bucket-list goal): title, a botanical
 * icon, an optional "hoped-for season" target date, and a private note. Edit
 * mode adds delete. Styled as a calm bottom sheet to match the tend sheet.
 */
export function SeedEditor({ goal, onClose }: { goal: Goal | null; onClose: () => void }) {
  const confirm = useConfirm();
  const service = getGoalService();

  const [title, setTitle] = useState(goal?.title ?? '');
  const [notes, setNotes] = useState(goal?.notes ?? '');
  const [icon, setIcon] = useState(goal?.icon ?? DEFAULT_GOAL_ICON);
  const [targetDate, setTargetDate] = useState(goal?.targetDate ?? '');
  const [saving, setSaving] = useState(false);
  const iconTouched = useRef(Boolean(goal));

  // Suggest an icon from the title until the user picks one manually.
  useEffect(() => {
    if (iconTouched.current) return;
    const suggested = suggestGoalIcon(title);
    if (suggested) setIcon(suggested);
  }, [title]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const canSave = title.trim().length > 0 && !saving;
  const PreviewIcon = useMemo(() => getGoalIcon(icon), [icon]);

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    const draft = {
      title: title.trim(),
      notes: notes.trim() ? notes.trim() : undefined,
      icon,
      targetDate: targetDate ? targetDate : null,
    };
    try {
      if (goal) await service.update(goal.id, draft);
      else await service.create(draft);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!goal) return;
    const ok = await confirm({
      title: `Compost “${goal.title}”?`,
      description: 'This removes the seed from this device. It can’t be undone.',
      confirmLabel: 'Compost it',
      destructive: true,
    });
    if (!ok) return;
    await service.remove(goal.id);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={goal ? `Edit ${goal.title}` : 'New seed'}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        background: 'oklch(0.12 0.02 160 / 0.6)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'flex-end',
        animation: 'gd-fade-in 200ms ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '88vh',
          overflowY: 'auto',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          background: 'linear-gradient(180deg, var(--gd-bg-soft), var(--gd-bg))',
          borderTop: '1px solid var(--gd-hair)',
          padding: '14px 22px calc(24px + env(safe-area-inset-bottom))',
          animation: 'gd-sheet-up 320ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 4, background: 'var(--gd-hair-strong)', margin: '0 auto 16px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <button type="button" onClick={onClose} className="gd-eyebrow" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="button" onClick={save} disabled={!canSave} className="gd-eyebrow gd-eyebrow--accent" style={{ background: 'none', border: 'none', cursor: canSave ? 'pointer' : 'default', opacity: canSave ? 1 : 0.4 }}>
            {goal ? 'Save' : 'Plant later'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div
            aria-hidden="true"
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              flexShrink: 0,
              background: 'var(--gd-bg-soft-2)',
              border: '1px solid var(--gd-hair)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gd-gold)',
            }}
          >
            <PreviewIcon size={22} />
          </div>
          <h2 className="gd-h2" style={{ fontSize: 22 }}>
            {goal ? 'Tend the seed' : 'A new seed'}
          </h2>
        </div>

        <label className="gd-eyebrow" htmlFor="seed-title">
          Name it
        </label>
        <input
          id="seed-title"
          className="gd-field"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Run a half marathon"
          style={{ marginTop: 6 }}
          autoFocus={!goal}
        />

        <div className="gd-eyebrow" style={{ marginTop: 18 }}>
          A shape for it
        </div>
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ICON_KEYS.map((key) => {
            const Icon = getGoalIcon(key);
            const active = key === icon;
            return (
              <button
                key={key}
                type="button"
                aria-label={key}
                aria-pressed={active}
                onClick={() => {
                  iconTouched.current = true;
                  setIcon(key);
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: active ? 'var(--gd-moss)' : 'var(--gd-bg-soft)',
                  color: active ? 'var(--gd-bg)' : 'var(--gd-cream-soft)',
                  border: `1px solid ${active ? 'var(--gd-moss)' : 'var(--gd-hair)'}`,
                }}
              >
                <Icon size={18} />
              </button>
            );
          })}
        </div>

        <label className="gd-eyebrow" htmlFor="seed-date" style={{ display: 'block', marginTop: 18 }}>
          Hoped-for season (optional)
        </label>
        <input
          id="seed-date"
          type="date"
          className="gd-field"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          style={{ marginTop: 6, fontFamily: 'var(--gd-font-mono)', fontSize: 15 }}
        />

        <label className="gd-eyebrow" htmlFor="seed-notes" style={{ display: 'block', marginTop: 18 }}>
          Why it matters
        </label>
        <textarea
          id="seed-notes"
          className="gd-field"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="A note to your future self…"
          style={{ marginTop: 6, fontFamily: 'var(--gd-font-ui)', fontSize: 15, resize: 'none' }}
        />

        <button type="button" onClick={save} disabled={!canSave} className="gd-btn gd-btn--primary" style={{ width: '100%', marginTop: 22, opacity: canSave ? 1 : 0.5 }}>
          {goal ? 'Save seed' : 'Add to the packet'}
        </button>

        {goal ? (
          <button type="button" onClick={remove} className="gd-btn gd-btn--ghost" style={{ width: '100%', marginTop: 10, color: 'var(--gd-danger)' }}>
            Compost this seed
          </button>
        ) : null}
      </div>
    </div>
  );
}
