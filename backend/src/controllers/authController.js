const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');
const logger = require('../utils/logger');

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const signup = async (req, res, next) => {
  try {
    const { name, email, password, referralCode } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        referredBy = referrer._id;
        referrer.referralCount += 1;
        await referrer.save();
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      referralCode: uuidv4().slice(0, 8).toUpperCase(),
      referredBy,
    });

    await createNotification({
      recipient: user._id,
      type: 'admin_alert',
      title: 'Welcome to SkillSwap Quest!',
      message: 'Start by completing your profile and adding your skills.',
      link: '/onboarding',
    });

    const token = generateToken(user._id);
    res.status(201).json({ token, user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.isBanned) return res.status(403).json({ error: `Account banned: ${user.banReason}` });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user._id);
    res.json({ token, user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ message: 'If that email exists, a reset link was sent.' });

    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    // In production, send email via nodemailer
    logger.info(`Password reset token for ${email}: ${token}`);
    res.json({ message: 'If that email exists, a reset link was sent.', devToken: token });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired reset token' });

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    const jwtToken = generateToken(user._id);
    res.json({ message: 'Password reset successful', token: jwtToken });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, getMe, forgotPassword, resetPassword, changePassword };
