import { z } from 'zod';

export const createRequestSchema = z.object({
  toUser: z.string(),
  skillOffered: z.string().min(1),
  skillWanted: z.string().min(1),
  message: z.string().min(1).max(1000),
});

export const updateRequestSchema = z.object({
  status: z.enum(['accepted', 'declined', 'cancelled', 'completed']),
});
