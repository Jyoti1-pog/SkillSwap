const router = require('express').Router();
const { SKILL_CATEGORIES } = require('../services/matchingService');

router.get('/categories', (req, res) => {
  res.json({ categories: SKILL_CATEGORIES });
});

const POPULAR_SKILLS = [
  { name: 'JavaScript', category: 'Programming' },
  { name: 'Python', category: 'Programming' },
  { name: 'React', category: 'Programming' },
  { name: 'Node.js', category: 'Programming' },
  { name: 'UI/UX Design', category: 'Design' },
  { name: 'Figma', category: 'Design' },
  { name: 'Guitar', category: 'Music' },
  { name: 'Piano', category: 'Music' },
  { name: 'Spanish', category: 'Language' },
  { name: 'French', category: 'Language' },
  { name: 'Photography', category: 'Photography' },
  { name: 'Video Editing', category: 'Design' },
  { name: 'Data Science', category: 'Programming' },
  { name: 'Machine Learning', category: 'Programming' },
  { name: 'Public Speaking', category: 'Business' },
  { name: 'Digital Marketing', category: 'Marketing' },
  { name: 'Copywriting', category: 'Writing' },
  { name: 'Excel/Sheets', category: 'Business' },
  { name: 'Drawing', category: 'Art' },
  { name: 'Yoga', category: 'Fitness' },
];

router.get('/popular', (req, res) => {
  res.json({ skills: POPULAR_SKILLS });
});

module.exports = router;
