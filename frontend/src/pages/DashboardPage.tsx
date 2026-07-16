import { useState } from 'react';
import type { StatusFilter } from '../types';
import { useTasks } from '../hooks/useTasks';
import Navbar from '../components/Navbar';
import FilterBar from '../components/FilterBar';
import TaskForm from '../components/TaskForm';
import TaskCard from '../components/TaskCard';

export default function DashboardPage() {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const { tasks, loading, error, addTask, editTask, removeTask } = useTasks(filter);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 space-y-6">
        <TaskForm onSubmit={addTask} />

        <div className="flex items-center justify-between">
          <FilterBar current={filter} onChange={setFilter} />
          <span className="text-xs text-gray-400">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
        </div>

        {loading && (
          <p className="text-center text-sm text-gray-400 py-8">Loading…</p>
        )}
        {error && (
          <p className="text-center text-sm text-red-500 py-4">{error}</p>
        )}
        {!loading && !error && tasks.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">
            {filter === 'all' ? 'No tasks yet. Add one above!' : `No ${filter} tasks.`}
          </p>
        )}
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={editTask}
              onDelete={removeTask}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
