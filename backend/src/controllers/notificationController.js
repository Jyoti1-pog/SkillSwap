const Notification = require('../models/Notification');

const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const query = { recipient: req.user._id };
    if (unreadOnly === 'true') query.isRead = false;

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ notifications, total, unreadCount, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (ids && ids.length > 0) {
      await Notification.updateMany(
        { _id: { $in: ids }, recipient: req.user._id },
        { isRead: true, readAt: new Date() }
      );
    } else {
      await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { isRead: true, readAt: new Date() }
      );
    }
    res.json({ message: 'Notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markAsRead, deleteNotification };
