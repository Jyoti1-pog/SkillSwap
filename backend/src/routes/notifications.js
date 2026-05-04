const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getNotifications, markAsRead, deleteNotification } = require('../controllers/notificationController');

router.get('/', authenticate, getNotifications);
router.patch('/read', authenticate, markAsRead);
router.delete('/:id', authenticate, deleteNotification);

module.exports = router;
