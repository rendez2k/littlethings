import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Force the "configured" branch so the forms render without real Supabase env.
vi.mock('@/lib/supabase/client', () => ({
  getSupabaseClient: () => null,
  isSupabaseConfigured: true,
}));

import { AuthProvider } from '@/features/auth/auth-provider';
import { AccountSettings } from './account-settings';

function renderPanel() {
  return render(
    <AuthProvider>
      <AccountSettings />
    </AuthProvider>,
  );
}

describe('AccountSettings', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('shows the sign-in form by default and can switch to sign-up', async () => {
    renderPanel();
    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: 'Create account' }));
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('validates the sign-up form without submitting', async () => {
    renderPanel();
    await screen.findByRole('radiogroup', { name: 'Account action' });
    await userEvent.click(screen.getByRole('radio', { name: 'Create account' }));

    // Enter an invalid email and leave the other fields empty.
    await userEvent.type(screen.getByLabelText('Email'), 'nope');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('At least 3 characters')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
  });
});
