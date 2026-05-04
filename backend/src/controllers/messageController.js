const Conversation = require('../models/Conversation');
const { notifyNewMessage } = require('../services/notificationService');

const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      isArchived: false,
    })
      .populate('participants', 'name avatar profile.headline')
      .populate('swapRequest', 'status senderSkillOffer receiverSkillWanted')
      .sort({ 'lastMessage.sentAt': -1 });

    const result = conversations.map((conv) => {
      const other = conv.participants.find((p) => p._id.toString() !== req.user._id.toString());
      const unreadCount = conv.messages.filter(
        (m) => !m.readBy.includes(req.user._id) && m.sender.toString() !== req.user._id.toString()
      ).length;
      return { ...conv.toObject(), otherParticipant: other, unreadCount };
    });

    res.json({ conversations: result });
  } catch (err) {
    next(err);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'name avatar');
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const isParticipant = conversation.participants.some(
      (p) => p._id.toString() === req.user._id.toString()
    );
    if (!isParticipant) return res.status(403).json({ error: 'Access denied' });

    const totalMessages = conversation.messages.length;
    const skip = Math.max(0, totalMessages - page * limit);
    const messages = conversation.messages.slice(skip, skip + parseInt(limit)).reverse();

    // Mark messages as read
    await Conversation.updateOne(
      { _id: conversationId },
      { $addToSet: { 'messages.$[msg].readBy': req.user._id } },
      { arrayFilters: [{ 'msg.sender': { $ne: req.user._id } }] }
    );

    res.json({ messages, total: totalMessages, conversation: { ...conversation.toObject(), messages: undefined } });
  } catch (err) {
    next(err);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { content, type = 'text' } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) return res.status(403).json({ error: 'Access denied' });

    const message = {
      sender: req.user._id,
      content,
      type,
      readBy: [req.user._id],
    };
    conversation.messages.push(message);
    conversation.lastMessage = { content, sender: req.user._id, sentAt: new Date() };
    await conversation.save();

    const savedMessage = conversation.messages[conversation.messages.length - 1];

    const otherParticipants = conversation.participants.filter(
      (p) => p.toString() !== req.user._id.toString()
    );
    for (const recipientId of otherParticipants) {
      await notifyNewMessage(req.user._id, recipientId, conversationId);
    }

    res.status(201).json({ message: savedMessage });
  } catch (err) {
    next(err);
  }
};

const createConversation = async (req, res, next) => {
  try {
    const { participantId } = req.body;
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, participantId],
      });
    }
    await conversation.populate('participants', 'name avatar profile.headline');
    res.json({ conversation });
  } catch (err) {
    next(err);
  }
};

module.exports = { getConversations, getMessages, sendMessage, createConversation };
