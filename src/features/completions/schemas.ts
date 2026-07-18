import { z } from 'zod';
import { dateKeySchema } from '@/features/habits/schemas';

/**
 * Completion records are stored separately from habit definitions (brief §11).
 * Absence of a record for a scheduled past day means "missed" — we never store
 * a record for that. Only explicit outcomes are persisted.
 */

const isoDateTime = z.string().datetime({ offset: true });

export const COMPLETION_STATES = ['complete', 'skipped'] as const;
export const completionStateSchema = z.enum(COMPLETION_STATES);
export type CompletionState = z.infer<typeof completionStateSchema>;

export const completionSchema = z.object({
  id: z.string().uuid(),
  habitId: z.string().uuid(),
  /** The local calendar date this record applies to (brief §11). */
  date: dateKeySchema,
  /** Progress amount (1 for boolean; the count/minutes for count/duration). */
  value: z.number().min(0).max(1_000_000),
  state: completionStateSchema,
  note: z.string().max(1000).optional(),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
  /** Soft-deletion tombstone for future sync (brief §16). */
  deletedAt: isoDateTime.nullable(),
});
export type Completion = z.infer<typeof completionSchema>;
