import { useState, useEffect, useCallback } from 'react';
import type { Task, StatusFilter, TaskStatus } from '../types';
import * as tasksApi from '../api/tasks.api';

export function useTasks(filter: StatusFilter) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await tasksApi.getTasks(filter);
      setTasks(data);
    } catch {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(async (title: string, description?: string) => {
    const task = await tasksApi.createTask({ title, description });
    setTasks((prev) => [task, ...prev]);
  }, []);

  const editTask = useCallback(
    async (id: string, payload: { title?: string; description?: string; status?: TaskStatus }) => {
      const updated = await tasksApi.updateTask(id, payload);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    },
    []
  );

  const removeTask = useCallback(async (id: string) => {
    await tasksApi.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { tasks, loading, error, addTask, editTask, removeTask, refetch: fetchTasks };
}
