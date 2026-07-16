import { useState } from 'react';
import type { Task, TaskStatus } from '../types';

interface TaskCardProps {
  task: Task;
  onEdit: (id: string, payload: { title?: string; description?: string; status?: TaskStatus }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleToggle = async () => {
    await onEdit(task.id, {
      status: task.status === 'ACTIVE' ? 'COMPLETED' : 'ACTIVE',
    });
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onEdit(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setDeleting(false);
    }
  };

  const isCompleted = task.status === 'COMPLETED';

  return (
    <div className={`bg-white border rounded-xl p-4 space-y-2 transition-opacity ${deleting ? 'opacity-50' : ''}`}>
      {editing ? (
        <div className="space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 font-medium transition-colors"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => { setTitle(task.title); setDescription(task.description ?? ''); setEditing(false); }}
              className="text-xs text-gray-500 hover:text-gray-700 rounded-lg px-3 py-1.5 border border-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <button
            onClick={handleToggle}
            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 transition-colors ${
              isCompleted
                ? 'bg-emerald-500 border-emerald-500'
                : 'border-gray-300 hover:border-indigo-400'
            }`}
            title={isCompleted ? 'Mark active' : 'Mark complete'}
          />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium break-words ${isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-gray-500 mt-0.5 break-words">{task.description}</p>
            )}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-gray-400 hover:text-indigo-600 px-2 py-1 rounded transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-gray-400 hover:text-red-600 px-2 py-1 rounded transition-colors disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
