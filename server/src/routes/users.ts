import { Router } from 'express';
import { FilterQuery } from 'mongoose';
import User, { IUser } from '../models/User';
import Review from '../models/Review';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { search, skillOffered, skillWanted, location } = req.query as Record<string, string | undefined>;
    const query: FilterQuery<IUser> = { role: 'user' };
    if (search) {
      query.displayName = { $regex: search, $options: 'i' };
    }
    if (skillOffered) {
      query.skillsOffered = { $in: [skillOffered] };
    }
    if (skillWanted) {
      query.skillsWanted = { $in: [skillWanted] };
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    const users = await User.find(query).select('-password');
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/reviews', async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.id })
      .populate('reviewer', 'displayName avatarUrl')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
});

export default router;
