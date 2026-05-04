const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  senderSkillOffer: {
    name: { type: String, required: true },
    category: String,
    level: String,
    description: String,
  },
  receiverSkillWanted: {
    name: { type: String, required: true },
    category: String,
    level: String,
    description: String,
  },

  message: { type: String, maxlength: 1000, default: '' },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
    default: 'pending',
  },

  matchScore: { type: Number, default: 0 },
  matchReasons: [String],

  proposedSchedule: {
    date: Date,
    duration: { type: Number, default: 60 },
    format: { type: String, enum: ['video', 'audio', 'text', 'in-person'], default: 'video' },
    timezone: String,
  },

  acceptedAt: { type: Date, default: null },
  rejectedAt: { type: Date, default: null },
  cancelledAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: null },
  cancellationReason: { type: String, default: null },

  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', default: null },
}, { timestamps: true });

swapRequestSchema.index({ sender: 1, status: 1 });
swapRequestSchema.index({ receiver: 1, status: 1 });
swapRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SwapRequest', swapRequestSchema);
