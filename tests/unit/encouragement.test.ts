import { describe, expect, it } from 'vitest';
import { encouragement, greeting } from '@/features/encouragement/messages';

describe('encouragement', () => {
  it('celebrates when everything is done', () => {
    const msg = encouragement({ name: 'Amelia', completed: 3, total: 3, seed: 1 });
    expect(msg).toContain('Amelia');
    expect(/done|perfect|complete/i.test(msg)).toBe(true);
  });

  it('gives a gentle start when nothing is done', () => {
    const msg = encouragement({ completed: 0, total: 4, seed: 0 });
    expect(msg.length).toBeGreaterThan(0);
    expect(msg).not.toContain('undefined');
  });

  it('personalises with the name when provided, and omits it otherwise', () => {
    expect(encouragement({ name: 'Sam', completed: 1, total: 3, seed: 2 })).toContain('Sam');
    expect(encouragement({ completed: 1, total: 3, seed: 2 })).not.toContain(',,');
  });

  it('is deterministic for a given seed', () => {
    const a = encouragement({ name: 'Amelia', completed: 1, total: 3, seed: 5 });
    const b = encouragement({ name: 'Amelia', completed: 1, total: 3, seed: 5 });
    expect(a).toBe(b);
  });
});

describe('greeting', () => {
  it('varies by time of day and personalises', () => {
    expect(greeting('Amelia', 9)).toBe('Good morning, Amelia');
    expect(greeting('Amelia', 14)).toBe('Good afternoon, Amelia');
    expect(greeting(undefined, 20)).toBe('Good evening');
  });
});
