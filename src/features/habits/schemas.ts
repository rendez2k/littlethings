import { z } from 'zod';
import { isValidDateKey } from '@/lib/dates';

/**
 * Habit domain model (brief §11, §12). Validated with Zod so the same schema
 * guards forms, imports and the database boundary. Types are inferred from the
 * schemas to keep a single source of truth.
 */

export const dateKeySchema = z.string().refine(isValidDateKey, { message: 'Invalid date' });

const isoDateTime = z.string().datetime({ offset: true });

/** The ten habit accent colours (brief §7.4). */
export const HABIT_COLORS = [
  'lavender',
  'sky',
  'mint',
  'sage',
  'peach',
  'coral',
  'rose',
  'lemon',
  'aqua',
  'slate',
] as const;
export const habitColorSchema = z.enum(HABIT_COLORS);
export type HabitColor = z.infer<typeof habitColorSchema>;

export const weekdaySchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);

/** Schedule types (brief §11). Flexible types (per-week/month) are not tied to
 *  specific weekdays; they can be completed on any day within their period. */
export const scheduleSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('daily') }),
  z.object({
    type: z.literal('weekdays'),
    weekdays: z.array(weekdaySchema).min(1).max(7),
  }),
  z.object({
    type: z.literal('times_per_week'),
    timesPerWeek: z.number().int().min(1).max(7),
  }),
  z.object({
    type: z.literal('times_per_month'),
    timesPerMonth: z.number().int().min(1).max(31),
  }),
  z.object({
    type: z.literal('every_n_days'),
    intervalDays: z.number().int().min(1).max(365),
  }),
  z.object({ type: z.literal('once') }),
]);
export type Schedule = z.infer<typeof scheduleSchema>;
export type ScheduleType = Schedule['type'];

/** Target types (brief §12). */
export const targetSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('boolean') }),
  z.object({
    type: z.literal('count'),
    amount: z.number().positive().max(100_000),
    unit: z.string().trim().min(1).max(24),
  }),
  z.object({
    type: z.literal('duration'),
    // Minutes for the first release (a timer is optional, brief §12).
    amount: z.number().positive().max(100_000),
    unit: z.literal('minutes'),
  }),
]);
export type Target = z.infer<typeof targetSchema>;
export type TargetType = Target['type'];

export const reminderSchema = z.object({
  enabled: z.boolean(),
  /** Local time of day, 'HH:MM' (24h). */
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
});
export type Reminder = z.infer<typeof reminderSchema>;

/** A span during which the habit is paused (inclusive). `end: null` = ongoing. */
export const pausedPeriodSchema = z.object({
  start: dateKeySchema,
  end: dateKeySchema.nullable(),
});
export type PausedPeriod = z.infer<typeof pausedPeriodSchema>;

export const HABIT_STATUSES = ['active', 'paused', 'archived'] as const;
export const habitStatusSchema = z.enum(HABIT_STATUSES);
export type HabitStatus = z.infer<typeof habitStatusSchema>;

export const habitSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().trim().min(1, 'Name your habit').max(80),
    notes: z.string().max(1000).optional(),
    icon: z.string().min(1),
    color: habitColorSchema,
    schedule: scheduleSchema,
    target: targetSchema,
    reminder: reminderSchema,
    startDate: dateKeySchema,
    endDate: dateKeySchema.nullable(),
    sortOrder: z.number(),
    status: habitStatusSchema,
    archivedAt: isoDateTime.nullable(),
    pausedPeriods: z.array(pausedPeriodSchema),
    createdAt: isoDateTime,
    updatedAt: isoDateTime,
    /** Soft-deletion tombstone for future sync (brief §16). */
    deletedAt: isoDateTime.nullable(),
  })
  .superRefine((habit, ctx) => {
    if (habit.endDate && habit.endDate < habit.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be on or after the start date',
        path: ['endDate'],
      });
    }
  });
export type Habit = z.infer<typeof habitSchema>;

/** Fields a user supplies when creating a habit; the rest are defaulted. */
export const habitDraftSchema = z.object({
  name: z.string().trim().min(1, 'Name your habit').max(80),
  notes: z.string().max(1000).optional(),
  icon: z.string().min(1),
  color: habitColorSchema,
  schedule: scheduleSchema,
  target: targetSchema,
  reminder: reminderSchema,
  startDate: dateKeySchema,
  endDate: dateKeySchema.nullable().optional(),
});
export type HabitDraft = z.infer<typeof habitDraftSchema>;
