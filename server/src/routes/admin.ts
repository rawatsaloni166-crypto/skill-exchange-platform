import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import Flag from '../models/Flag';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/flags', async (req, res, next) => {
  try {
    const flags = await Flag.find()
      .populate('reporter', 'displayName')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: flags });
  } catch (err) {
    next(err);
  }
});

const updateFlagSchema = z.object({
  status: z.enum(['pending', 'resolved']),
});

router.patch('/flags/:id', validate(updateFlagSchema), async (req, res, next) => {
  try {
    const { status } = req.body as { status: 'pending' | 'resolved' };
    const flag = await Flag.findById(req.params.id);
    if (!flag) {
      res.status(404).json({ success: false, error: 'Flag not found' });
      return;
    }
    flag.status = status;
    await flag.save();
    res.json({ success: true, data: flag });
  } catch (err) {
    next(err);
  }
});

export default router;
