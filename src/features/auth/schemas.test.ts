import { describe, expect, it } from 'vitest';
import { looksLikeEmail, signInSchema, signUpSchema } from './schemas';

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
  it('requires an identifier and password', () => {
    expect(signInSchema.safeParse({ identifier: '', password: '' }).success).toBe(false);
    expect(signInSchema.safeParse({ identifier: '', password: 'x' }).success).toBe(false);
  });

  it('accepts either an email or a username as the identifier', () => {
    expect(signInSchema.safeParse({ identifier: 'a@b.co', password: 'x' }).success).toBe(true);
    expect(signInSchema.safeParse({ identifier: 'alex', password: 'x' }).success).toBe(true);
  });
});

describe('looksLikeEmail', () => {
  it('distinguishes emails from usernames', () => {
    expect(looksLikeEmail('alex@example.com')).toBe(true);
    expect(looksLikeEmail('alex')).toBe(false);
  });
});
