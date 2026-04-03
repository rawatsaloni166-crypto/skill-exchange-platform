import api from './axios';

export interface User {
  _id: string;
  displayName: string;
  email: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  skillsOffered: string[];
  skillsWanted: string[];
  role: 'user' | 'admin';
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  displayName: string;
  email: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<User> {
  const res = await api.post<{ success: boolean; data: User }>('/auth/login', payload);
  return res.data.data;
}

export async function register(payload: RegisterPayload): Promise<User> {
  const res = await api.post<{ success: boolean; data: User }>('/auth/register', payload);
  return res.data.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function getMe(): Promise<User> {
  const res = await api.get<{ success: boolean; data: User }>('/me');
  return res.data.data;
}
