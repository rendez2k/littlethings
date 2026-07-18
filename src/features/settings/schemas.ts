import { z } from 'zod';

/**
 * App settings persisted in the local database (brief §7.8). Appearance (theme,
 * palette, density, reduced motion) is stored separately in localStorage so it
 * can be applied before first paint; these are the behavioural preferences.
 */
export const appSettingsSchema = z.object({
  /** 0 = Sunday, 1 = Monday. */
  weekStartsOn: z.union([z.literal(0), z.literal(1)]),
  showStreaks: z.boolean(),
  showMotivationalMessages: z.boolean(),
  completionSound: z.boolean(),
  defaultReminder: z.object({
    enabled: z.boolean(),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  }),
});
export type AppSettings = z.infer<typeof appSettingsSchema>;

export const DEFAULT_APP_SETTINGS: AppSettings = {
  weekStartsOn: 1,
  showStreaks: true,
  showMotivationalMessages: true,
  completionSound: false,
  defaultReminder: { enabled: false, time: '09:00' },
};
