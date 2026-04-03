import { Router } from 'express';
import mongoose from 'mongoose';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema } from '../schemas/profile';
import User from '../models/User';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    if (!mongoose.isValidObjectId(userId)) {
      res.status(401).json({ success: false, error: 'Invalid token payload' });
      return;
    }
    const user = await User.findById(userId).select('-password');
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
    const userId = req.user!.userId;
    if (!mongoose.isValidObjectId(userId)) {
      res.status(401).json({ success: false, error: 'Invalid token payload' });
      return;
    }
    const safeUserId = new mongoose.Types.ObjectId(userId);
    const rawUpdates = req.body as {
      displayName?: string;
      bio?: string;
      location?: string;
      avatarUrl?: string;
      skillsOffered?: string[];
      skillsWanted?: string[];
    };
    // Explicitly build update from known-safe Zod-validated fields only
    const updates: Record<string, unknown> = {};
    if (rawUpdates.displayName !== undefined) updates['displayName'] = String(rawUpdates.displayName);
    if (rawUpdates.bio !== undefined) updates['bio'] = String(rawUpdates.bio);
    if (rawUpdates.location !== undefined) updates['location'] = String(rawUpdates.location);
    if (rawUpdates.avatarUrl !== undefined) updates['avatarUrl'] = String(rawUpdates.avatarUrl);
    if (rawUpdates.skillsOffered !== undefined) updates['skillsOffered'] = rawUpdates.skillsOffered.map(String);
    if (rawUpdates.skillsWanted !== undefined) updates['skillsWanted'] = rawUpdates.skillsWanted.map(String);
    const user = await User.findByIdAndUpdate(
      safeUserId,
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
