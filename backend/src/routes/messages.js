const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { getConversations, getMessages, sendMessage, createConversation } = require('../controllers/messageController');

router.get('/conversations', authenticate, getConversations);
router.post('/conversations', authenticate, createConversation);
router.get('/conversations/:conversationId', authenticate, getMessages);
router.post('/conversations/:conversationId',
  authenticate,
  [body('content').notEmpty().withMessage('Message content required')],
  validate,
  sendMessage
);

module.exports = router;
