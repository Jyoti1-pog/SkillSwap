const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { scheduleSession, getMySessions, getSession, updateSessionStatus, cancelSession } = require('../controllers/sessionController');

router.get('/', authenticate, getMySessions);
router.post('/', authenticate, scheduleSession);
router.get('/:id', authenticate, getSession);
router.patch('/:id/status', authenticate, updateSessionStatus);
router.patch('/:id/cancel', authenticate, cancelSession);

module.exports = router;
