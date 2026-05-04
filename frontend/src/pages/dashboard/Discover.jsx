import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { usersApi, skillsApi } from '../../services/api';
import Avatar from '../../components/ui/Avatar';
import StarRating from '../../components/ui/StarRating';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonUserCard } from '../../components/ui/SkeletonCard';
import { CATEGORY_ICONS, levelColor, truncate } from '../../utils/helpers';

const LEVELS = ['beginner', 'intermediate', 'expert'];
const LEVEL_COLORS = {
  beginner: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
  intermediate: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
  expert: 'text-brand-600 bg-brand-50 dark:bg-brand-950/40 dark:text-brand-400',
};

function UserCard({ user, onRequestSwap }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="card-hover group flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <Link to={`/profile/${user._id}`} className="flex-shrink-0">
          <Avatar user={user} size="lg" className="group-hover:ring-2 group-hover:ring-brand-400 ring-offset-2 dark:ring-offset-gray-900 transition-all duration-200" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/profile/${user._id}`}>
            <h3 className="font-bold text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors truncate leading-tight">
              {user.name}
            </h3>
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user.profile?.headline || 'SkillSwap Member'}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {user.stats?.averageRating > 0 && (
              <div className="flex items-center gap-1">
                <StarRating value={user.stats.averageRating} size="sm" />
                <span className="text-xs text-gray-400">({user.stats.totalReviews})</span>
              </div>
            )}
            {user.profile?.location && (
              <span className="text-xs text-gray-400 flex items-center gap-0.5">
                <span>📍</span> {user.profile.location}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {user.profile?.bio && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">{truncate(user.profile.bio, 90)}</p>
      )}

      {/* Skills teaching */}
      <div className="mb-3 flex-1">
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Can teach</p>
        <div className="flex flex-wrap gap-1.5">
          {(user.skillsToTeach || []).slice(0, 4).map((skill) => (
            <span key={skill.name} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-900/40">
              {CATEGORY_ICONS[skill.category] || '✨'} {skill.name}
              <span className={`px-1 rounded text-[10px] font-semibold ${LEVEL_COLORS[skill.level]}`}>{skill.level?.slice(0, 3)}</span>
            </span>
          ))}
          {(user.skillsToTeach?.length || 0) > 4 && (
            <span className="text-xs text-gray-400 dark:text-gray-500 self-center">+{user.skillsToTeach.length - 4}</span>
          )}
          {(user.skillsToTeach?.length || 0) === 0 && (
            <span className="text-xs text-gray-400 italic">No skills listed</span>
          )}
        </div>
      </div>

      {/* Skills wanting */}
      <div className="mb-5">
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Wants to learn</p>
        <div className="flex flex-wrap gap-1.5">
          {(user.skillsToLearn || []).slice(0, 3).map((skill) => (
            <span key={skill.name} className="skill-chip-learn">
              {CATEGORY_ICONS[skill.category] || '✨'} {skill.name}
            </span>
          ))}
          {(user.skillsToLearn?.length || 0) === 0 && (
            <span className="text-xs text-gray-400 italic">Nothing listed</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Link to={`/profile/${user._id}`} className="btn-secondary text-sm flex-1 justify-center py-2">
          View Profile
        </Link>
        <button
          onClick={() => onRequestSwap(user)}
          className="btn-gradient text-sm flex-1 justify-center py-2 rounded-xl"
        >
          Swap Skills
        </button>
      </div>
    </motion.div>
  );
}

export default function Discover() {
  const [params, setParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    q: params.get('q') || '',
    category: '',
    level: '',
    location: '',
  });
  const navigate = useNavigate();

  const activeFilterCount = [filters.category, filters.level, filters.location].filter(Boolean).length;

  useEffect(() => {
    skillsApi.getCategories().then(({ data }) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const { data } = await usersApi.searchUsers({ ...filters, page, limit: 12 });
        setUsers(data.users || []);
        setTotal(data.total || 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [filters, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setParams(filters.q ? { q: filters.q } : {});
  };

  const clearFilter = (key) => {
    setFilters((p) => ({ ...p, [key]: '' }));
    setPage(1);
  };

  const handleRequestSwap = (user) => {
    navigate(`/requests/new?receiverId=${user._id}`);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Discover</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Find your perfect skill-swap partner.</p>
        </div>
        {!loading && (
          <span className="hidden sm:block text-sm text-gray-400 dark:text-gray-500">
            <strong className="text-gray-700 dark:text-gray-200">{total}</strong> people
          </span>
        )}
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch}>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={filters.q}
              onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
              placeholder="Search by name, skill, or keyword…"
              className="input pl-11 py-3 text-base"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`relative flex items-center gap-2 px-4 py-3 rounded-xl border font-medium text-sm transition-all duration-200
              ${showFilters
                ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-brand-300'
              }`}
          >
            <FunnelIcon className="w-4 h-4" />
            <span className="hidden sm:block">Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button type="submit" className="btn-gradient px-5 py-3 rounded-xl text-sm font-semibold">
            Search
          </button>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 p-4 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={filters.category} onChange={(e) => { setFilters((p) => ({ ...p, category: e.target.value })); setPage(1); }}>
                    <option value="">All categories</option>
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Level</label>
                  <select className="input" value={filters.level} onChange={(e) => { setFilters((p) => ({ ...p, level: e.target.value })); setPage(1); }}>
                    <option value="">All levels</option>
                    {LEVELS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. New York"
                    className="input"
                    value={filters.location}
                    onChange={(e) => { setFilters((p) => ({ ...p, location: e.target.value })); setPage(1); }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {filters.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-medium">
                {filters.category}
                <button onClick={() => clearFilter('category')}><XMarkIcon className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {filters.level && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-medium">
                {filters.level}
                <button onClick={() => clearFilter('level')}><XMarkIcon className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {filters.location && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                📍 {filters.location}
                <button onClick={() => clearFilter('location')}><XMarkIcon className="w-3.5 h-3.5" /></button>
              </span>
            )}
          </div>
        )}
      </form>

      {/* Results */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonUserCard key={i} />)}
          </div>
        ) : users.length === 0 ? (
          <EmptyState icon="🔍" title="No users found" description="Try adjusting your search or removing filters." />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {users.map((user) => (
                  <UserCard key={user._id} user={user} onRequestSwap={handleRequestSwap} />
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
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
                  disabled={users.length < 12}
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
    </div>
  );
}
