import axios from 'axios';
import type { User } from '../types';

const api = axios.create({ withCredentials: true });

export const register = async (email: string, password: string): Promise<User> => {
  const { data } = await api.post<{ user: User }>('/api/auth/register', { email, password });
  return data.user;
};

export const login = async (email: string, password: string): Promise<User> => {
  const { data } = await api.post<{ user: User }>('/api/auth/login', { email, password });
  return data.user;
};

export const logout = async (): Promise<void> => {
  await api.post('/api/auth/logout');
};

export const getMe = async (): Promise<User> => {
  const { data } = await api.get<{ user: User }>('/api/auth/me');
  return data.user;
};
