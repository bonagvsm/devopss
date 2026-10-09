export type TaskStatus = 'todo' | 'in_progress' | 'done';

export const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done'];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
};

export type TaskInput = {
  title: string;
  description: string;
  status: TaskStatus;
};

export type Task = TaskInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};
