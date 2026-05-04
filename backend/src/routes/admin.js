const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getDashboardStats, getUsers, banUser, unbanUser,
  getReports, resolveReport, hideReview, createReport,
} = require('../controllers/adminController');

router.use(authenticate, requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.patch('/users/:id/ban', banUser);
router.patch('/users/:id/unban', unbanUser);
router.get('/reports', getReports);
router.patch('/reports/:id/resolve', resolveReport);
router.patch('/reviews/:id/hide', hideReview);

module.exports = router;
