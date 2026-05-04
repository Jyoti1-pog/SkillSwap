const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'swap_request_received',
      'swap_request_accepted',
      'swap_request_rejected',
      'swap_request_cancelled',
      'session_scheduled',
      'session_reminder',
      'session_completed',
      'new_message',
      'review_received',
      'badge_earned',
      'profile_viewed',
      'match_found',
      'admin_alert',
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
  link: { type: String, default: null },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
