const User = require('../models/User');
const SwapRequest = require('../models/SwapRequest');
const Session = require('../models/Session');
const Review = require('../models/Review');
const Report = require('../models/Report');
const Notification = require('../models/Notification');

const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, activeUsers, totalSwaps, completedSwaps, pendingReports, totalSessions] =
      await Promise.all([
        User.countDocuments({ role: 'user' }),
        User.countDocuments({ isActive: true, role: 'user' }),
        SwapRequest.countDocuments(),
        SwapRequest.countDocuments({ status: 'completed' }),
        Report.countDocuments({ status: 'open' }),
        Session.countDocuments(),
      ]);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const newSwaps = await SwapRequest.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    const topUsers = await User.find({ role: 'user', isActive: true })
      .select('name avatar stats badges')
      .sort({ 'stats.reputationScore': -1 })
      .limit(10);

    const recentUsers = await User.find({ role: 'user' })
      .select('name email avatar createdAt isActive isBanned')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      stats: { totalUsers, activeUsers, totalSwaps, completedSwaps, pendingReports, totalSessions, newUsers, newSwaps },
      topUsers,
      recentUsers,
    });
  } catch (err) {
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const query = { role: 'user' };
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    if (status === 'banned') query.isBanned = true;
    if (status === 'inactive') query.isActive = false;
    if (status === 'active') { query.isActive = true; query.isBanned = false; }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('name email avatar createdAt isActive isBanned banReason stats role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

const banUser = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: true, banReason: reason },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user, message: 'User banned successfully' });
  } catch (err) {
    next(err);
  }
};

const unbanUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: false, banReason: null },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user, message: 'User unbanned' });
  } catch (err) {
    next(err);
  }
};

const getReports = async (req, res, next) => {
  try {
    const { status = 'open', page = 1, limit = 20 } = req.query;
    const query = status !== 'all' ? { status } : {};

    const total = await Report.countDocuments(query);
    const reports = await Report.find(query)
      .populate('reporter', 'name avatar email')
      .populate('reported', 'name avatar email')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ reports, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

const resolveReport = async (req, res, next) => {
  try {
    const { resolution, action } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved', resolution, resolvedBy: req.user._id, resolvedAt: new Date() },
      { new: true }
    );
    if (!report) return res.status(404).json({ error: 'Report not found' });

    if (action === 'ban') {
      await User.findByIdAndUpdate(report.reported, { isBanned: true, banReason: resolution });
    }
    res.json({ report });
  } catch (err) {
    next(err);
  }
};

const hideReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { isHidden: true }, { new: true });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json({ review, message: 'Review hidden' });
  } catch (err) {
    next(err);
  }
};

const createReport = async (req, res, next) => {
  try {
    const { reportedId, type, description } = req.body;
    const report = await Report.create({
      reporter: req.user._id,
      reported: reportedId,
      type,
      description,
    });
    res.status(201).json({ report });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats, getUsers, banUser, unbanUser,
  getReports, resolveReport, hideReview, createReport,
};
