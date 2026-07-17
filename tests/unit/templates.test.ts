import { describe, expect, it } from 'vitest';
import { HABIT_TEMPLATES, templateToDraft } from '@/features/habits/templates';
import { habitDraftSchema } from '@/features/habits/schemas';
import { suggestIcon } from '@/features/habits/icons';
import { HABIT_ICONS } from '@/features/habits/icons';

describe('templates', () => {
  it('every template produces a valid draft', () => {
    for (const template of HABIT_TEMPLATES) {
      const draft = templateToDraft(template, '2024-05-15');
      const result = habitDraftSchema.safeParse(draft);
      expect(result.success, `${template.id} should be valid`).toBe(true);
      expect(draft.startDate).toBe('2024-05-15');
    }
  });

  it('every template references a known icon', () => {
    for (const template of HABIT_TEMPLATES) {
      expect(HABIT_ICONS[template.draft.icon], template.id).toBeDefined();
    }
  });
});

describe('suggestIcon', () => {
  it('maps common habit names to sensible icons', () => {
    expect(suggestIcon('Drink water')).toBe('droplet');
    expect(suggestIcon('Morning run / walk')).toBe('footprints');
    expect(suggestIcon('Meditate')).toBe('flower');
    expect(suggestIcon('Read a book')).toBe('book-open');
    expect(suggestIcon('Take medication')).toBe('pill');
    expect(suggestIcon('Journal')).toBe('pen-line');
  });

  it('returns null when nothing matches', () => {
    expect(suggestIcon('Xyzzy')).toBeNull();
  });
});
