import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, SparklesIcon, ArrowsRightLeftIcon, StarIcon } from '@heroicons/react/24/outline';
import useAuthStore from '../../store/authStore';
import { usersApi, matchesApi, requestsApi, notificationsApi } from '../../services/api';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { SkeletonPage } from '../../components/ui/SkeletonCard';
import { timeAgo, CATEGORY_ICONS } from '../../utils/helpers';

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.08 } } },
  item: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } },
};

function StatCard({ icon, label, value, color, delay = 0 }) {
  const gradients = {
    brand: 'from-brand-500 to-brand-600',
    accent: 'from-accent-500 to-accent-600',
    green: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
  };
  const glows = {
    brand: 'shadow-glow-sm',
    accent: '!shadow-[0_0_18px_rgba(217,70,239,0.3)]',
    green: '!shadow-[0_0_18px_rgba(16,185,129,0.3)]',
    purple: '!shadow-[0_0_18px_rgba(147,51,234,0.3)]',
  };
  return (
    <motion.div
      variants={stagger.item}
      className="card relative overflow-hidden group hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/40 dark:to-gray-800/20 pointer-events-none" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{label}</p>
        </div>
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradients[color]} ${glows[color]} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

function MatchScoreRing({ score }) {
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#6366f1';
  return (
    <div className="relative w-10 h-10">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-100 dark:text-gray-800" />
        <circle
          cx="18" cy="18" r="15" fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={`${score * 0.942} 94.2`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-gray-700 dark:text-gray-300">
        {score}
      </span>
    </div>
  );
}

function ProfileProgress({ completion }) {
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Profile strength</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Better profile = better matches</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-gradient">{completion}%</span>
        </div>
      </div>
      <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #6366f1, #d946ef)' }}
          initial={{ width: 0 }}
          animate={{ width: `${completion}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      {completion < 100 && (
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">{100 - completion}% remaining</p>
          <Link to="/settings" className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline">Complete now →</Link>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, matchRes, reqRes, notifRes] = await Promise.all([
          usersApi.getMyStats(),
          matchesApi.getMatches({ limit: 4 }),
          requestsApi.getRequests({ type: 'received', status: 'pending', limit: 5 }),
          notificationsApi.getNotifications({ limit: 5 }),
        ]);
        setStats(statsRes.data);
        setMatches(matchRes.data.matches || []);
        setRequests(reqRes.data.requests || []);
        setNotifications(notifRes.data.notifications || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <SkeletonPage />;

  const completion = stats?.profileCompletion || 0;
  const s = stats?.stats || {};

  return (
    <div className="space-y-8 pb-20 lg:pb-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {greeting}, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Here's your skill exchange overview.</p>
        </motion.div>
        <Link to="/discover" className="btn-gradient flex-shrink-0 hidden sm:flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl">
          <SparklesIcon className="w-4 h-4" /> Discover
        </Link>
      </div>

      {/* ── Stat cards ── */}
      <motion.div
        variants={stagger.container}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard icon={<ArrowsRightLeftIcon className="w-6 h-6 text-white" />} label="Total Swaps" value={s.totalSwaps || 0} color="brand" />
        <StatCard
          icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          label="Completed" value={s.completedSwaps || 0} color="green"
        />
        <StatCard icon={<StarIcon className="w-6 h-6 text-white" />} label="Avg Rating" value={s.averageRating ? `${s.averageRating.toFixed(1)}★` : '–'} color="accent" />
        <StatCard
          icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          label="Reputation" value={s.reputationScore || 0} color="purple"
        />
      </motion.div>

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: matches + requests */}
        <div className="lg:col-span-2 space-y-6">

          {/* Top matches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            className="card"
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="section-title flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center">
                  <SparklesIcon className="w-4 h-4 text-brand-500" />
                </span>
                Top Matches
              </h2>
              <Link to="/matches" className="text-sm text-brand-600 dark:text-brand-400 font-medium flex items-center gap-1 hover:gap-2 transition-all">
                View all <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {matches.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="w-8 h-8 text-brand-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">Add skills to start getting matched!</p>
                <Link to="/settings" className="btn-primary text-sm">Add Skills</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {matches.slice(0, 4).map(({ user: matchUser, score, reasons }) => (
                  <Link
                    key={matchUser._id}
                    to={`/profile/${matchUser._id}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors group"
                  >
                    <Avatar user={matchUser} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {matchUser.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{reasons[0] || 'Skill match'}</p>
                    </div>
                    <MatchScoreRing score={score} />
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          {/* Pending requests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
            className="card"
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="section-title flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-accent-50 dark:bg-accent-950/40 flex items-center justify-center">
                  <ArrowsRightLeftIcon className="w-4 h-4 text-accent-500" />
                </span>
                Pending Requests
                {requests.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-accent-100 dark:bg-accent-950 text-accent-600 dark:text-accent-400 text-xs font-bold">
                    {requests.length}
                  </span>
                )}
              </h2>
              <Link to="/requests" className="text-sm text-brand-600 dark:text-brand-400 font-medium flex items-center gap-1 hover:gap-2 transition-all">
                View all <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 text-sm">No pending swap requests</p>
              </div>
            ) : (
              <div className="space-y-2">
                {requests.map((req) => (
                  <Link
                    key={req._id}
                    to={`/requests/${req._id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                  >
                    <Avatar user={req.sender} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{req.sender?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        Offers <strong className="text-brand-600 dark:text-brand-400">{req.senderSkillOffer?.name}</strong>
                        {' · '} wants <strong className="text-accent-600 dark:text-accent-400">{req.receiverSkillWanted?.name}</strong>
                      </p>
                    </div>
                    <Badge variant="warning" dot>Pending</Badge>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
            <ProfileProgress completion={completion} />
          </motion.div>

          {/* Skills summary */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Your Skills</h3>
              <Link to="/settings" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">Edit</Link>
            </div>
            <div className="mb-4">
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mb-2">Teaching</p>
              <div className="flex flex-wrap gap-1.5">
                {(stats?.skillsToTeach || []).slice(0, 4).map((skill) => (
                  <span key={skill.name} className="skill-chip">{CATEGORY_ICONS[skill.category]} {skill.name}</span>
                ))}
                {(stats?.skillsToTeach?.length || 0) === 0 && (
                  <Link to="/settings" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">+ Add teaching skills</Link>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mb-2">Learning</p>
              <div className="flex flex-wrap gap-1.5">
                {(stats?.skillsToLearn || []).slice(0, 4).map((skill) => (
                  <span key={skill.name} className="skill-chip-learn">{CATEGORY_ICONS[skill.category]} {skill.name}</span>
                ))}
                {(stats?.skillsToLearn?.length || 0) === 0 && (
                  <Link to="/settings" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">+ Add learning goals</Link>
                )}
              </div>
            </div>
          </motion.div>

          {/* Badges */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.25 }} className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Achievements</h3>
            {(stats?.badges || []).length === 0 ? (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">🏅</div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Complete swaps to earn badges</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {stats.badges.map((badge) => (
                  <div key={badge.type} title={badge.description}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-50 to-accent-50 dark:from-brand-950/40 dark:to-accent-950/40 border border-brand-100 dark:border-brand-900/40">
                    <span>🏅</span>
                    <span className="text-xs font-semibold text-brand-700 dark:text-brand-300">{badge.name}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent activity */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
              <Link to="/notifications" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">See all</Link>
            </div>
            {notifications.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm py-2">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notif) => (
                  <div key={notif._id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.isRead ? 'bg-gray-300 dark:bg-gray-600' : 'bg-brand-500'}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-white leading-snug">{notif.title}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{timeAgo(notif.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
