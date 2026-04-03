import { Router } from 'express';
import mongoose from 'mongoose';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createReviewSchema } from '../schemas/review';
import Request from '../models/Request';
import Review from '../models/Review';
import User from '../models/User';

const router = Router();

router.use(authenticate);

router.post('/', validate(createReviewSchema), async (req, res, next) => {
  try {
    const { requestId, revieweeId, rating, comment } = req.body as {
      requestId: string;
      revieweeId: string;
      rating: number;
      comment?: string;
    };
    if (!mongoose.isValidObjectId(requestId) || !mongoose.isValidObjectId(revieweeId)) {
      res.status(400).json({ success: false, error: 'Invalid ID format' });
      return;
    }
    const safeRequestId = new mongoose.Types.ObjectId(requestId);
    const safeRevieweeId = new mongoose.Types.ObjectId(revieweeId);
    const request = await Request.findById(safeRequestId);
    if (!request) {
      res.status(404).json({ success: false, error: 'Request not found' });
      return;
    }
    if (request.status !== 'completed') {
      res.status(400).json({ success: false, error: 'Request must be completed to leave a review' });
      return;
    }
    const userId = req.user!.userId;
    if (request.fromUser.toString() !== userId && request.toUser.toString() !== userId) {
      res.status(400).json({ success: false, error: 'Not a participant in this request' });
      return;
    }
    const existing = await Review.findOne({ request: safeRequestId, reviewer: userId });
    if (existing) {
      res.status(409).json({ success: false, error: 'You have already reviewed this request' });
      return;
    }
    const review = await Review.create({
      request: safeRequestId,
      reviewer: userId,
      reviewee: safeRevieweeId,
      rating,
      comment: comment ?? '',
    });
    const agg = await Review.aggregate<{ avgRating: number; count: number }>([
      { $match: { reviewee: review.reviewee } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (agg.length > 0) {
      await User.findByIdAndUpdate(safeRevieweeId, {
        averageRating: Math.round(agg[0].avgRating * 10) / 10, // round to 1 decimal place
        reviewCount: agg[0].count,
      });
    }
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
});

export default router;
