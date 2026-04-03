import { Router } from 'express';
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
    const request = await Request.findById(requestId);
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
    const existing = await Review.findOne({ request: requestId, reviewer: userId });
    if (existing) {
      res.status(409).json({ success: false, error: 'You have already reviewed this request' });
      return;
    }
    const review = await Review.create({
      request: requestId,
      reviewer: userId,
      reviewee: revieweeId,
      rating,
      comment: comment ?? '',
    });
    const allReviews = await Review.find({ reviewee: revieweeId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(revieweeId, {
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: allReviews.length,
    });
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
});

export default router;
