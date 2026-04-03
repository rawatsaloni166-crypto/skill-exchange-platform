import api from './axios';

export interface CreateReviewPayload {
  requestId: string;
  rating: number;
  comment: string;
}

export async function createReview(payload: CreateReviewPayload): Promise<void> {
  await api.post('/reviews', payload);
}
