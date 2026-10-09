import type { Task, TaskInput, TaskStatus } from './types';

const BASE = '/api/tasks';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...init });
  } catch {
    throw new Error('Could not reach the server. Please try again.');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    // Pakai pesan validasi pertama jika ada, karena lebih spesifik daripada "Invalid request".
    const message = body?.error?.details?.[0]?.message ?? body?.error?.message;
    throw new Error(message ?? `Request failed (${res.status})`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export function listTasks(filters: { status: TaskStatus | ''; q: string }): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.q.trim()) params.set('q', filters.q.trim());
  const qs = params.toString();
  return request<Task[]>(qs ? `${BASE}?${qs}` : BASE);
}

export const createTask = (input: TaskInput) =>
  request<Task>(BASE, { method: 'POST', body: JSON.stringify(input) });

export const updateTask = (id: string, input: TaskInput) =>
  request<Task>(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(input) });

export const deleteTask = (id: string) => request<void>(`${BASE}/${id}`, { method: 'DELETE' });

export const errorMessage = (err: unknown) =>
  err instanceof Error ? err.message : 'Something went wrong';
