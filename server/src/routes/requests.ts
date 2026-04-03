import { Router } from 'express';
import mongoose from 'mongoose';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createRequestSchema, updateRequestSchema } from '../schemas/request';
import Request from '../models/Request';
import User from '../models/User';

const router = Router();

router.use(authenticate);

router.post('/', validate(createRequestSchema), async (req, res, next) => {
  try {
    const { toUser, skillOffered, skillWanted, message } = req.body as {
      toUser: string;
      skillOffered: string;
      skillWanted: string;
      message: string;
    };
    if (toUser === req.user!.userId) {
      res.status(400).json({ success: false, error: 'Cannot send a request to yourself' });
      return;
    }
    if (!mongoose.isValidObjectId(toUser)) {
      res.status(400).json({ success: false, error: 'Invalid user ID' });
      return;
    }
    const safeToUserId = new mongoose.Types.ObjectId(toUser);
    const targetUser = await User.findById(safeToUserId);
    if (!targetUser) {
      res.status(404).json({ success: false, error: 'Target user not found' });
      return;
    }
    const request = await Request.create({
      fromUser: req.user!.userId,
      toUser: safeToUserId,
      skillOffered,
      skillWanted,
      message,
    });
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { type } = req.query as { type?: string };
    const userId = req.user!.userId;
    let filter = {};
    if (type === 'incoming') {
      filter = { toUser: userId };
    } else if (type === 'outgoing') {
      filter = { fromUser: userId };
    } else {
      filter = { $or: [{ fromUser: userId }, { toUser: userId }] };
    }
    const requests = await Request.find(filter)
      .populate('fromUser', 'displayName avatarUrl skillsOffered skillsWanted')
      .populate('toUser', 'displayName avatarUrl skillsOffered skillsWanted')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('fromUser', 'displayName avatarUrl skillsOffered skillsWanted')
      .populate('toUser', 'displayName avatarUrl skillsOffered skillsWanted');
    if (!request) {
      res.status(404).json({ success: false, error: 'Request not found' });
      return;
    }
    const userId = req.user!.userId;
    const fromUserId = request.fromUser._id.toString();
    const toUserId = request.toUser._id.toString();
    if (fromUserId !== userId && toUserId !== userId) {
      res.status(403).json({ success: false, error: 'Not a participant in this request' });
      return;
    }
    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', validate(updateRequestSchema), async (req, res, next) => {
  try {
    const { status } = req.body as { status: string };
    const request = await Request.findById(req.params.id);
    if (!request) {
      res.status(404).json({ success: false, error: 'Request not found' });
      return;
    }
    const userId = req.user!.userId;
    const fromUserId = request.fromUser.toString();
    const toUserId = request.toUser.toString();
    if (fromUserId !== userId && toUserId !== userId) {
      res.status(403).json({ success: false, error: 'Not a participant in this request' });
      return;
    }
    const isFrom = fromUserId === userId;
    const isTo = toUserId === userId;
    const currentStatus = request.status;
    let valid = false;
    if (isFrom) {
      if (status === 'cancelled' && (currentStatus === 'pending' || currentStatus === 'accepted')) valid = true;
      if (status === 'completed' && currentStatus === 'accepted') valid = true;
    }
    if (isTo) {
      if (status === 'accepted' && currentStatus === 'pending') valid = true;
      if (status === 'declined' && currentStatus === 'pending') valid = true;
    }
    if (!valid) {
      res.status(400).json({ success: false, error: 'Invalid status transition' });
      return;
    }
    request.status = status as typeof request.status;
    await request.save();
    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
});

export default router;
