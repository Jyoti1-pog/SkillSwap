const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  swapRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'SwapRequest', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  skill: {
    name: { type: String, required: true },
    category: String,
  },

  scheduledAt: { type: Date, required: true },
  duration: { type: Number, default: 60 },
  format: { type: String, enum: ['video', 'audio', 'text', 'in-person'], default: 'video' },
  meetingLink: { type: String, default: null },
  timezone: { type: String, default: 'UTC' },

  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled',
  },

  notes: { type: String, maxlength: 2000, default: '' },
  teacherNotes: { type: String, maxlength: 1000, default: '' },
  learnerNotes: { type: String, maxlength: 1000, default: '' },

  teacherReviewed: { type: Boolean, default: false },
  learnerReviewed: { type: Boolean, default: false },

  actualStartTime: { type: Date, default: null },
  actualEndTime: { type: Date, default: null },
}, { timestamps: true });

sessionSchema.index({ teacher: 1, scheduledAt: 1 });
sessionSchema.index({ learner: 1, scheduledAt: 1 });
sessionSchema.index({ status: 1 });

module.exports = mongoose.model('Session', sessionSchema);
