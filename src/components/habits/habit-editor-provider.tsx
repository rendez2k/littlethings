'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { todayKey } from '@/lib/dates';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { getHabitService } from '@/features/habits/hooks';
import { syncReminders } from '@/features/reminders/sync';
import { syncLocalNotifications } from '@/features/reminders/local-sync';
import { emptyDraft, habitToDraft } from '@/features/habits/draft';
import { templateToDraft, type HabitTemplate } from '@/features/habits/templates';
import type { Habit, HabitDraft } from '@/features/habits/schemas';
import { HabitForm } from './habit-form';
import { TemplatePicker } from './template-picker';

const FORM_ID = 'habit-editor-form';

interface EditorContextValue {
  openCreate: (prefill?: HabitDraft) => void;
  openTemplates: () => void;
  openEdit: (habit: Habit) => void;
  close: () => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

type EditorState =
  | { kind: 'closed' }
  | { kind: 'templates'; token: number }
  | { kind: 'create'; draft: HabitDraft; token: number }
  | { kind: 'edit'; habit: Habit; draft: HabitDraft; token: number };

export function HabitEditorProvider({ children }: { children: ReactNode }) {
  const confirm = useConfirm();
  const [state, setState] = useState<EditorState>({ kind: 'closed' });
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState(0);

  const nextToken = useCallback(() => {
    const t = token + 1;
    setToken(t);
    return t;
  }, [token]);

  const close = useCallback(() => setState({ kind: 'closed' }), []);

  const openCreate = useCallback(
    (prefill?: HabitDraft) => {
      setState({ kind: 'create', draft: prefill ?? emptyDraft(todayKey()), token: nextToken() });
    },
    [nextToken],
  );

  const openTemplates = useCallback(() => {
    setState({ kind: 'templates', token: nextToken() });
  }, [nextToken]);

  const openEdit = useCallback(
    (habit: Habit) => {
      setState({ kind: 'edit', habit, draft: habitToDraft(habit), token: nextToken() });
    },
    [nextToken],
  );

  const value = useMemo<EditorContextValue>(
    () => ({ openCreate, openTemplates, openEdit, close }),
    [openCreate, openTemplates, openEdit, close],
  );

  const handleSave = useCallback(
    async (draft: HabitDraft) => {
      if (submitting) return;
      setSubmitting(true);
      try {
        if (state.kind === 'edit') {
          await getHabitService().update(state.habit.id, draft);
        } else {
          await getHabitService().create(draft);
        }
        // Keep reminders in step (best-effort): Web Push on browsers, native
        // local notifications in the app. Each no-ops when not applicable.
        void syncReminders();
        void syncLocalNotifications();
        close();
      } finally {
        setSubmitting(false);
      }
    },
    [state, submitting, close],
  );

  const handleDelete = useCallback(async () => {
    if (state.kind !== 'edit') return;
    const ok = await confirm({
      title: `Delete “${state.habit.name}”?`,
      description: 'This removes the habit and its history from this device. It can’t be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    await getHabitService().softDelete(state.habit.id);
    void syncReminders();
    void syncLocalNotifications();
    close();
  }, [state, close, confirm]);

  const pickTemplate = useCallback(
    (template: HabitTemplate) => {
      openCreate(templateToDraft(template, todayKey()));
    },
    [openCreate],
  );

  const editorOpen = state.kind === 'create' || state.kind === 'edit';

  return (
    <EditorContext.Provider value={value}>
      {children}

      <Sheet
        open={editorOpen}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        title={state.kind === 'edit' ? 'Edit habit' : 'New habit'}
        description="Create or edit a habit"
        leftSlot={
          <Button variant="ghost" size="sm" onClick={close}>
            Cancel
          </Button>
        }
        rightSlot={
          <Button type="submit" form={FORM_ID} size="sm" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save'}
          </Button>
        }
      >
        {editorOpen ? (
          <HabitForm
            key={state.token}
            formId={FORM_ID}
            mode={state.kind === 'edit' ? 'edit' : 'create'}
            initialDraft={state.draft}
            onSubmit={handleSave}
            onDelete={state.kind === 'edit' ? handleDelete : undefined}
          />
        ) : null}
      </Sheet>

      <Sheet
        open={state.kind === 'templates'}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        title="Templates"
        description="Choose a habit template"
        leftSlot={
          <Button variant="ghost" size="sm" onClick={close}>
            Close
          </Button>
        }
        rightSlot={
          <Button variant="ghost" size="sm" onClick={() => openCreate()}>
            Custom
          </Button>
        }
      >
        <TemplatePicker onPick={pickTemplate} />
      </Sheet>
    </EditorContext.Provider>
  );
}

export function useHabitEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useHabitEditor must be used within a HabitEditorProvider');
  return ctx;
}
