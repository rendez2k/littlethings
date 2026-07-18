import { describe, expect, it } from 'vitest';
import {
  DEFAULT_GOAL_ICON,
  GOAL_ICONS,
  getGoalIcon,
  suggestGoalIcon,
} from '@/features/goals/icons';

describe('goal icons', () => {
  it('resolves a known key and falls back for unknown/empty keys', () => {
    expect(getGoalIcon('plane')).toBe(GOAL_ICONS.plane);
    expect(getGoalIcon('not-a-key')).toBe(GOAL_ICONS[DEFAULT_GOAL_ICON]);
    expect(getGoalIcon(undefined)).toBe(GOAL_ICONS[DEFAULT_GOAL_ICON]);
  });

  it('suggests an icon from the title', () => {
    expect(suggestGoalIcon('Travel to Japan')).toBe('plane');
    expect(suggestGoalIcon('Climb a mountain')).toBe('mountain');
    expect(suggestGoalIcon('Learn Spanish')).toBe('languages');
    expect(suggestGoalIcon('xyzzy')).toBeNull();
  });
});
