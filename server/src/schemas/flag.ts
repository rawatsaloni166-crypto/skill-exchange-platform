import { z } from 'zod';

export const createFlagSchema = z.object({
  targetType: z.enum(['user', 'request', 'message']),
  targetId: z.string(),
  reason: z.string().min(1).max(500),
});
