const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getMatches } = require('../services/matchingService');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { limit = 20, page = 1, skillFilter, categoryFilter } = req.query;
    const result = await getMatches(req.user._id, {
      limit: parseInt(limit),
      page: parseInt(page),
      skillFilter,
      categoryFilter,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
