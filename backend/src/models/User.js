const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  avatar: { type: String, default: null },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String, default: null },
  passwordResetToken: { type: String, default: null },
  passwordResetExpires: { type: Date, default: null },
  emailVerificationToken: { type: String, default: null },
  lastLoginAt: { type: Date, default: null },
  onboardingCompleted: { type: Boolean, default: false },

  profile: {
    bio: { type: String, maxlength: 500, default: '' },
    headline: { type: String, maxlength: 150, default: '' },
    location: { type: String, maxlength: 100, default: '' },
    timezone: { type: String, default: 'UTC' },
    website: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    availability: [{
      day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
      slots: [{ start: String, end: String }],
    }],
    languages: [String],
    experienceLevel: { type: String, enum: ['beginner', 'intermediate', 'expert'], default: 'intermediate' },
  },

  skillsToTeach: [{
    name: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'expert'], default: 'intermediate' },
    description: { type: String, maxlength: 300, default: '' },
    yearsOfExperience: { type: Number, default: 0 },
    tags: [String],
  }],

  skillsToLearn: [{
    name: { type: String, required: true },
    category: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    description: { type: String, maxlength: 300, default: '' },
  }],

  stats: {
    totalSwaps: { type: Number, default: 0 },
    completedSwaps: { type: Number, default: 0 },
    totalHoursTaught: { type: Number, default: 0 },
    totalHoursLearned: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    reputationScore: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 },
  },

  badges: [{
    type: { type: String },
    name: String,
    description: String,
    earnedAt: { type: Date, default: Date.now },
  }],

  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  referralCount: { type: Number, default: 0 },
}, { timestamps: true });

userSchema.index({ 'skillsToTeach.name': 'text', 'skillsToLearn.name': 'text', name: 'text' });
userSchema.index({ 'profile.location': 1 });
userSchema.index({ 'stats.averageRating': -1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.emailVerificationToken;
  return obj;
};

userSchema.virtual('profileCompletion').get(function () {
  let score = 0;
  if (this.name) score += 10;
  if (this.avatar) score += 10;
  if (this.profile?.bio) score += 15;
  if (this.profile?.headline) score += 10;
  if (this.profile?.location) score += 10;
  if (this.skillsToTeach?.length > 0) score += 20;
  if (this.skillsToLearn?.length > 0) score += 15;
  if (this.profile?.availability?.length > 0) score += 10;
  return score;
});

module.exports = mongoose.model('User', userSchema);
