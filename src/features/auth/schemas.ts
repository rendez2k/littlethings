import { z } from 'zod';

/** Shared validation for the auth forms (React Hook Form + Zod). */

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email address');

export const passwordSchema = z.string().min(8, 'Use at least 8 characters');

export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'At least 3 characters')
  .max(24, 'At most 24 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers and underscores only');

/** Sign-in accepts either an email address or a username. */
export const identifierSchema = z.string().trim().min(1, 'Enter your email or username');

export const signInSchema = z.object({
  identifier: identifierSchema,
  password: z.string().min(1, 'Password is required'),
});

/** Heuristic: treat an identifier containing "@" as an email address. */
export function looksLikeEmail(value: string): boolean {
  return value.includes('@');
}

export const signUpSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
