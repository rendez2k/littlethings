import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppearanceProvider } from '@/components/theme/appearance-provider';
import { TemplatePicker } from './template-picker';

describe('TemplatePicker', () => {
  it('renders grouped templates and hands the chosen one back', async () => {
    const onPick = vi.fn();
    render(
      <AppearanceProvider>
        <TemplatePicker onPick={onPick} />
      </AppearanceProvider>,
    );

    // Category headings and a known template are present.
    expect(screen.getByRole('heading', { name: 'Health' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Drink water/ }));

    expect(onPick).toHaveBeenCalledTimes(1);
    expect(onPick.mock.calls[0]![0].id).toBe('drink-water');
  });
});
