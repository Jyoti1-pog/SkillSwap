const { notifyBadgeEarned } = require('./notificationService');

const BADGES = {
  first_swap: { type: 'first_swap', name: 'First Swap', description: 'Completed your first skill swap!' },
  five_swaps: { type: 'five_swaps', name: 'Skill Trader', description: 'Completed 5 skill swaps!' },
  ten_swaps: { type: 'ten_swaps', name: 'Swap Master', description: 'Completed 10 skill swaps!' },
  top_teacher: { type: 'top_teacher', name: 'Top Teacher', description: 'Received 5-star ratings on 5 sessions' },
  fast_responder: { type: 'fast_responder', name: 'Fast Responder', description: 'Accepted 3 requests within 1 hour' },
  profile_complete: { type: 'profile_complete', name: 'Profile Pro', description: 'Completed your profile 100%' },
  community_pillar: { type: 'community_pillar', name: 'Community Pillar', description: 'Referred 5 friends to SkillSwap' },
};

const checkAndAwardBadges = async (user) => {
  const earned = user.badges.map((b) => b.type);
  const newBadges = [];

  if (!earned.includes('first_swap') && user.stats.completedSwaps >= 1) {
    newBadges.push(BADGES.first_swap);
  }
  if (!earned.includes('five_swaps') && user.stats.completedSwaps >= 5) {
    newBadges.push(BADGES.five_swaps);
  }
  if (!earned.includes('ten_swaps') && user.stats.completedSwaps >= 10) {
    newBadges.push(BADGES.ten_swaps);
  }
  if (!earned.includes('profile_complete') && user.profileCompletion >= 100) {
    newBadges.push(BADGES.profile_complete);
  }
  if (!earned.includes('community_pillar') && user.referralCount >= 5) {
    newBadges.push(BADGES.community_pillar);
  }

  for (const badge of newBadges) {
    user.badges.push({ ...badge, earnedAt: new Date() });
    await notifyBadgeEarned(user._id, badge);
  }

  return newBadges;
};

module.exports = { checkAndAwardBadges, BADGES };
