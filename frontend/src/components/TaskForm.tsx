import { useState, type FormEvent } from 'react';
import { errorMessage } from '../api';
import { STATUSES, STATUS_LABELS, type TaskInput, type TaskStatus } from '../types';

type Props = {
  initial?: TaskInput; // ada = mode edit, tidak ada = mode buat baru
  submitLabel: string;
  onSubmit: (input: TaskInput) => Promise<void>;
  onCancel?: () => void;
};

const EMPTY: TaskInput = { title: '', description: '', status: 'todo' };

export default function TaskForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<TaskInput>(initial ?? EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!values.title.trim()) {
      setError('Title is required');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        ...values,
        title: values.title.trim(),
        description: values.description.trim(),
      });
      if (!initial) setValues(EMPTY);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <label>
        Title
        <input
          value={values.title}
          maxLength={200}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
        />
      </label>
      <label>
        Description
        <textarea
          value={values.description}
          maxLength={2000}
          rows={2}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
        />
      </label>
      <label>
        Status
        <select
          value={values.status}
          onChange={(e) => setValues({ ...values, status: e.target.value as TaskStatus })}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </label>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="actions">
        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
