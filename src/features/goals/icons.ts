import {
  Award,
  Backpack,
  BookOpen,
  Briefcase,
  Camera,
  Dumbbell,
  Flag,
  Gem,
  GraduationCap,
  Guitar,
  Heart,
  Home,
  Languages,
  Leaf,
  Medal,
  Mountain,
  PenTool,
  PiggyBank,
  Plane,
  Rocket,
  Sailboat,
  Sprout,
  Star,
  Target,
  Trophy,
  Utensils,
  type LucideIcon,
} from 'lucide-react';

/** Curated icon set for bucket-list goals. Keys are stable and stored on the goal. */
export const GOAL_ICONS: Record<string, LucideIcon> = {
  target: Target,
  flag: Flag,
  star: Star,
  trophy: Trophy,
  medal: Medal,
  award: Award,
  rocket: Rocket,
  mountain: Mountain,
  plane: Plane,
  sailboat: Sailboat,
  backpack: Backpack,
  camera: Camera,
  'graduation-cap': GraduationCap,
  'book-open': BookOpen,
  languages: Languages,
  'pen-tool': PenTool,
  guitar: Guitar,
  dumbbell: Dumbbell,
  briefcase: Briefcase,
  'piggy-bank': PiggyBank,
  home: Home,
  gem: Gem,
  heart: Heart,
  utensils: Utensils,
  sprout: Sprout,
  leaf: Leaf,
};

export const DEFAULT_GOAL_ICON = 'target';

export type GoalIconKey = keyof typeof GOAL_ICONS;

/** Resolve an icon key to its component, falling back to the default. */
export function getGoalIcon(key: string | undefined | null): LucideIcon {
  return (key && GOAL_ICONS[key]) || GOAL_ICONS[DEFAULT_GOAL_ICON]!;
}

/** Ordered keyword → icon suggestions, matched against the goal title. */
const SUGGESTIONS: Array<{ icon: GoalIconKey; keywords: string[] }> = [
  { icon: 'plane', keywords: ['travel', 'trip', 'visit', 'fly', 'holiday', 'vacation'] },
  { icon: 'mountain', keywords: ['climb', 'hike', 'summit', 'mountain', 'everest', 'trek'] },
  { icon: 'sailboat', keywords: ['sail', 'boat', 'ocean', 'cruise'] },
  { icon: 'trophy', keywords: ['win', 'compete', 'championship', 'medal', 'race', 'marathon'] },
  { icon: 'graduation-cap', keywords: ['degree', 'graduate', 'study', 'course', 'qualif', 'exam'] },
  { icon: 'languages', keywords: ['language', 'spanish', 'french', 'italian', 'fluent'] },
  { icon: 'book-open', keywords: ['read', 'book', 'write a book', 'novel'] },
  { icon: 'pen-tool', keywords: ['write', 'blog', 'paint', 'draw', 'art'] },
  { icon: 'guitar', keywords: ['guitar', 'piano', 'instrument', 'music', 'sing'] },
  { icon: 'dumbbell', keywords: ['fit', 'gym', 'strong', 'muscle', 'lift', 'weight'] },
  { icon: 'home', keywords: ['house', 'home', 'move', 'flat', 'apartment', 'renovate'] },
  { icon: 'piggy-bank', keywords: ['save', 'money', 'saving', 'invest', 'fund', 'debt'] },
  { icon: 'briefcase', keywords: ['business', 'career', 'job', 'promotion', 'start a', 'launch'] },
  { icon: 'camera', keywords: ['photo', 'film', 'video', 'camera'] },
  { icon: 'utensils', keywords: ['cook', 'bake', 'recipe', 'restaurant', 'chef'] },
  { icon: 'sprout', keywords: ['garden', 'grow', 'plant', 'allotment'] },
  { icon: 'heart', keywords: ['volunteer', 'charity', 'family', 'love', 'kind'] },
  { icon: 'rocket', keywords: ['launch', 'startup', 'project', 'build'] },
];

/** Suggest an icon key from a goal title, or null if nothing matches. */
export function suggestGoalIcon(title: string): GoalIconKey | null {
  const lower = ` ${title.toLowerCase()} `;
  for (const { icon, keywords } of SUGGESTIONS) {
    if (keywords.some((k) => lower.includes(k))) return icon;
  }
  return null;
}
