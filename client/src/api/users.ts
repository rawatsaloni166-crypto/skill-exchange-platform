import api from './axios';
import type { User } from './auth';

export interface UserSearchParams {
  keyword?: string;
  skillOffered?: string;
  skillWanted?: string;
  location?: string;
  page?: number;
  limit?: number;
}

export interface UserProfileUpdate {
  displayName?: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  skillsOffered?: string[];
  skillsWanted?: string[];
}

export interface Review {
  _id: string;
  reviewer: User;
  rating: number;
  comment: string;
  createdAt: string;
}

export async function searchUsers(params: UserSearchParams): Promise<User[]> {
  const res = await api.get<{ success: boolean; data: User[] }>('/users', { params });
  return res.data.data;
}

export async function getUserById(id: string): Promise<User> {
  const res = await api.get<{ success: boolean; data: User }>(`/users/${id}`);
  return res.data.data;
}

export async function getUserReviews(id: string): Promise<Review[]> {
  const res = await api.get<{ success: boolean; data: Review[] }>(`/users/${id}/reviews`);
  return res.data.data;
}

export async function updateMyProfile(payload: UserProfileUpdate): Promise<User> {
  const res = await api.put<{ success: boolean; data: User }>('/me/profile', payload);
  return res.data.data;
}
