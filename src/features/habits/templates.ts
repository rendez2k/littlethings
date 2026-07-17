import type { DateKey } from '@/lib/dates';
import type { HabitDraft } from './schemas';

/** Template categories (brief §7.5). */
export const TEMPLATE_CATEGORIES = [
  'Health',
  'Movement',
  'Mindfulness',
  'Productivity',
  'Learning',
  'Home',
  'Personal care',
] as const;
export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

/** Everything a template pre-fills; the start date is set when instantiated. */
export type TemplateDraft = Omit<HabitDraft, 'startDate' | 'endDate'>;

export interface HabitTemplate {
  id: string;
  category: TemplateCategory;
  draft: TemplateDraft;
}

const reminderOff = { enabled: false, time: '09:00' } as const;

export const HABIT_TEMPLATES: HabitTemplate[] = [
  {
    id: 'drink-water',
    category: 'Health',
    draft: {
      name: 'Drink water',
      icon: 'droplet',
      color: 'sky',
      schedule: { type: 'daily' },
      target: { type: 'count', amount: 8, unit: 'glasses' },
      reminder: reminderOff,
    },
  },
  {
    id: 'walk',
    category: 'Movement',
    draft: {
      name: 'Walk',
      icon: 'footprints',
      color: 'mint',
      schedule: { type: 'daily' },
      target: { type: 'boolean' },
      reminder: reminderOff,
    },
  },
  {
    id: 'exercise',
    category: 'Movement',
    draft: {
      name: 'Exercise',
      icon: 'dumbbell',
      color: 'coral',
      schedule: { type: 'times_per_week', timesPerWeek: 3 },
      target: { type: 'duration', amount: 30, unit: 'minutes' },
      reminder: reminderOff,
    },
  },
  {
    id: 'read',
    category: 'Learning',
    draft: {
      name: 'Read',
      icon: 'book-open',
      color: 'peach',
      schedule: { type: 'daily' },
      target: { type: 'count', amount: 20, unit: 'pages' },
      reminder: reminderOff,
    },
  },
  {
    id: 'meditate',
    category: 'Mindfulness',
    draft: {
      name: 'Meditate',
      icon: 'flower',
      color: 'lavender',
      schedule: { type: 'daily' },
      target: { type: 'duration', amount: 10, unit: 'minutes' },
      reminder: reminderOff,
    },
  },
  {
    id: 'take-medication',
    category: 'Health',
    draft: {
      name: 'Take medication',
      icon: 'pill',
      color: 'rose',
      schedule: { type: 'daily' },
      target: { type: 'boolean' },
      reminder: { enabled: false, time: '08:00' },
    },
  },
  {
    id: 'journal',
    category: 'Productivity',
    draft: {
      name: 'Journal',
      icon: 'pen-line',
      color: 'aqua',
      schedule: { type: 'daily' },
      target: { type: 'boolean' },
      reminder: reminderOff,
    },
  },
  {
    id: 'stretch',
    category: 'Movement',
    draft: {
      name: 'Stretch',
      icon: 'person-standing',
      color: 'sage',
      schedule: { type: 'daily' },
      target: { type: 'duration', amount: 10, unit: 'minutes' },
      reminder: reminderOff,
    },
  },
  {
    id: 'sleep-routine',
    category: 'Personal care',
    draft: {
      name: 'Sleep routine',
      icon: 'moon',
      color: 'slate',
      schedule: { type: 'daily' },
      target: { type: 'boolean' },
      reminder: { enabled: false, time: '22:00' },
    },
  },
  {
    id: 'no-sugary-drinks',
    category: 'Health',
    draft: {
      name: 'No sugary drinks',
      icon: 'ban',
      color: 'rose',
      schedule: { type: 'daily' },
      target: { type: 'boolean' },
      reminder: reminderOff,
    },
  },
  {
    id: 'practise-a-language',
    category: 'Learning',
    draft: {
      name: 'Practise a language',
      icon: 'languages',
      color: 'sky',
      schedule: { type: 'times_per_week', timesPerWeek: 5 },
      target: { type: 'duration', amount: 15, unit: 'minutes' },
      reminder: reminderOff,
    },
  },
  {
    id: 'tidy-ten-minutes',
    category: 'Home',
    draft: {
      name: 'Tidy for ten minutes',
      icon: 'timer',
      color: 'lemon',
      schedule: { type: 'daily' },
      target: { type: 'duration', amount: 10, unit: 'minutes' },
      reminder: reminderOff,
    },
  },
];

/** Turn a template into a full, editable draft anchored at `today`. */
export function templateToDraft(template: HabitTemplate, today: DateKey): HabitDraft {
  return { ...template.draft, startDate: today, endDate: null };
}
