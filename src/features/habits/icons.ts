import {
  Apple,
  Ban,
  Bed,
  Bike,
  BookOpen,
  Brain,
  Coffee,
  Droplet,
  Dumbbell,
  Flower2,
  Footprints,
  GlassWater,
  Heart,
  Languages,
  Leaf,
  Moon,
  Music,
  PenLine,
  PersonStanding,
  Pill,
  Salad,
  Sparkles,
  Sprout,
  Sun,
  Timer,
  Utensils,
  Waves,
  Wind,
  type LucideIcon,
} from 'lucide-react';

/** Curated icon set for habits. Keys are stable and stored on the habit. */
export const HABIT_ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  droplet: Droplet,
  'glass-water': GlassWater,
  footprints: Footprints,
  bike: Bike,
  dumbbell: Dumbbell,
  'person-standing': PersonStanding,
  'book-open': BookOpen,
  brain: Brain,
  languages: Languages,
  flower: Flower2,
  leaf: Leaf,
  sprout: Sprout,
  wind: Wind,
  waves: Waves,
  moon: Moon,
  bed: Bed,
  sun: Sun,
  heart: Heart,
  pill: Pill,
  apple: Apple,
  salad: Salad,
  utensils: Utensils,
  coffee: Coffee,
  'pen-line': PenLine,
  music: Music,
  timer: Timer,
  ban: Ban,
};

export const DEFAULT_ICON = 'sparkles';

export type HabitIconKey = keyof typeof HABIT_ICONS;

/** Resolve an icon key to its component, falling back to the default. */
export function getHabitIcon(key: string): LucideIcon {
  return HABIT_ICONS[key] ?? HABIT_ICONS[DEFAULT_ICON]!;
}

/** Ordered keyword → icon suggestions, matched against the habit name. */
const SUGGESTIONS: Array<{ icon: HabitIconKey; keywords: string[] }> = [
  { icon: 'droplet', keywords: ['water', 'drink', 'hydrate'] },
  { icon: 'glass-water', keywords: ['glass', 'juice'] },
  { icon: 'coffee', keywords: ['coffee', 'tea', 'caffeine'] },
  { icon: 'footprints', keywords: ['walk', 'steps', 'stroll'] },
  { icon: 'bike', keywords: ['cycle', 'bike', 'ride'] },
  { icon: 'dumbbell', keywords: ['exercise', 'gym', 'workout', 'lift', 'train'] },
  { icon: 'person-standing', keywords: ['stretch', 'yoga', 'mobility', 'posture'] },
  { icon: 'book-open', keywords: ['read', 'book', 'study'] },
  { icon: 'languages', keywords: ['language', 'spanish', 'french', 'practise', 'practice'] },
  { icon: 'brain', keywords: ['learn', 'brain', 'memor'] },
  { icon: 'flower', keywords: ['meditate', 'meditation', 'mindful', 'breathe', 'calm'] },
  { icon: 'leaf', keywords: ['nature', 'garden', 'plant'] },
  { icon: 'moon', keywords: ['sleep', 'bed', 'night', 'rest'] },
  { icon: 'sun', keywords: ['morning', 'wake', 'sunrise'] },
  { icon: 'heart', keywords: ['gratitude', 'love', 'kind', 'health'] },
  { icon: 'pill', keywords: ['medication', 'medicine', 'pill', 'vitamin', 'supplement'] },
  { icon: 'apple', keywords: ['fruit', 'apple', 'eat', 'healthy'] },
  { icon: 'salad', keywords: ['salad', 'veg', 'greens', 'lunch'] },
  { icon: 'ban', keywords: ['no ', 'quit', 'avoid', 'sugar', 'smok', 'alcohol'] },
  { icon: 'pen-line', keywords: ['journal', 'write', 'diary', 'note'] },
  { icon: 'music', keywords: ['music', 'guitar', 'piano', 'practise instrument'] },
  { icon: 'timer', keywords: ['tidy', 'clean', 'declutter', 'minutes'] },
];

/** Suggest an icon key from a habit name, or null if nothing matches. */
export function suggestIcon(name: string): HabitIconKey | null {
  const lower = ` ${name.toLowerCase()} `;
  for (const { icon, keywords } of SUGGESTIONS) {
    if (keywords.some((k) => lower.includes(k))) return icon;
  }
  return null;
}
