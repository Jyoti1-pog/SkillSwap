const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const User = require('../models/User');
const SwapRequest = require('../models/SwapRequest');

const seedData = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap');
  console.log('Connected to MongoDB');

  await User.deleteMany({ email: { $regex: /@seed\.skillswap\.com$/ } });

  const skills = [
    { name: 'JavaScript', category: 'Programming', level: 'expert' },
    { name: 'Python', category: 'Programming', level: 'expert' },
    { name: 'React', category: 'Programming', level: 'intermediate' },
    { name: 'UI/UX Design', category: 'Design', level: 'expert' },
    { name: 'Figma', category: 'Design', level: 'expert' },
    { name: 'Guitar', category: 'Music', level: 'intermediate' },
    { name: 'Spanish', category: 'Language', level: 'expert' },
    { name: 'Photography', category: 'Photography', level: 'expert' },
    { name: 'Data Science', category: 'Programming', level: 'expert' },
    { name: 'Digital Marketing', category: 'Marketing', level: 'expert' },
  ];

  const users = [
    {
      name: 'Alex Chen',
      email: 'alex@seed.skillswap.com',
      password: 'Password123!',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      profile: { bio: 'Full-stack dev who loves teaching JS and React. Let\'s swap skills!', headline: 'Senior Frontend Engineer @ TechCorp', location: 'San Francisco, CA', timezone: 'America/Los_Angeles' },
      skillsToTeach: [{ name: 'JavaScript', category: 'Programming', level: 'expert', yearsOfExperience: 5, tags: ['ES6+', 'TypeScript', 'Node.js'] }, { name: 'React', category: 'Programming', level: 'expert', yearsOfExperience: 4 }],
      skillsToLearn: [{ name: 'Guitar', category: 'Music', priority: 'high' }, { name: 'Spanish', category: 'Language', priority: 'medium' }],
      onboardingCompleted: true,
      referralCode: 'ALEX1234',
      stats: { totalSwaps: 12, completedSwaps: 10, averageRating: 4.8, totalReviews: 9, reputationScore: 240 },
    },
    {
      name: 'Sofia Martinez',
      email: 'sofia@seed.skillswap.com',
      password: 'Password123!',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sofia',
      profile: { bio: 'UX designer with a passion for beautiful interfaces. Can also teach Spanish!', headline: 'Lead UX Designer @ DesignStudio', location: 'Barcelona, Spain', timezone: 'Europe/Madrid' },
      skillsToTeach: [{ name: 'UI/UX Design', category: 'Design', level: 'expert', yearsOfExperience: 6 }, { name: 'Spanish', category: 'Language', level: 'expert', yearsOfExperience: 15 }, { name: 'Figma', category: 'Design', level: 'expert', yearsOfExperience: 4 }],
      skillsToLearn: [{ name: 'JavaScript', category: 'Programming', priority: 'high' }, { name: 'Photography', category: 'Photography', priority: 'medium' }],
      onboardingCompleted: true,
      referralCode: 'SOFI5678',
      stats: { totalSwaps: 8, completedSwaps: 7, averageRating: 4.9, totalReviews: 7, reputationScore: 196 },
    },
    {
      name: 'Marcus Johnson',
      email: 'marcus@seed.skillswap.com',
      password: 'Password123!',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
      profile: { bio: 'Data scientist and guitar enthusiast. I teach data, you teach me tech!', headline: 'Data Scientist @ ML Labs', location: 'New York, NY', timezone: 'America/New_York' },
      skillsToTeach: [{ name: 'Python', category: 'Programming', level: 'expert', yearsOfExperience: 7 }, { name: 'Data Science', category: 'Programming', level: 'expert', yearsOfExperience: 5 }, { name: 'Guitar', category: 'Music', level: 'intermediate', yearsOfExperience: 8 }],
      skillsToLearn: [{ name: 'React', category: 'Programming', priority: 'high' }, { name: 'UI/UX Design', category: 'Design', priority: 'medium' }],
      onboardingCompleted: true,
      referralCode: 'MARC9012',
      stats: { totalSwaps: 6, completedSwaps: 5, averageRating: 4.7, totalReviews: 5, reputationScore: 149 },
    },
    {
      name: 'Yuki Tanaka',
      email: 'yuki@seed.skillswap.com',
      password: 'Password123!',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yuki',
      profile: { bio: 'Professional photographer turned digital marketer. Passionate about visual storytelling.', headline: 'Content Creator & Photographer', location: 'Tokyo, Japan', timezone: 'Asia/Tokyo' },
      skillsToTeach: [{ name: 'Photography', category: 'Photography', level: 'expert', yearsOfExperience: 8 }, { name: 'Digital Marketing', category: 'Marketing', level: 'expert', yearsOfExperience: 5 }],
      skillsToLearn: [{ name: 'Python', category: 'Programming', priority: 'high' }, { name: 'Data Science', category: 'Programming', priority: 'medium' }],
      onboardingCompleted: true,
      referralCode: 'YUKI3456',
      stats: { totalSwaps: 4, completedSwaps: 3, averageRating: 5.0, totalReviews: 3, reputationScore: 95 },
    },
    {
      name: 'Admin User',
      email: 'admin@skillswap.com',
      password: 'Admin123!',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      role: 'admin',
      profile: { bio: 'Platform administrator', headline: 'SkillSwap Admin', location: 'Remote' },
      skillsToTeach: [],
      skillsToLearn: [],
      onboardingCompleted: true,
      referralCode: 'ADMIN000',
    },
  ];

  const created = [];
  for (const userData of users) {
    const user = await User.create(userData);
    created.push(user);
    console.log(`Created user: ${user.name} (${user.email})`);
  }

  console.log('\nSeed completed! Users:');
  users.forEach(u => console.log(`  ${u.email} / ${u.password}${u.role === 'admin' ? ' [ADMIN]' : ''}`));
  await mongoose.disconnect();
};

seedData().catch(console.error);
