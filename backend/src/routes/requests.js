const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const {
  sendRequest, getMyRequests, getRequest, acceptRequest, rejectRequest, cancelRequest,
} = require('../controllers/requestController');

router.get('/', authenticate, getMyRequests);
router.get('/:id', authenticate, getRequest);
router.post('/',
  authenticate,
  [
    body('receiverId').notEmpty().withMessage('Receiver ID required'),
    body('senderSkillOffer.name').notEmpty().withMessage('Skill offer name required'),
    body('receiverSkillWanted.name').notEmpty().withMessage('Skill wanted name required'),
  ],
  validate,
  sendRequest
);
router.patch('/:id/accept', authenticate, acceptRequest);
router.patch('/:id/reject', authenticate, rejectRequest);
router.patch('/:id/cancel', authenticate, cancelRequest);

module.exports = router;
