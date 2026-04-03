import { Router } from 'express';
import mongoose from 'mongoose';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createFlagSchema } from '../schemas/flag';
import Flag from '../models/Flag';
import User from '../models/User';
import Request from '../models/Request';
import Message from '../models/Message';

const router = Router();

router.use(authenticate);

const targetModelMap: Record<string, mongoose.Model<unknown>> = {
  user: User as mongoose.Model<unknown>,
  request: Request as mongoose.Model<unknown>,
  message: Message as mongoose.Model<unknown>,
};

router.post('/', validate(createFlagSchema), async (req, res, next) => {
  try {
    const { targetType, targetId, reason } = req.body as {
      targetType: 'user' | 'request' | 'message';
      targetId: string;
      reason: string;
    };
    if (!mongoose.isValidObjectId(targetId)) {
      res.status(400).json({ success: false, error: 'Invalid targetId' });
      return;
    }
    const targetExists = await targetModelMap[targetType].exists({ _id: targetId });
    if (!targetExists) {
      res.status(404).json({ success: false, error: `${targetType} not found` });
      return;
    }
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
