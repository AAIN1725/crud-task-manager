import client from './client';
import type { User } from '../types';

export const register = async (email: string, password: string): Promise<User> => {
  const { data } = await client.post<{ user: User; token: string }>('/api/auth/register', { email, password });
  localStorage.setItem('token', data.token);
  return data.user;
};

export const login = async (email: string, password: string): Promise<User> => {
  const { data } = await client.post<{ user: User; token: string }>('/api/auth/login', { email, password });
  localStorage.setItem('token', data.token);
  return data.user;
};

export const logout = async (): Promise<void> => {
  await client.post('/api/auth/logout');
  localStorage.removeItem('token');
};

export const getMe = async (): Promise<User> => {
  const { data } = await client.get<{ user: User }>('/api/auth/me');
  return data.user;
};
