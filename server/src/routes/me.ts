import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema } from '../schemas/profile';
import User from '../models/User';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const user = await User.findById(req.user!.userId).select('-password');
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

router.put('/profile', validate(updateProfileSchema), async (req, res, next) => {
  try {
    const updates = req.body as {
      displayName?: string;
      bio?: string;
      location?: string;
      avatarUrl?: string;
      skillsOffered?: string[];
      skillsWanted?: string[];
    };
    const user = await User.findByIdAndUpdate(
      req.user!.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

export default router;
