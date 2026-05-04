const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reported: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['spam', 'harassment', 'inappropriate_content', 'fake_profile', 'other'],
    required: true,
  },
  description: { type: String, maxlength: 1000, required: true },
  status: { type: String, enum: ['open', 'under_review', 'resolved', 'dismissed'], default: 'open' },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolution: { type: String, default: null },
  resolvedAt: { type: Date, default: null },
}, { timestamps: true });

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reported: 1 });

module.exports = mongoose.model('Report', reportSchema);
