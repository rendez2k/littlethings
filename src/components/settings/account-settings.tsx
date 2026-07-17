'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, LogOut, UserRound } from 'lucide-react';
import { useAuth } from '@/features/auth/auth-provider';
import { signIn, signOut, signUp, type AuthResult } from '@/features/auth/service';
import {
  signInSchema,
  signUpSchema,
  type SignInValues,
  type SignUpValues,
} from '@/features/auth/schemas';
import { SettingsRow, SettingsSection } from './settings-section';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';

type Mode = 'signin' | 'signup';

export function AccountSettings() {
  const { configured, loading, user, username } = useAuth();

  return (
    <SettingsSection title="Account">
      {!configured ? (
        <SettingsRow
          label="Using Little Things without an account"
          description="No sign-in required — your habits live privately on this device. Optional cloud sync can be enabled later so you can use multiple devices."
        />
      ) : loading ? (
        <SettingsRow label="Checking your account…" />
      ) : user ? (
        <SignedIn email={user.email ?? ''} username={username} />
      ) : (
        <SignedOut />
      )}
    </SettingsSection>
  );
}

function SignedIn({ email, username }: { email: string; username: string | null }) {
  const [busy, setBusy] = useState(false);

  return (
    <SettingsRow
      label={username ?? 'Signed in'}
      description={email}
      control={
        <Button
          size="sm"
          variant="secondary"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await signOut();
            setBusy(false);
          }}
        >
          <LogOut aria-hidden="true" className="h-4 w-4" />
          Sign out
        </Button>
      }
    >
      <p className="flex items-center gap-2 text-sm text-muted">
        <UserRound aria-hidden="true" className="h-4 w-4" />
        Your habits stay on this device. Cloud sync arrives in a later phase.
      </p>
    </SettingsRow>
  );
}

function SignedOut() {
  const [mode, setMode] = useState<Mode>('signin');

  return (
    <div className="px-4 py-4">
      <SegmentedControl
        ariaLabel="Account action"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'signin', label: 'Sign in' },
          { value: 'signup', label: 'Create account' },
        ]}
      />
      <p className="mt-3 text-sm text-muted">
        Accounts are optional. Signing in will let you sync across devices in a future update — your
        local habits are never deleted by signing in or out.
      </p>
      <div className="mt-4">
        {mode === 'signin' ? <SignInForm /> : <SignUpForm onSignedUp={() => setMode('signin')} />}
      </div>
    </div>
  );
}

function FormStatus({ result }: { result: AuthResult | null }) {
  if (!result?.message) return null;
  const ok = result.ok;
  return (
    <p
      role="alert"
      className={`flex items-start gap-2 rounded-xl px-3 py-2 text-sm ${
        ok ? 'bg-primary-soft text-text' : 'bg-destructive/10 text-destructive'
      }`}
    >
      {ok ? <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" /> : null}
      <span>{result.message}</span>
    </p>
  );
}

function SignInForm() {
  const [result, setResult] = useState<AuthResult | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema) });

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={handleSubmit(async (values) => {
        setResult(null);
        setResult(await signIn(values.email, values.password));
      })}
    >
      <Field id="signin-email" label="Email" error={errors.email?.message}>
        {(p) => (
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...p}
            {...register('email')}
          />
        )}
      </Field>
      <Field id="signin-password" label="Password" error={errors.password?.message}>
        {(p) => (
          <Input type="password" autoComplete="current-password" {...p} {...register('password')} />
        )}
      </Field>
      <FormStatus result={result} />
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}

function SignUpForm({ onSignedUp }: { onSignedUp: () => void }) {
  const [result, setResult] = useState<AuthResult | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({ resolver: zodResolver(signUpSchema) });

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={handleSubmit(async (values) => {
        setResult(null);
        const res = await signUp(values.email, values.username, values.password);
        setResult(res);
        // If confirmation is required the user stays here; otherwise they are
        // signed in automatically and the auth listener updates the UI.
        if (res.ok && res.message) onSignedUp();
      })}
    >
      <Field
        id="signup-username"
        label="Username"
        hint="Letters, numbers and underscores."
        error={errors.username?.message}
      >
        {(p) => (
          <Input
            type="text"
            autoComplete="username"
            placeholder="e.g. alex"
            {...p}
            {...register('username')}
          />
        )}
      </Field>
      <Field id="signup-email" label="Email" error={errors.email?.message}>
        {(p) => (
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...p}
            {...register('email')}
          />
        )}
      </Field>
      <Field
        id="signup-password"
        label="Password"
        hint="At least 8 characters."
        error={errors.password?.message}
      >
        {(p) => (
          <Input type="password" autoComplete="new-password" {...p} {...register('password')} />
        )}
      </Field>
      <FormStatus result={result} />
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}
