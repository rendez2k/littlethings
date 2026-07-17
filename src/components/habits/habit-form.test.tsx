import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppearanceProvider } from '@/components/theme/appearance-provider';
import { emptyDraft } from '@/features/habits/draft';
import type { HabitDraft } from '@/features/habits/schemas';
import { HabitForm } from './habit-form';

function renderForm(onSubmit: (draft: HabitDraft) => void) {
  return render(
    <AppearanceProvider>
      <HabitForm
        formId="test-form"
        mode="create"
        initialDraft={emptyDraft('2024-05-15')}
        onSubmit={onSubmit}
      />
      <button type="submit" form="test-form">
        Save
      </button>
    </AppearanceProvider>,
  );
}

describe('HabitForm', () => {
  it('shows a validation error and does not submit when the name is empty', async () => {
    const onSubmit = vi.fn();
    renderForm(onSubmit);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Name your habit')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a valid draft with the entered name', async () => {
    const onSubmit = vi.fn();
    renderForm(onSubmit);
    await userEvent.type(screen.getByLabelText('Name'), 'Drink water');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({
      name: 'Drink water',
      schedule: { type: 'daily' },
      target: { type: 'boolean' },
      startDate: '2024-05-15',
    });
  });

  it('lets the user switch to a weekday schedule', async () => {
    const onSubmit = vi.fn();
    renderForm(onSubmit);
    await userEvent.type(screen.getByLabelText('Name'), 'Exercise');
    await userEvent.click(screen.getByRole('radio', { name: 'Certain days' }));
    // Day toggles appear.
    expect(screen.getByRole('button', { name: 'Monday' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit.mock.calls[0]![0].schedule.type).toBe('weekdays');
  });

  it('reveals advanced options on demand', async () => {
    renderForm(vi.fn());
    const toggle = screen.getByRole('button', { name: 'Advanced options' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByLabelText('Notes')).toBeInTheDocument();
  });
});
