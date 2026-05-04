const router = require('express').Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const {
  getProfile, updateProfile, completeOnboarding, searchUsers, getMyStats, deleteAccount,
} = require('../controllers/userController');

router.get('/search', optionalAuth, searchUsers);
router.get('/me/stats', authenticate, getMyStats);
router.get('/me/profile', authenticate, getProfile);   // own profile via token
router.get('/:id', optionalAuth, getProfile);
router.put('/me', authenticate, updateProfile);
router.post('/me/onboarding', authenticate, completeOnboarding);
router.delete('/me', authenticate, deleteAccount);

module.exports = router;
