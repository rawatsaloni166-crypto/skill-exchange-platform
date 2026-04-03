import api from './axios';
import type { User } from './auth';

export interface Message {
  _id: string;
  sender: User;
  body: string;
  createdAt: string;
}

export async function getMessages(requestId: string): Promise<Message[]> {
  const res = await api.get<{ success: boolean; data: Message[] }>(
    `/requests/${requestId}/messages`
  );
  return res.data.data;
}

export async function sendMessage(requestId: string, body: string): Promise<Message> {
  const res = await api.post<{ success: boolean; data: Message }>(
    `/requests/${requestId}/messages`,
    { body }
  );
  return res.data.data;
}
