import { render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import App from './App';

const task = {
  id: '1',
  title: 'Learn Docker',
  description: 'Write a Dockerfile',
  status: 'todo',
  createdAt: '2026-09-30T00:00:00Z',
  updatedAt: '2026-09-30T00:00:00Z',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const mockFetch = (result: Response | Error) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(() => (result instanceof Error ? Promise.reject(result) : Promise.resolve(result))),
  );

afterEach(() => vi.unstubAllGlobals());

it('shows a loading state, then the tasks returned by the API', async () => {
  mockFetch(json([task]));
  render(<App />);

  expect(screen.getByRole('status')).toHaveTextContent(/loading/i);
  expect(await screen.findByText('Learn Docker')).toBeInTheDocument();
});

it('shows the empty state when there are no tasks', async () => {
  mockFetch(json([]));
  render(<App />);

  expect(await screen.findByText(/no tasks yet/i)).toBeInTheDocument();
});

it('shows an error state when the API is unreachable', async () => {
  mockFetch(new Error('network down'));
  render(<App />);

  expect(await screen.findByRole('alert')).toHaveTextContent(/could not reach the server/i);
  expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
});
