import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ShieldCheckIcon, UsersIcon, FlagIcon, ChartBarIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { adminApi } from '../../services/api';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { SkeletonPage } from '../../components/ui/SkeletonCard';
import { timeAgo, apiError } from '../../utils/helpers';

const TABS = [
  { key: 'overview', label: 'Overview', icon: ChartBarIcon },
  { key: 'users', label: 'Users', icon: UsersIcon },
  { key: 'reports', label: 'Reports', icon: FlagIcon },
];

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.07 } } },
  item: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } },
};

function StatWidget({ icon, label, value, gradient, glow }) {
  return (
    <motion.div variants={stagger.item} className="card relative overflow-hidden group hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.02) 0%, rgba(217,70,239,0.02) 100%)' }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{value?.toLocaleString()}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{label}</p>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${gradient} ${glow}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    adminApi.getStats()
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === 'users') {
      setUsersLoading(true);
      adminApi.getUsers({ search: userSearch })
        .then(({ data }) => setUsers(data.users || []))
        .catch(() => {})
        .finally(() => setUsersLoading(false));
    }
    if (tab === 'reports') {
      setReportsLoading(true);
      adminApi.getReports()
        .then(({ data }) => setReports(data.reports || []))
        .catch(() => {})
        .finally(() => setReportsLoading(false));
    }
  }, [tab, userSearch]);

  const handleBan = async (userId) => {
    try {
      await adminApi.banUser(userId, 'Violating community guidelines');
      setUsers((p) => p.map((u) => u._id === userId ? { ...u, isBanned: true } : u));
      toast.success('User banned');
    } catch (err) { toast.error(apiError(err)); }
  };

  const handleUnban = async (userId) => {
    try {
      await adminApi.unbanUser(userId);
      setUsers((p) => p.map((u) => u._id === userId ? { ...u, isBanned: false } : u));
      toast.success('User unbanned');
    } catch (err) { toast.error(apiError(err)); }
  };

  const handleResolve = async (reportId, action = null) => {
    try {
      await adminApi.resolveReport(reportId, { resolution: 'Reviewed and resolved', action });
      setReports((p) => p.map((r) => r._id === reportId ? { ...r, status: 'resolved' } : r));
      toast.success('Report resolved');
    } catch (err) { toast.error(apiError(err)); }
  };

  if (loading) return <SkeletonPage />;

  const { stats, topUsers = [], recentUsers = [] } = data || {};
  const pendingReports = stats?.pendingReports || 0;

  return (
    <div className="space-y-6 pb-20 lg:pb-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-[0_0_18px_rgba(239,68,68,0.3)]">
          <ShieldCheckIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="page-header">Admin Dashboard</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500">System-wide overview and management</p>
        </div>
        {pendingReports > 0 && (
          <span className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-sm font-semibold border border-red-200 dark:border-red-900">
            ⚠️ {pendingReports} open report{pendingReports !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                tab === t.key
                  ? 'bg-white dark:bg-gray-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
              {t.key === 'reports' && pendingReports > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{pendingReports}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Overview tab ── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <motion.div
            variants={stagger.container}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <StatWidget icon="👥" label="Total Users" value={stats?.totalUsers || 0} gradient="bg-blue-100 dark:bg-blue-950/50" glow="!shadow-[0_0_16px_rgba(59,130,246,0.25)]" />
            <StatWidget icon="✅" label="Active Users" value={stats?.activeUsers || 0} gradient="bg-emerald-100 dark:bg-emerald-950/50" glow="!shadow-[0_0_16px_rgba(16,185,129,0.25)]" />
            <StatWidget icon="🔄" label="Total Swaps" value={stats?.totalSwaps || 0} gradient="bg-brand-100 dark:bg-brand-950/50" glow="!shadow-[0_0_16px_rgba(99,102,241,0.25)]" />
            <StatWidget icon="⚠️" label="Open Reports" value={stats?.pendingReports || 0} gradient="bg-red-100 dark:bg-red-950/50" glow="!shadow-[0_0_16px_rgba(239,68,68,0.25)]" />
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div variants={stagger.item} initial="initial" animate="animate" className="card flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-xl">🆕</div>
              <div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats?.newUsers || 0}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">New users (30d)</p>
              </div>
            </motion.div>
            <motion.div variants={stagger.item} initial="initial" animate="animate" className="card flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-xl">🤝</div>
              <div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats?.newSwaps || 0}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">New swaps (30d)</p>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-lg">🏆</span> Top Users by Reputation
              </h3>
              <div className="space-y-3">
                {topUsers.length === 0 && <p className="text-sm text-gray-400">No data yet</p>}
                {topUsers.map((u, i) => (
                  <div key={u._id} className="flex items-center gap-3 py-1">
                    <span className={`w-6 text-sm font-black ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-gray-400'}`}>
                      #{i + 1}
                    </span>
                    <Avatar user={u} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{u.name}</p>
                      <p className="text-xs text-gray-400">⚡ {u.stats?.reputationScore || 0} rep · ★ {u.stats?.averageRating?.toFixed(1) || '–'}</p>
                    </div>
                    {u.badges?.length > 0 && (
                      <span className="text-xs text-gray-400">🏅 {u.badges.length}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-lg">🆕</span> Recent Signups
              </h3>
              <div className="space-y-3">
                {recentUsers.length === 0 && <p className="text-sm text-gray-400">No recent users</p>}
                {recentUsers.map((u) => (
                  <div key={u._id} className="flex items-center gap-3">
                    <Avatar user={u} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className="text-xs text-gray-400">{timeAgo(u.createdAt)}</p>
                      {u.isBanned && <Badge variant="danger">Banned</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Users tab ── */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input pl-10"
              placeholder="Search users by name or email…"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>

          {usersLoading ? (
            <div className="text-center py-12 text-gray-400">Loading users…</div>
          ) : (
            <div className="card overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {['User', 'Email', 'Status', 'Swaps', 'Joined', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3.5 font-semibold text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar user={u} size="xs" />
                          <span className="font-semibold text-gray-900 dark:text-white truncate max-w-28">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400 truncate max-w-32 text-xs">{u.email}</td>
                      <td className="py-3 px-4">
                        {u.isBanned
                          ? <Badge variant="danger">Banned</Badge>
                          : u.isActive
                            ? <Badge variant="success">Active</Badge>
                            : <Badge>Inactive</Badge>
                        }
                      </td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{u.stats?.totalSwaps || 0}</td>
                      <td className="py-3 px-4 text-gray-400 text-xs">{timeAgo(u.createdAt)}</td>
                      <td className="py-3 px-4">
                        {u.isBanned ? (
                          <button onClick={() => handleUnban(u._id)} className="text-xs font-semibold text-emerald-600 hover:underline">
                            Unban
                          </button>
                        ) : (
                          <button onClick={() => handleBan(u._id)} className="text-xs font-semibold text-red-500 hover:underline">
                            Ban
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={6} className="py-12 text-center text-gray-400">No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Reports tab ── */}
      {tab === 'reports' && (
        <div className="space-y-4">
          {reportsLoading ? (
            <div className="text-center py-12 text-gray-400">Loading reports…</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🎉</div>
              <p className="font-semibold text-gray-900 dark:text-white">No open reports!</p>
              <p className="text-sm text-gray-400 mt-1">The community is behaving well.</p>
            </div>
          ) : reports.map((report) => (
            <motion.div
              key={report._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`card border-l-4 ${report.status === 'open' ? 'border-l-red-500' : 'border-l-emerald-500'}`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <Avatar user={report.reported} size="md" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{report.reported?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Reported by: {report.reporter?.name}</p>
                    <div className="mt-1">
                      <Badge variant={report.status === 'open' ? 'warning' : 'success'}>{report.status}</Badge>
                    </div>
                  </div>
                </div>
                {report.status === 'open' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleResolve(report._id)}
                      className="btn-secondary text-sm px-3 py-1.5"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleResolve(report._id, 'ban')}
                      className="text-sm px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                    >
                      Ban User
                    </button>
                  </div>
                )}
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{report.type}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{report.description}</p>
              </div>
              <p className="text-xs text-gray-400 mt-2">{timeAgo(report.createdAt)}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
