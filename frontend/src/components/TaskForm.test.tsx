import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import TaskForm from './TaskForm';

it('blocks submit and shows an error when the title is empty', () => {
  const onSubmit = vi.fn();
  render(<TaskForm submitLabel="Add task" onSubmit={onSubmit} />);

  fireEvent.click(screen.getByRole('button', { name: 'Add task' }));

  expect(screen.getByRole('alert')).toHaveTextContent('Title is required');
  expect(onSubmit).not.toHaveBeenCalled();
});

it('submits trimmed values', async () => {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  render(<TaskForm submitLabel="Add task" onSubmit={onSubmit} />);

  fireEvent.change(screen.getByLabelText('Title'), { target: { value: '  Write docs  ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add task' }));

  await waitFor(() =>
    expect(onSubmit).toHaveBeenCalledWith({ title: 'Write docs', description: '', status: 'todo' }),
  );
});
