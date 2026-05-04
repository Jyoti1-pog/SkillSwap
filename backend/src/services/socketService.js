const jwt = require('jsonwebtoken');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

let io;

const setupSocketIO = (socketIO) => {
  io = socketIO;

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.userId}`);
    socket.join(`user:${socket.userId}`);

    socket.on('join_conversation', (conversationId) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conv:${conversationId}`);
    });

    socket.on('send_message', async ({ conversationId, content, type = 'text' }) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(socket.userId)) return;

        const message = {
          sender: socket.userId,
          content,
          type,
          readBy: [socket.userId],
          createdAt: new Date(),
        };
        conversation.messages.push(message);
        conversation.lastMessage = { content, sender: socket.userId, sentAt: new Date() };
        await conversation.save();

        const savedMessage = conversation.messages[conversation.messages.length - 1];
        io.to(`conv:${conversationId}`).emit('new_message', { conversationId, message: savedMessage });

        const otherParticipants = conversation.participants.filter(
          (p) => p.toString() !== socket.userId
        );
        for (const participantId of otherParticipants) {
          io.to(`user:${participantId}`).emit('message_notification', {
            conversationId,
            message: savedMessage,
          });
        }
      } catch (err) {
        logger.error('Socket send_message error:', err);
      }
    });

    socket.on('mark_read', async ({ conversationId, messageIds }) => {
      try {
        await Conversation.updateOne(
          { _id: conversationId },
          { $addToSet: { 'messages.$[msg].readBy': socket.userId } },
          { arrayFilters: [{ 'msg._id': { $in: messageIds } }] }
        );
        socket.to(`conv:${conversationId}`).emit('messages_read', { userId: socket.userId, messageIds });
      } catch (err) {
        logger.error('Socket mark_read error:', err);
      }
    });

    socket.on('typing', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('user_typing', { userId: socket.userId, conversationId });
    });

    socket.on('stop_typing', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('user_stop_typing', { userId: socket.userId, conversationId });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.userId}`);
    });
  });
};

const emitNotification = (userId, notification) => {
  if (io) io.to(`user:${userId}`).emit('notification', notification);
};

const emitToUser = (userId, event, data) => {
  if (io) io.to(`user:${userId}`).emit(event, data);
};

module.exports = { setupSocketIO, emitNotification, emitToUser };
