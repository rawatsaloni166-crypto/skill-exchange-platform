import api from './axios';
import type { User } from './auth';

export interface Request {
  _id: string;
  fromUser: User;
  toUser: User;
  skillOffered: string;
  skillWanted: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed';
  createdAt: string;
}

export interface CreateRequestPayload {
  toUserId: string;
  skillOffered: string;
  skillWanted: string;
  message: string;
}

export async function getMyRequests(): Promise<Request[]> {
  const res = await api.get<{ success: boolean; data: Request[] }>('/requests');
  return res.data.data;
}

export async function getRequestById(id: string): Promise<Request> {
  const res = await api.get<{ success: boolean; data: Request }>(`/requests/${id}`);
  return res.data.data;
}

export async function createRequest(payload: CreateRequestPayload): Promise<Request> {
  const res = await api.post<{ success: boolean; data: Request }>('/requests', payload);
  return res.data.data;
}

export async function updateRequestStatus(
  id: string,
  status: 'accepted' | 'declined' | 'cancelled' | 'completed'
): Promise<Request> {
  const res = await api.patch<{ success: boolean; data: Request }>(`/requests/${id}/status`, {
    status,
  });
  return res.data.data;
}
