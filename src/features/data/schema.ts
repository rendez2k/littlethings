import { z } from 'zod';
import { habitSchema } from '@/features/habits/schemas';
import { completionSchema } from '@/features/completions/schemas';
import { goalSchema } from '@/features/goals/schemas';
import { appSettingsSchema } from '@/features/settings/schemas';
import { DENSITIES, PALETTES, THEME_MODES } from '@/features/settings/appearance';

/**
 * Portable backup format (brief §17). Versioned so future shapes can migrate,
 * and validated with Zod on import so malformed files are rejected safely.
 */
export const EXPORT_SCHEMA_VERSION = 2;

const appearanceSchema = z.object({
  theme: z.enum(THEME_MODES),
  palette: z.enum(PALETTES),
  density: z.enum(DENSITIES),
  reducedMotion: z.boolean(),
});

export const exportBundleSchema = z.object({
  app: z.literal('little-things'),
  schemaVersion: z.number().int().min(1).max(EXPORT_SCHEMA_VERSION),
  exportedAt: z.string(),
  appearance: appearanceSchema,
  settings: appSettingsSchema,
  habits: z.array(habitSchema),
  completions: z.array(completionSchema),
  goals: z.array(goalSchema),
});
export type ExportBundle = z.infer<typeof exportBundleSchema>;

export type ImportMode = 'merge' | 'replace';

export interface ImportCounts {
  habits: number;
  completions: number;
  goals: number;
}
