import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SegmentedControl } from './segmented-control';

describe('SegmentedControl', () => {
  const options = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
  ];

  it('marks the selected option and exposes a radiogroup', () => {
    render(<SegmentedControl ariaLabel="Test" value="a" onChange={() => {}} options={options} />);
    expect(screen.getByRole('radiogroup', { name: 'Test' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Alpha' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Beta' })).not.toBeChecked();
  });

  it('calls onChange with the chosen value', async () => {
    const onChange = vi.fn();
    render(<SegmentedControl ariaLabel="Test" value="a" onChange={onChange} options={options} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Beta' }));
    expect(onChange).toHaveBeenCalledWith('b');
  });
});
