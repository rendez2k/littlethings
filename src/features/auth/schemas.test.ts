import { describe, expect, it } from 'vitest';
import { signInSchema, signUpSchema } from './schemas';

describe('signUpSchema', () => {
  it('accepts valid input', () => {
    const result = signUpSchema.safeParse({
      username: 'alex_99',
      email: 'alex@example.com',
      password: 'supersecret',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short usernames and bad characters', () => {
    expect(
      signUpSchema.safeParse({ username: 'al', email: 'a@b.co', password: 'password1' }).success,
    ).toBe(false);
    expect(
      signUpSchema.safeParse({ username: 'has space', email: 'a@b.co', password: 'password1' })
        .success,
    ).toBe(false);
  });

  it('rejects short passwords', () => {
    const result = signUpSchema.safeParse({ username: 'alex', email: 'a@b.co', password: 'short' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid emails', () => {
    const result = signUpSchema.safeParse({
      username: 'alex',
      email: 'nope',
      password: 'password1',
    });
    expect(result.success).toBe(false);
  });
});

describe('signInSchema', () => {
  it('requires email and password', () => {
    expect(signInSchema.safeParse({ email: '', password: '' }).success).toBe(false);
    expect(signInSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
  });
});
