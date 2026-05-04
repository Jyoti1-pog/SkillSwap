const Notification = require('../models/Notification');
const { emitNotification } = require('./socketService');

const createNotification = async ({ recipient, type, title, message, data = {}, link = null }) => {
  const notification = await Notification.create({ recipient, type, title, message, data, link });
  emitNotification(recipient.toString(), notification);
  return notification;
};

const notifySwapRequestReceived = async (senderId, receiverId, requestId) => {
  return createNotification({
    recipient: receiverId,
    type: 'swap_request_received',
    title: 'New Swap Request',
    message: 'Someone wants to swap skills with you!',
    data: { senderId, requestId },
    link: `/requests/${requestId}`,
  });
};

const notifySwapRequestAccepted = async (senderId, receiverId, requestId) => {
  return createNotification({
    recipient: senderId,
    type: 'swap_request_accepted',
    title: 'Swap Request Accepted!',
    message: 'Your swap request has been accepted. Start chatting!',
    data: { receiverId, requestId },
    link: `/requests/${requestId}`,
  });
};

const notifySwapRequestRejected = async (senderId, receiverId, requestId) => {
  return createNotification({
    recipient: senderId,
    type: 'swap_request_rejected',
    title: 'Swap Request Declined',
    message: 'Your swap request was not accepted this time.',
    data: { receiverId, requestId },
    link: `/requests`,
  });
};

const notifyNewMessage = async (senderId, recipientId, conversationId) => {
  return createNotification({
    recipient: recipientId,
    type: 'new_message',
    title: 'New Message',
    message: 'You have a new message',
    data: { senderId, conversationId },
    link: `/messages/${conversationId}`,
  });
};

const notifySessionScheduled = async (userId, sessionId, scheduledAt) => {
  return createNotification({
    recipient: userId,
    type: 'session_scheduled',
    title: 'Session Scheduled',
    message: `Your session has been scheduled for ${new Date(scheduledAt).toLocaleDateString()}`,
    data: { sessionId },
    link: `/sessions/${sessionId}`,
  });
};

const notifyBadgeEarned = async (userId, badge) => {
  return createNotification({
    recipient: userId,
    type: 'badge_earned',
    title: `Badge Earned: ${badge.name}`,
    message: badge.description,
    data: { badge },
    link: '/profile',
  });
};

module.exports = {
  createNotification,
  notifySwapRequestReceived,
  notifySwapRequestAccepted,
  notifySwapRequestRejected,
  notifyNewMessage,
  notifySessionScheduled,
  notifyBadgeEarned,
};
