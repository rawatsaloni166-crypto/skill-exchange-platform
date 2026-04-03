import { z } from 'zod';

export const createReviewSchema = z.object({
  requestId: z.string(),
  revieweeId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});
