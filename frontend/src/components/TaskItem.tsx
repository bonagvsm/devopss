import { STATUSES, STATUS_LABELS, type Task, type TaskStatus } from '../types';

type Props = {
  task: Task;
  onStatusChange: (status: TaskStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function TaskItem({ task, onStatusChange, onEdit, onDelete }: Props) {
  return (
    <li className="card">
      <div className="card-head">
        <h3>{task.title}</h3>
        <select
          aria-label={`Status of ${task.title}`}
          className={`status ${task.status}`}
          value={task.status}
          onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
      {task.description && <p className="description">{task.description}</p>}
      <div className="card-foot">
        <small>Created {new Date(task.createdAt).toLocaleDateString()}</small>
        <div className="actions">
          <button onClick={onEdit}>Edit</button>
          <button
            className="danger"
            onClick={() => window.confirm(`Delete "${task.title}"?`) && onDelete()}
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}
