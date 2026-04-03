import api from './axios';

export interface CreateFlagPayload {
  targetType: 'user' | 'request' | 'review';
  targetId: string;
  reason: string;
}

export interface Flag {
  _id: string;
  reporter: { _id: string; displayName: string };
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  createdAt: string;
}

export async function createFlag(payload: CreateFlagPayload): Promise<void> {
  await api.post('/flags', payload);
}

export async function getFlags(): Promise<Flag[]> {
  const res = await api.get<{ success: boolean; data: Flag[] }>('/admin/flags');
  return res.data.data;
}

export async function resolveFlag(id: string): Promise<void> {
  await api.patch(`/admin/flags/${id}/resolve`);
}
