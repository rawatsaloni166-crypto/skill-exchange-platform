import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createMessageSchema } from '../schemas/message';
import Request from '../models/Request';
import Message from '../models/Message';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/:requestId/messages', async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) {
      res.status(404).json({ success: false, error: 'Request not found' });
      return;
    }
    const userId = req.user!.userId;
    if (request.fromUser.toString() !== userId && request.toUser.toString() !== userId) {
      res.status(403).json({ success: false, error: 'Not a participant in this request' });
      return;
    }
    const messages = await Message.find({ request: req.params.requestId })
      .populate('sender', 'displayName avatarUrl')
      .sort({ createdAt: 1 });
    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
});

router.post('/:requestId/messages', validate(createMessageSchema), async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) {
      res.status(404).json({ success: false, error: 'Request not found' });
      return;
    }
    const userId = req.user!.userId;
    if (request.fromUser.toString() !== userId && request.toUser.toString() !== userId) {
      res.status(403).json({ success: false, error: 'Not a participant in this request' });
      return;
    }
    if (request.status !== 'accepted') {
      res.status(400).json({ success: false, error: 'Request must be accepted to send messages' });
      return;
    }
    const { body } = req.body as { body: string };
    const message = await Message.create({
      request: req.params.requestId,
      sender: userId,
      body,
    });
    const populated = await message.populate('sender', 'displayName avatarUrl');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
});

export default router;
