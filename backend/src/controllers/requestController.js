const SwapRequest = require('../models/SwapRequest');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { calculateMatchScore } = require('../services/matchingService');
const {
  notifySwapRequestReceived,
  notifySwapRequestAccepted,
  notifySwapRequestRejected,
} = require('../services/notificationService');

const sendRequest = async (req, res, next) => {
  try {
    const { receiverId, senderSkillOffer, receiverSkillWanted, message, proposedSchedule } = req.body;

    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot send request to yourself' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver || !receiver.isActive) return res.status(404).json({ error: 'User not found' });

    const existing = await SwapRequest.findOne({
      $or: [
        { sender: req.user._id, receiver: receiverId, status: 'pending' },
        { sender: receiverId, receiver: req.user._id, status: 'pending' },
      ],
    });
    if (existing) return res.status(409).json({ error: 'A pending request already exists' });

    const sender = await User.findById(req.user._id);
    const { score, reasons } = calculateMatchScore(sender, receiver);

    const request = await SwapRequest.create({
      sender: req.user._id,
      receiver: receiverId,
      senderSkillOffer,
      receiverSkillWanted,
      message,
      proposedSchedule,
      matchScore: score,
      matchReasons: reasons,
    });

    await notifySwapRequestReceived(req.user._id, receiverId, request._id);
    const populated = await request.populate(['sender', 'receiver'], 'name avatar profile.headline');
    res.status(201).json({ request: populated });
  } catch (err) {
    next(err);
  }
};

const getMyRequests = async (req, res, next) => {
  try {
    const { type = 'all', status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (type === 'sent') query.sender = req.user._id;
    else if (type === 'received') query.receiver = req.user._id;
    else query.$or = [{ sender: req.user._id }, { receiver: req.user._id }];

    if (status) query.status = status;

    const total = await SwapRequest.countDocuments(query);
    const requests = await SwapRequest.find(query)
      .populate('sender', 'name avatar profile.headline stats.averageRating')
      .populate('receiver', 'name avatar profile.headline stats.averageRating')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ requests, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

const getRequest = async (req, res, next) => {
  try {
    const request = await SwapRequest.findById(req.params.id)
      .populate('sender', 'name avatar profile stats badges')
      .populate('receiver', 'name avatar profile stats badges')
      .populate('conversation');
    if (!request) return res.status(404).json({ error: 'Request not found' });

    const isParticipant = [request.sender._id.toString(), request.receiver._id.toString()]
      .includes(req.user._id.toString());
    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json({ request });
  } catch (err) {
    next(err);
  }
};

const acceptRequest = async (req, res, next) => {
  try {
    const request = await SwapRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the receiver can accept' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ error: `Request is already ${request.status}` });
    }

    // Create or find conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [request.sender, request.receiver] },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [request.sender, request.receiver],
        swapRequest: request._id,
        messages: [{
          sender: request.receiver,
          content: `Swap request accepted! Let's get started.`,
          type: 'system',
          readBy: [request.receiver],
        }],
      });
    }

    request.status = 'accepted';
    request.acceptedAt = new Date();
    request.conversation = conversation._id;
    await request.save();

    await notifySwapRequestAccepted(request.sender, request.receiver, request._id);

    const populated = await request.populate(['sender', 'receiver'], 'name avatar');
    res.json({ request: populated, conversation });
  } catch (err) {
    next(err);
  }
};

const rejectRequest = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const request = await SwapRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the receiver can reject' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ error: `Request is already ${request.status}` });
    }

    request.status = 'rejected';
    request.rejectedAt = new Date();
    request.rejectionReason = reason;
    await request.save();

    await notifySwapRequestRejected(request.sender, request.receiver, request._id);
    res.json({ request });
  } catch (err) {
    next(err);
  }
};

const cancelRequest = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const request = await SwapRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the sender can cancel' });
    }
    if (!['pending', 'accepted'].includes(request.status)) {
      return res.status(400).json({ error: 'Cannot cancel this request' });
    }

    request.status = 'cancelled';
    request.cancelledAt = new Date();
    request.cancellationReason = reason;
    await request.save();
    res.json({ request });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendRequest, getMyRequests, getRequest, acceptRequest, rejectRequest, cancelRequest };
