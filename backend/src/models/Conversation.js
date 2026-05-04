const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 5000 },
  type: { type: String, enum: ['text', 'image', 'file', 'system'], default: 'text' },
  fileUrl: { type: String, default: null },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  swapRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'SwapRequest', default: null },
  messages: [messageSchema],
  lastMessage: {
    content: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sentAt: Date,
  },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

conversationSchema.index({ participants: 1 });
conversationSchema.index({ 'lastMessage.sentAt': -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
