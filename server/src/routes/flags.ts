import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createFlagSchema } from '../schemas/flag';
import Flag from '../models/Flag';

const router = Router();

router.use(authenticate);

router.post('/', validate(createFlagSchema), async (req, res, next) => {
  try {
    const { targetType, targetId, reason } = req.body as {
      targetType: 'user' | 'request' | 'message';
      targetId: string;
      reason: string;
    };
    const flag = await Flag.create({
      reporter: req.user!.userId,
      targetType,
      targetId,
      reason,
    });
    res.status(201).json({ success: true, data: flag });
  } catch (err) {
    next(err);
  }
});

export default router;
