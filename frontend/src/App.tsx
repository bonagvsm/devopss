import { useEffect, useState } from 'react';
import { createTask, deleteTask, errorMessage, listTasks, updateTask } from './api';
import TaskForm from './components/TaskForm';
import TaskItem from './components/TaskItem';
import { STATUSES, STATUS_LABELS, type Task, type TaskInput, type TaskStatus } from './types';

// Tunda nilai input agar API tidak dipanggil di setiap ketikan.
function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [status, setStatus] = useState<TaskStatus | ''>('');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const q = useDebounced(search, 300);

  // Sumber kebenaran tetap server: setelah perubahan apa pun, daftar diambil ulang.
  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false; // cegah respons lama menimpa respons yang lebih baru
    setLoading(true);
    setError(null);
    listTasks({ status, q })
      .then((data) => !cancelled && setTasks(data))
      .catch((err) => !cancelled && setError(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [status, q, reloadKey]);

  async function handleCreate(input: TaskInput) {
    await createTask(input);
    reload();
  }

  async function handleUpdate(id: string, input: TaskInput) {
    await updateTask(id, input);
    setEditingId(null);
    reload();
  }

  async function mutate(action: () => Promise<unknown>) {
    setActionError(null);
    try {
      await action();
      reload();
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  const filtersActive = status !== '' || q.trim() !== '';

  function renderList() {
    if (loading) return <p role="status" className="muted">Loading tasks…</p>;
    if (error) {
      return (
        <div role="alert" className="error box">
          <p>{error}</p>
          <button onClick={reload}>Try again</button>
        </div>
      );
    }
    if (tasks.length === 0) {
      return (
        <p className="muted box">
          {filtersActive ? 'No tasks match your filters.' : 'No tasks yet. Add your first task above.'}
        </p>
      );
    }
    return (
      <ul className="list">
        {tasks.map((task) =>
          editingId === task.id ? (
            <li key={task.id} className="card">
              <TaskForm
                initial={task}
                submitLabel="Save changes"
                onSubmit={(input) => handleUpdate(task.id, input)}
                onCancel={() => setEditingId(null)}
              />
            </li>
          ) : (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={() => setEditingId(task.id)}
              onStatusChange={(s) =>
                mutate(() =>
                  updateTask(task.id, {
                    title: task.title,
                    description: task.description,
                    status: s,
                  }),
                )
              }
              onDelete={() => mutate(() => deleteTask(task.id))}
            />
          ),
        )}
      </ul>
    );
  }

  return (
    <main className="container">
      <header>
        <h1>TaskFlow</h1>
        <p className="muted">A simple task manager.</p>
      </header>

      <section className="card">
        <h2>New task</h2>
        <TaskForm submitLabel="Add task" onSubmit={handleCreate} />
      </section>

      <section className="filters">
        <div className="tabs" role="group" aria-label="Filter by status">
          {(['', ...STATUSES] as const).map((s) => (
            <button key={s} aria-pressed={status === s} onClick={() => setStatus(s)}>
              {s === '' ? 'All' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Search by title…"
          aria-label="Search tasks by title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      {actionError && (
        <p role="alert" className="error box">
          {actionError}
        </p>
      )}
      {renderList()}
    </main>
  );
}
