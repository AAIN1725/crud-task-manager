export type TaskStatus = 'ACTIVE' | 'COMPLETED';

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type StatusFilter = 'all' | 'active' | 'completed';
