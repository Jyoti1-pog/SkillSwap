import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { matchesApi } from '../../services/api';
import Avatar from '../../components/ui/Avatar';
import StarRating from '../../components/ui/StarRating';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonUserCard } from '../../components/ui/SkeletonCard';
import { CATEGORY_ICONS } from '../../utils/helpers';

function ScoreRing({ score }) {
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#6366f1';

  return (
    <div className="relative w-20 h-20">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="5" className="text-gray-100 dark:text-gray-800" />
        <motion.circle
          cx="32" cy="32" r="28" fill="none"
          stroke={color} strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-black" style={{ color }}>{score}</span>
        <span className="text-[9px] text-gray-400 font-medium -mt-0.5">%</span>
      </div>
    </div>
  );
}

function MatchCard({ matchUser, score, reasons, onRequest, index }) {
  const scoreLabel = score >= 70 ? 'Excellent' : score >= 40 ? 'Good' : 'Fair';
  const scoreBadge = score >= 70
    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
    : score >= 40
      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900'
      : 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400 border-brand-200 dark:border-brand-900';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="card group hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {/* Score + avatar row */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${matchUser._id}`} className="flex-shrink-0">
            <Avatar user={matchUser} size="lg" className="group-hover:ring-2 group-hover:ring-brand-400 ring-offset-2 dark:ring-offset-gray-900 transition-all duration-200" />
          </Link>
          <div className="min-w-0">
            <Link to={`/profile/${matchUser._id}`}>
              <p className="font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
                {matchUser.name}
              </p>
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{matchUser.profile?.headline || 'SkillSwap Member'}</p>
            {matchUser.stats?.averageRating > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <StarRating value={matchUser.stats.averageRating} size="sm" />
                <span className="text-xs text-gray-400">({matchUser.stats.totalReviews})</span>
              </div>
            )}
          </div>
        </div>
        <ScoreRing score={score} />
      </div>

      {/* Score label */}
      <div className="mb-4">
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${scoreBadge}`}>
          <span>●</span> {scoreLabel} match
        </span>
      </div>

      {/* Match reasons */}
      {reasons.length > 0 && (
        <div className="mb-4 space-y-1.5">
          {reasons.slice(0, 3).map((reason, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center flex-shrink-0">
                <svg className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400">{reason}</span>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      <div className="flex-1 mb-5">
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Can teach you</p>
        <div className="flex flex-wrap gap-1.5">
          {(matchUser.skillsToTeach || []).slice(0, 4).map((s) => (
            <span key={s.name} className="skill-chip">{CATEGORY_ICONS[s.category]} {s.name}</span>
          ))}
          {(matchUser.skillsToTeach?.length || 0) === 0 && <span className="text-xs text-gray-400 italic">Not listed</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Link to={`/profile/${matchUser._id}`} className="btn-secondary text-sm flex-1 justify-center py-2">
          View Profile
        </Link>
        <button
          onClick={() => onRequest(matchUser)}
          className="btn-gradient text-sm flex-1 justify-center py-2 rounded-xl"
        >
          Request Swap
        </button>
      </div>
    </motion.div>
  );
}

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await matchesApi.getMatches({ page, limit: 12 });
        setMatches(data.matches || []);
        setTotal(data.total || 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  return (
    <div className="space-y-6 pb-20 lg:pb-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-header flex items-center gap-2">
            <SparklesIcon className="w-7 h-7 text-brand-500" /> Your Matches
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Personalized matches powered by our smart algorithm.
          </p>
        </div>
        {!loading && total > 0 && (
          <div className="flex-shrink-0 text-right">
            <span className="text-2xl font-black text-gradient">{total}</span>
            <p className="text-xs text-gray-400 dark:text-gray-500">matches</p>
          </div>
        )}
      </div>

      {/* Algorithm explainer */}
      {!loading && matches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-accent-50 dark:from-brand-950/30 dark:to-accent-950/30 border border-brand-100 dark:border-brand-900/40"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center flex-shrink-0">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Smart matching active</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Scores are based on skill overlap, ratings, location, and more.</p>
          </div>
        </motion.div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonUserCard key={i} />)}
        </div>
      ) : matches.length === 0 ? (
        <EmptyState
          icon="✨"
          title="No matches yet"
          description="Add teaching and learning skills to your profile to start getting matched."
          action={() => navigate('/settings')}
          actionLabel="Add Skills"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {matches.map(({ user: matchUser, score, reasons }, index) => (
                <MatchCard
                  key={matchUser._id}
                  matchUser={matchUser}
                  score={score}
                  reasons={reasons}
                  index={index}
                  onRequest={(u) => navigate(`/requests/new?receiverId=${u._id}`)}
                />
              ))}
            </AnimatePresence>
          </div>

          {total > 12 && (
            <div className="flex justify-center items-center gap-3 mt-10">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn-secondary disabled:opacity-40"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page <strong className="text-gray-900 dark:text-white">{page}</strong> of <strong className="text-gray-900 dark:text-white">{Math.ceil(total / 12)}</strong>
              </span>
              <button
                disabled={matches.length < 12}
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
