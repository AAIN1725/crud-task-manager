import client from './client';
import type { Task, StatusFilter, TaskStatus } from '../types';

export const getTasks = async (status: StatusFilter = 'all'): Promise<Task[]> => {
  const params = status !== 'all' ? { status } : {};
  const { data } = await client.get<{ tasks: Task[] }>('/api/tasks', { params });
  return data.tasks;
};

export const createTask = async (payload: {
  title: string;
  description?: string;
}): Promise<Task> => {
  const { data } = await client.post<{ task: Task }>('/api/tasks', payload);
  return data.task;
};

export const updateTask = async (
  id: string,
  payload: { title?: string; description?: string; status?: TaskStatus }
): Promise<Task> => {
  const { data } = await client.put<{ task: Task }>(`/api/tasks/${id}`, payload);
  return data.task;
};

export const deleteTask = async (id: string): Promise<void> => {
  await client.delete(`/api/tasks/${id}`);
};
