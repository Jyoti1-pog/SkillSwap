const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  role: { type: String, enum: ['teacher', 'learner'], required: true },

  ratings: {
    overall: { type: Number, min: 1, max: 5, required: true },
    communication: { type: Number, min: 1, max: 5, default: 5 },
    expertise: { type: Number, min: 1, max: 5, default: 5 },
    punctuality: { type: Number, min: 1, max: 5, default: 5 },
    helpfulness: { type: Number, min: 1, max: 5, default: 5 },
  },

  comment: { type: String, maxlength: 1000, default: '' },
  isPublic: { type: Boolean, default: true },

  helpfulVotes: { type: Number, default: 0 },
  reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isHidden: { type: Boolean, default: false },
}, { timestamps: true });

reviewSchema.index({ reviewee: 1, createdAt: -1 });
reviewSchema.index({ session: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
