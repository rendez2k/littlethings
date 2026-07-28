/**
 * The home-screen widget data contract.
 *
 * This is the single source of truth for the JSON the app hands to the native
 * widget (iOS WidgetKit / Android Glance) through the Capacitor bridge. The
 * native side must decode exactly this shape — keep the two in lockstep and bump
 * `schema` on any breaking change so an old widget reading new data can bail
 * gracefully rather than mis-render.
 *
 * The snapshot always reflects TODAY, regardless of which day the app is
 * currently showing.
 */

/**
 * A colour resolved for both appearances as `#rrggbb`, so the native widget can
 * match the app exactly and still adapt to its own light/dark rendering without
 * shipping its own palette.
 */
export interface WidgetColor {
  light: string;
  dark: string;
}

export interface WidgetHabit {
  id: string;
  /** Display name, e.g. "Water". */
  name: string;
  /** Habit icon key (see features/habits/icons.ts). Native maps or ignores. */
  icon: string;
  /** Habit colour key (see features/habits/colors.ts) — kept as a fallback. */
  color: string;
  /** The habit's accent as light/dark hex — use this to match the app's colour. */
  colorHex: WidgetColor;
  /** Progress toward today's target in [0,1] (1 when done) — for a partial marker. */
  ratio: number;
  /** Target fully met today. */
  done: boolean;
  /** Some progress but target not yet met. */
  partial: boolean;
}

export interface WidgetSnapshot {
  /** Contract version. Bump on any breaking change to this shape. */
  schema: 2;
  /** The day this reflects, yyyy-mm-dd. Always today. */
  date: string;
  /** Habits fully complete today. */
  completed: number;
  /** Habits scheduled today. */
  total: number;
  /** Overall progress in [0,1]. */
  ratio: number;
  /** The app's current accent (selected palette) as light/dark hex — for the ring. */
  accent: WidgetColor;
  /** Today's scheduled habits, capped for a compact widget. */
  habits: WidgetHabit[];
  /** When this snapshot was produced (ISO 8601). */
  updatedAt: string;
}

/** Most habits a widget row list will show; the rest fold into "+N more". */
export const WIDGET_MAX_HABITS = 8;
