const Review = require('../models/Review');
const Session = require('../models/Session');
const User = require('../models/User');
const { checkAndAwardBadges } = require('../services/badgeService');

const createReview = async (req, res, next) => {
  try {
    const { sessionId, ratings, comment, isPublic = true } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status !== 'completed') {
      return res.status(400).json({ error: 'Can only review completed sessions' });
    }

    const isTeacher = session.teacher.toString() === req.user._id.toString();
    const isLearner = session.learner.toString() === req.user._id.toString();
    if (!isTeacher && !isLearner) return res.status(403).json({ error: 'Access denied' });

    const reviewee = isTeacher ? session.learner : session.teacher;
    const role = isTeacher ? 'teacher' : 'learner';

    const existing = await Review.findOne({ session: sessionId, reviewer: req.user._id });
    if (existing) return res.status(409).json({ error: 'You have already reviewed this session' });

    const review = await Review.create({
      session: sessionId,
      reviewer: req.user._id,
      reviewee,
      role,
      ratings,
      comment,
      isPublic,
    });

    if (role === 'teacher') session.teacherReviewed = true;
    else session.learnerReviewed = true;
    await session.save();

    // Update reviewee stats
    const revieweeUser = await User.findById(reviewee);
    const allReviews = await Review.find({ reviewee, isHidden: false });
    const avgRating = allReviews.reduce((sum, r) => sum + r.ratings.overall, 0) / allReviews.length;
    revieweeUser.stats.averageRating = Math.round(avgRating * 10) / 10;
    revieweeUser.stats.totalReviews = allReviews.length;
    revieweeUser.stats.reputationScore = Math.round(avgRating * 20 * (1 + Math.log(allReviews.length + 1)));
    const newBadges = await checkAndAwardBadges(revieweeUser);
    await revieweeUser.save();

    const populated = await review.populate('reviewer', 'name avatar');
    res.status(201).json({ review: populated, newBadges });
  } catch (err) {
    next(err);
  }
};

const getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const total = await Review.countDocuments({ reviewee: userId, isPublic: true, isHidden: false });
    const reviews = await Review.find({ reviewee: userId, isPublic: true, isHidden: false })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ reviews, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

const reportReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (!review.reportedBy.includes(req.user._id)) {
      review.reportedBy.push(req.user._id);
      await review.save();
    }
    res.json({ message: 'Review reported' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createReview, getUserReviews, reportReview };
