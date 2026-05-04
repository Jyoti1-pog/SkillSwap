const User = require('../models/User');
const Review = require('../models/Review');
const { checkAndAwardBadges } = require('../services/badgeService');

const getProfile = async (req, res, next) => {
  try {
    // /me/profile uses req.user._id; /:id uses the URL param
    const targetId = req.params.id || req.user?._id;
    if (!targetId) return res.status(400).json({ error: 'No user ID provided' });

    const user = await User.findById(targetId)
      .select('-password -passwordResetToken -emailVerificationToken -passwordResetExpires');
    if (!user || !user.isActive || user.isBanned) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (req.user && req.user._id.toString() !== user._id.toString()) {
      user.stats.profileViews += 1;
      await user.save();
    }
    const reviews = await Review.find({ reviewee: user._id, isPublic: true, isHidden: false })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ user: user.toPublicJSON(), reviews });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'avatar', 'profile', 'skillsToTeach', 'skillsToLearn'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true })
      .select('-password -passwordResetToken -emailVerificationToken');

    const newBadges = await checkAndAwardBadges(user);
    await user.save();

    res.json({ user: user.toPublicJSON(), newBadges });
  } catch (err) {
    next(err);
  }
};

const completeOnboarding = async (req, res, next) => {
  try {
    const { profile, skillsToTeach, skillsToLearn } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { profile, skillsToTeach, skillsToLearn, onboardingCompleted: true } },
      { new: true, runValidators: true }
    ).select('-password');

    const newBadges = await checkAndAwardBadges(user);
    await user.save();

    res.json({ user: user.toPublicJSON(), newBadges });
  } catch (err) {
    next(err);
  }
};

const searchUsers = async (req, res, next) => {
  try {
    const { q, category, level, location, availability, page = 1, limit = 12 } = req.query;
    const query = { isActive: true, isBanned: false, onboardingCompleted: true, _id: { $ne: req.user?._id } };

    if (q) {
      query.$or = [
        { name: new RegExp(q, 'i') },
        { 'skillsToTeach.name': new RegExp(q, 'i') },
        { 'skillsToLearn.name': new RegExp(q, 'i') },
        { 'profile.headline': new RegExp(q, 'i') },
      ];
    }
    if (category) query['skillsToTeach.category'] = category;
    if (level) query['skillsToTeach.level'] = level;
    if (location) query['profile.location'] = new RegExp(location, 'i');

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('name avatar profile skillsToTeach skillsToLearn stats badges')
      .sort({ 'stats.averageRating': -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

const getMyStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      stats: user.stats,
      profileCompletion: user.profileCompletion,
      badges: user.badges,
      skillsToTeach: user.skillsToTeach,
      skillsToLearn: user.skillsToLearn,
    });
  } catch (err) {
    next(err);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    res.json({ message: 'Account deactivated successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, completeOnboarding, searchUsers, getMyStats, deleteAccount };
