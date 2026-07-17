import { z } from 'zod';
import { dateKeySchema } from '@/features/habits/schemas';

/**
 * Bucket-list goals (brief §1): longer-term projects and things to complete,
 * distinct from recurring habits. Kept deliberately simple.
 */
const isoDateTime = z.string().datetime({ offset: true });

export const goalSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1, 'Give it a name').max(120),
  notes: z.string().max(2000).optional(),
  /** Optional aspirational target date. */
  targetDate: dateKeySchema.nullable(),
  done: z.boolean(),
  doneAt: isoDateTime.nullable(),
  sortOrder: z.number(),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
  deletedAt: isoDateTime.nullable(),
});
export type Goal = z.infer<typeof goalSchema>;

export const goalDraftSchema = z.object({
  title: z.string().trim().min(1, 'Give it a name').max(120),
  notes: z.string().max(2000).optional(),
  targetDate: dateKeySchema.nullable().optional(),
});
export type GoalDraft = z.infer<typeof goalDraftSchema>;

/** Form-facing: coerce an empty date/notes field to null/undefined. */
export const goalFormSchema = z.object({
  title: z.string().trim().min(1, 'Give it a name').max(120),
  notes: z.preprocess((v) => (v === '' ? undefined : v), z.string().max(2000).optional()),
  targetDate: z.preprocess(
    (v) => (v === '' || v === undefined ? null : v),
    dateKeySchema.nullable(),
  ),
});
export type GoalFormValues = z.infer<typeof goalFormSchema>;
