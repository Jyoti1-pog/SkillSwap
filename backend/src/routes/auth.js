const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const {
  signup, login, getMe, forgotPassword, resetPassword, changePassword,
} = require('../controllers/authController');

router.post('/signup',
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 chars'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 chars'),
  ],
  validate,
  signup
);

router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate,
  login
);

router.get('/me', authenticate, getMe);

router.post('/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  validate,
  forgotPassword
);

router.post('/reset-password',
  [
    body('token').notEmpty(),
    body('password').isLength({ min: 8 }),
  ],
  validate,
  resetPassword
);

router.post('/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }),
  ],
  validate,
  changePassword
);

module.exports = router;
