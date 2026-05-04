const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { createReview, getUserReviews, reportReview } = require('../controllers/reviewController');

router.get('/user/:userId', getUserReviews);
router.post('/',
  authenticate,
  [
    body('sessionId').notEmpty(),
    body('ratings.overall').isInt({ min: 1, max: 5 }),
  ],
  validate,
  createReview
);
router.post('/:id/report', authenticate, reportReview);

module.exports = router;
