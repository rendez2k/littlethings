/**
 * Gentle, personalised statements of encouragement (brief §2 "calm visual
 * design" — motivate without punishing). Pure and deterministic given a seed so
 * the message is stable within a render rather than flickering.
 */
export interface EncouragementContext {
  name?: string;
  completed: number;
  total: number;
  /** Stable value (e.g. day of month) to vary the message without randomness. */
  seed: number;
}

type Template = (name: string) => string;

// `{,name}` style: each template receives a ready-to-use, possibly-empty suffix.
const START: Template[] = [
  (n) => `A fresh start${n}. Pick one small thing.`,
  (n) => `No rush${n} — begin whenever you're ready.`,
  (n) => `Every big change starts small${n}.`,
];

const MIDWAY: Template[] = [
  (n) => `Nice going${n} — keep it gentle.`,
  (n) => `You're building momentum${n}.`,
  (n) => `Lovely${n}. One at a time.`,
  (n) => `That's the spirit${n}.`,
];

const ALL_DONE: Template[] = [
  (n) => `Every habit done${n}. Beautiful day. ✨`,
  (n) => `A perfect day${n} — you showed up.`,
  (n) => `All complete${n}. Time to rest easy.`,
];

function pick(list: Template[], seed: number, name: string): string {
  const template = list[((seed % list.length) + list.length) % list.length]!;
  return template(name);
}

/** Build an encouragement string for the current progress. */
export function encouragement(ctx: EncouragementContext): string {
  const name = ctx.name?.trim() ? `, ${ctx.name.trim()}` : '';
  if (ctx.total > 0 && ctx.completed >= ctx.total) return pick(ALL_DONE, ctx.seed, name);
  if (ctx.completed === 0) return pick(START, ctx.seed, name);
  return pick(MIDWAY, ctx.seed, name);
}

/** A simple time-of-day greeting, optionally personalised. */
export function greeting(name: string | undefined, hour: number): string {
  const part = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return name?.trim() ? `${part}, ${name.trim()}` : part;
}
