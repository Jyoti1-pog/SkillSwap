import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPinIcon, GlobeAltIcon, ArrowsRightLeftIcon, ChatBubbleLeftRightIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { usersApi } from '../../services/api';
import useAuthStore from '../../store/authStore';
import Avatar from '../../components/ui/Avatar';
import StarRating from '../../components/ui/StarRating';
import { SkeletonPage } from '../../components/ui/SkeletonCard';
import { CATEGORY_ICONS, levelColor, timeAgo } from '../../utils/helpers';

const LEVEL_COLORS = {
  beginner: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  intermediate: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  expert: 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400',
};

export default function UserProfile() {
  const { id } = useParams();
  const { user: me } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(false);

      try {
        // /profile/me → dedicated authenticated endpoint (no ObjectId needed)
        // /profile/:id → fetch by MongoDB id
        const { data } = id === 'me'
          ? await usersApi.getMyProfile()
          : await usersApi.getProfile(id);

        if (cancelled) return;
        setProfile(data.user);
        setReviews(data.reviews || []);
      } catch (e) {
        if (!cancelled) setError(true);
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <SkeletonPage />;
  if (error || !profile) return (
    <div className="text-center py-24">
      <div className="text-5xl mb-4">🔍</div>
      <p className="font-semibold text-gray-900 dark:text-white text-lg">User not found</p>
      <p className="text-gray-400 mt-1 text-sm">This profile may not exist or has been removed.</p>
      <button onClick={() => navigate(-1)} className="btn-secondary mt-4">Go back</button>
    </div>
  );

  const isOwn = profile._id === me?._id;
  const TABS = ['about', 'skills', `reviews (${reviews.length})`];
  const tabKey = (t) => t.split(' ')[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 lg:pb-6">

      {/* ── Profile header card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card relative overflow-hidden"
      >
        {/* Banner gradient */}
        <div className="absolute inset-x-0 top-0 h-28"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(217,70,239,0.10) 100%)' }} />
        <div className="absolute inset-x-0 top-0 h-28 bg-dots opacity-20" />

        <div className="relative flex flex-col sm:flex-row gap-5 items-start pt-4">
          <Avatar
            user={profile}
            size="2xl"
            className="ring-4 ring-white dark:ring-gray-800 shadow-lg flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{profile.name}</h1>
                {profile.profile?.headline && (
                  <p className="text-gray-500 dark:text-gray-400 mt-0.5">{profile.profile.headline}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {profile.profile?.location && (
                    <span className="flex items-center gap-1 text-sm text-gray-400">
                      <MapPinIcon className="w-4 h-4" /> {profile.profile.location}
                    </span>
                  )}
                  {profile.stats?.averageRating > 0 && (
                    <div className="flex items-center gap-1.5">
                      <StarRating value={profile.stats.averageRating} size="sm" />
                      <span className="text-sm font-bold text-amber-500">{profile.stats.averageRating.toFixed(1)}</span>
                      <span className="text-xs text-gray-400">({profile.stats.totalReviews})</span>
                    </div>
                  )}
                </div>
                {/* Social links */}
                <div className="flex items-center gap-3 mt-2">
                  {profile.profile?.website && (
                    <a href={profile.profile.website} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
                      <GlobeAltIcon className="w-3.5 h-3.5" /> Website
                    </a>
                  )}
                  {profile.profile?.github && (
                    <a href={`https://github.com/${profile.profile.github}`} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                      GitHub
                    </a>
                  )}
                  {profile.profile?.linkedin && (
                    <a href={profile.profile.linkedin} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline">
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-shrink-0">
                {isOwn ? (
                  <Link to="/settings" className="btn-secondary flex items-center gap-1.5">
                    <PencilSquareIcon className="w-4 h-4" /> Edit Profile
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => navigate(`/messages?with=${profile._id}`)}
                      className="btn-secondary flex items-center gap-1.5"
                    >
                      <ChatBubbleLeftRightIcon className="w-4 h-4" /> Message
                    </button>
                    <button
                      onClick={() => navigate(`/requests/new?receiverId=${profile._id}`)}
                      className="btn-gradient flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold"
                    >
                      <ArrowsRightLeftIcon className="w-4 h-4" /> Swap Skills
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
          {[
            { label: 'Total Swaps', value: profile.stats?.totalSwaps || 0, icon: '🔄' },
            { label: 'Completed', value: profile.stats?.completedSwaps || 0, icon: '✅' },
            { label: 'Reputation', value: profile.stats?.reputationScore || 0, icon: '⚡' },
            { label: 'Profile Views', value: profile.stats?.profileViews || 0, icon: '👁️' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="text-center">
              <div className="text-xl font-black text-gray-900 dark:text-white">{value}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{icon} {label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Badges ── */}
      {profile.badges?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Achievements</h3>
          <div className="flex flex-wrap gap-2">
            {profile.badges.map((badge) => (
              <div
                key={badge.type}
                title={badge.description}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-brand-50 to-accent-50 dark:from-brand-950/40 dark:to-accent-950/40 border border-brand-100 dark:border-brand-900/40 rounded-xl"
              >
                <span>🏅</span>
                <span className="text-xs font-semibold text-brand-700 dark:text-brand-300">{badge.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Tabs ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-5">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tabKey(tab))}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tabKey(tab)
                  ? 'bg-white dark:bg-gray-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 capitalize'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* About tab */}
        {activeTab === 'about' && (
          <div className="card space-y-5">
            {profile.profile?.bio ? (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{profile.profile.bio}</p>
            ) : (
              <p className="text-gray-400 italic text-sm">No bio provided.</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              {profile.profile?.timezone && (
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 text-sm min-w-0">🌍 Timezone</span>
                  <span className="font-medium text-sm text-gray-900 dark:text-white">{profile.profile.timezone}</span>
                </div>
              )}
              {profile.profile?.languages?.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 text-sm">🗣️ Languages</span>
                  <span className="font-medium text-sm text-gray-900 dark:text-white">{profile.profile.languages.join(', ')}</span>
                </div>
              )}
              {profile.profile?.experienceLevel && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">⭐ Level</span>
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${LEVEL_COLORS[profile.profile.experienceLevel]}`}>
                    {profile.profile.experienceLevel}
                  </span>
                </div>
              )}
              {profile.profile?.availability?.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 text-sm">📅 Available</span>
                  <div className="flex flex-wrap gap-1">
                    {profile.profile.availability.map((a) => (
                      <span key={a.day} className="text-xs px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-medium">
                        {a.day}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Skills tab */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-lg">🎓</span> Teaching Skills
              </h3>
              {(profile.skillsToTeach || []).length === 0 ? (
                <p className="text-gray-400 italic text-sm">No teaching skills listed.</p>
              ) : (
                <div className="space-y-2">
                  {profile.skillsToTeach.map((skill) => (
                    <div key={skill.name} className="flex items-center justify-between gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xl w-8 text-center">{CATEGORY_ICONS[skill.category] || '✨'}</span>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{skill.name}</p>
                          <p className="text-xs text-gray-400">{skill.category}{skill.yearsOfExperience ? ` · ${skill.yearsOfExperience}y exp` : ''}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${LEVEL_COLORS[skill.level]}`}>
                        {skill.level}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-lg">📚</span> Wants to Learn
              </h3>
              {(profile.skillsToLearn || []).length === 0 ? (
                <p className="text-gray-400 italic text-sm">No learning goals listed.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.skillsToLearn.map((skill) => (
                    <span key={skill.name} className="skill-chip-learn">
                      {CATEGORY_ICONS[skill.category]} {skill.name}
                      {skill.priority === 'high' && <span className="text-red-400 text-[10px] font-bold">HOT</span>}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reviews tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-4xl mb-3">⭐</div>
                <p className="font-semibold text-gray-900 dark:text-white">No reviews yet</p>
                <p className="text-sm text-gray-400 mt-1">Reviews appear here after completed sessions.</p>
              </div>
            ) : reviews.map((review) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar user={review.reviewer} size="sm" />
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{review.reviewer?.name}</p>
                      <p className="text-xs text-gray-400">{timeAgo(review.createdAt)}</p>
                    </div>
                  </div>
                  <StarRating value={review.ratings?.overall} size="sm" />
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{review.comment}"</p>
                )}
                {review.ratings && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                    {Object.entries(review.ratings)
                      .filter(([k]) => k !== 'overall')
                      .map(([k, v]) => (
                        <span key={k} className="text-xs text-gray-400 capitalize">
                          {k}: <strong className="text-amber-500">{v}/5</strong>
                        </span>
                      ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
