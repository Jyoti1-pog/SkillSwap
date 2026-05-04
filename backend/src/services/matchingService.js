const User = require('../models/User');

const SKILL_CATEGORIES = [
  'Programming', 'Design', 'Music', 'Language', 'Math', 'Science',
  'Business', 'Marketing', 'Writing', 'Photography', 'Cooking', 'Fitness',
  'Art', 'Finance', 'Sports', 'Other',
];

const calculateMatchScore = (userA, userB) => {
  let score = 0;
  const reasons = [];

  const aTeaches = (userA.skillsToTeach || []).map((s) => s.name.toLowerCase());
  const aLearns = (userA.skillsToLearn || []).map((s) => s.name.toLowerCase());
  const bTeaches = (userB.skillsToTeach || []).map((s) => s.name.toLowerCase());
  const bLearns = (userB.skillsToLearn || []).map((s) => s.name.toLowerCase());

  // A teaches what B wants to learn
  const aTeachesWhatBWants = aTeaches.filter((s) => bLearns.includes(s));
  if (aTeachesWhatBWants.length > 0) {
    score += Math.min(40, aTeachesWhatBWants.length * 20);
    reasons.push(`Can teach you: ${aTeachesWhatBWants.slice(0, 2).join(', ')}`);
  }

  // B teaches what A wants to learn
  const bTeachesWhatAWants = bTeaches.filter((s) => aLearns.includes(s));
  if (bTeachesWhatAWants.length > 0) {
    score += Math.min(40, bTeachesWhatAWants.length * 20);
    reasons.push(`Wants to learn from you: ${bTeachesWhatAWants.slice(0, 2).join(', ')}`);
  }

  // Category overlap bonus
  const aTeachCats = (userA.skillsToTeach || []).map((s) => s.category);
  const bLearnCats = (userB.skillsToLearn || []).map((s) => s.category);
  const catOverlap = aTeachCats.filter((c) => bLearnCats.includes(c));
  if (catOverlap.length > 0) {
    score += Math.min(10, catOverlap.length * 3);
  }

  // Rating bonus
  if (userB.stats?.averageRating >= 4.5) {
    score += 5;
    reasons.push('Highly rated teacher');
  }

  // Completed swaps trust bonus
  if (userB.stats?.completedSwaps >= 3) {
    score += 5;
    reasons.push('Experienced swapper');
  }

  // Same location bonus
  if (
    userA.profile?.location &&
    userB.profile?.location &&
    userA.profile.location.toLowerCase() === userB.profile.location.toLowerCase()
  ) {
    score += 5;
    reasons.push('Same location');
  }

  // Same timezone bonus
  if (
    userA.profile?.timezone &&
    userB.profile?.timezone &&
    userA.profile.timezone === userB.profile.timezone
  ) {
    score += 5;
    reasons.push('Same timezone');
  }

  return { score: Math.min(100, score), reasons };
};

const getMatches = async (userId, options = {}) => {
  const { limit = 20, page = 1, skillFilter, categoryFilter } = options;

  const currentUser = await User.findById(userId);
  if (!currentUser) return { matches: [], total: 0 };

  const learnSkills = (currentUser.skillsToLearn || []).map((s) => s.name.toLowerCase());
  const teachSkills = (currentUser.skillsToTeach || []).map((s) => s.name.toLowerCase());

  const query = {
    _id: { $ne: userId },
    isActive: true,
    isBanned: false,
    onboardingCompleted: true,
  };

  if (skillFilter) {
    query['skillsToTeach.name'] = new RegExp(skillFilter, 'i');
  }
  if (categoryFilter) {
    query['skillsToTeach.category'] = categoryFilter;
  }

  const candidates = await User.find(query)
    .select('-password -passwordResetToken -emailVerificationToken')
    .limit(200);

  const scored = candidates
    .map((candidate) => {
      const { score, reasons } = calculateMatchScore(currentUser, candidate);
      return { user: candidate, score, reasons };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score);

  const total = scored.length;
  const paginated = scored.slice((page - 1) * limit, page * limit);

  return { matches: paginated, total };
};

module.exports = { getMatches, calculateMatchScore, SKILL_CATEGORIES };
