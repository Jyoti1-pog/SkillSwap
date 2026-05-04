const Session = require('../models/Session');
const SwapRequest = require('../models/SwapRequest');
const { notifySessionScheduled } = require('../services/notificationService');

const scheduleSession = async (req, res, next) => {
  try {
    const { swapRequestId, scheduledAt, duration, format, meetingLink, timezone, skill } = req.body;

    const request = await SwapRequest.findById(swapRequestId);
    if (!request || request.status !== 'accepted') {
      return res.status(400).json({ error: 'Swap request must be accepted first' });
    }

    const isParticipant = [request.sender.toString(), request.receiver.toString()]
      .includes(req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ error: 'Access denied' });

    const session = await Session.create({
      swapRequest: swapRequestId,
      teacher: req.user._id,
      learner: req.user._id.toString() === request.sender.toString() ? request.receiver : request.sender,
      skill: skill || { name: request.senderSkillOffer.name, category: request.senderSkillOffer.category },
      scheduledAt,
      duration: duration || 60,
      format: format || 'video',
      meetingLink,
      timezone: timezone || 'UTC',
    });

    await notifySessionScheduled(session.learner, session._id, scheduledAt);

    const populated = await session.populate(['teacher', 'learner'], 'name avatar');
    res.status(201).json({ session: populated });
  } catch (err) {
    next(err);
  }
};

const getMySessions = async (req, res, next) => {
  try {
    const { status, role, page = 1, limit = 10 } = req.query;
    const query = {};

    if (role === 'teacher') query.teacher = req.user._id;
    else if (role === 'learner') query.learner = req.user._id;
    else query.$or = [{ teacher: req.user._id }, { learner: req.user._id }];

    if (status) query.status = status;

    const total = await Session.countDocuments(query);
    const sessions = await Session.find(query)
      .populate('teacher', 'name avatar')
      .populate('learner', 'name avatar')
      .populate('swapRequest', 'status')
      .sort({ scheduledAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ sessions, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

const getSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('teacher', 'name avatar profile')
      .populate('learner', 'name avatar profile')
      .populate('swapRequest');
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const isParticipant = [session.teacher._id.toString(), session.learner._id.toString()]
      .includes(req.user._id.toString());
    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json({ session });
  } catch (err) {
    next(err);
  }
};

const updateSessionStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const isParticipant = [session.teacher.toString(), session.learner.toString()]
      .includes(req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ error: 'Access denied' });

    session.status = status;
    if (notes) {
      if (session.teacher.toString() === req.user._id.toString()) session.teacherNotes = notes;
      else session.learnerNotes = notes;
    }
    if (status === 'in-progress') session.actualStartTime = new Date();
    if (status === 'completed') {
      session.actualEndTime = new Date();
      await SwapRequest.findByIdAndUpdate(session.swapRequest, { status: 'completed', completedAt: new Date() });
    }
    await session.save();
    res.json({ session });
  } catch (err) {
    next(err);
  }
};

const cancelSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const isParticipant = [session.teacher.toString(), session.learner.toString()]
      .includes(req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ error: 'Access denied' });

    session.status = 'cancelled';
    await session.save();
    res.json({ session });
  } catch (err) {
    next(err);
  }
};

module.exports = { scheduleSession, getMySessions, getSession, updateSessionStatus, cancelSession };
