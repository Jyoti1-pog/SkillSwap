import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { CalendarIcon, ClockIcon, VideoCameraIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { sessionsApi, requestsApi } from '../../services/api';
import useAuthStore from '../../store/authStore';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/SkeletonCard';
import { formatDateTime, apiError } from '../../utils/helpers';

const STATUS_VARIANTS = {
  scheduled: 'info',
  completed: 'success',
  cancelled: 'error',
  pending: 'warning',
};

const FILTERS = ['all', 'scheduled', 'completed', 'cancelled'];

function SessionCard({ session, me, onUpdateStatus }) {
  const isTeacher = session.teacher?._id === me?._id;
  const other = isTeacher ? session.learner : session.teacher;
  const isPast = new Date(session.scheduledAt) < new Date();
  const variant = STATUS_VARIANTS[session.status] || 'default';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card group hover:shadow-card-hover transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <Avatar user={other} size="md" />
          <div>
            <p className="font-bold text-gray-900 dark:text-white">{other?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium text-brand-600 dark:text-brand-400">{session.skill?.name}</span>
              {' · '}
              <span className={isTeacher ? 'text-emerald-600 dark:text-emerald-400' : 'text-accent-600 dark:text-accent-400'}>
                {isTeacher ? 'You teach' : 'You learn'}
              </span>
            </p>
          </div>
        </div>
        <Badge variant={variant}>{session.status}</Badge>
      </div>

      {/* Session meta */}
      <div className="flex flex-wrap gap-4 py-3 border-y border-gray-100 dark:border-gray-800 mb-4">
        <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <CalendarIcon className="w-4 h-4 text-brand-400" />
          {formatDateTime(session.scheduledAt)}
        </span>
        <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <ClockIcon className="w-4 h-4 text-brand-400" />
          {session.duration} min
        </span>
        <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <VideoCameraIcon className="w-4 h-4 text-brand-400" />
          {session.format}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {session.meetingLink && session.status === 'scheduled' && !isPast && (
          <a
            href={session.meetingLink}
            target="_blank" rel="noopener noreferrer"
            className="btn-gradient text-sm px-4 py-2 rounded-xl"
          >
            Join Session →
          </a>
        )}
        {session.status === 'scheduled' && isPast && (
          <button
            onClick={() => onUpdateStatus(session._id, 'completed')}
            className="btn-primary text-sm flex items-center gap-1.5"
          >
            <CheckCircleIcon className="w-4 h-4" /> Mark Complete
          </button>
        )}
        {session.status === 'scheduled' && (
          <button
            onClick={() => onUpdateStatus(session._id, 'cancelled')}
            className="btn-secondary text-sm text-red-500 dark:text-red-400 border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            Cancel
          </button>
        )}
        {session.status === 'completed' && !session[isTeacher ? 'teacherReviewed' : 'learnerReviewed'] && (
          <Link to={`/reviews/new?sessionId=${session._id}`} className="btn-gradient text-sm px-4 py-2 rounded-xl">
            ⭐ Write Review
          </Link>
        )}
      </div>
    </motion.div>
  );
}

export function NewSession() {
  const [params] = useSearchParams();
  const requestId = params.get('requestId');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    scheduledAt: '', duration: 60, format: 'video', meetingLink: '', timezone: 'UTC',
    skillName: '', skillCategory: 'Programming',
  });

  useEffect(() => {
    if (requestId) {
      requestsApi.getRequest(requestId).then(({ data }) => {
        setForm((p) => ({
          ...p,
          skillName: data.request.senderSkillOffer?.name || '',
          skillCategory: data.request.senderSkillOffer?.category || 'Programming',
        }));
      }).catch(() => {});
    }
  }, [requestId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sessionsApi.scheduleSession({
        swapRequestId: requestId,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        duration: form.duration,
        format: form.format,
        meetingLink: form.meetingLink,
        timezone: form.timezone,
        skill: { name: form.skillName, category: form.skillCategory },
      });
      toast.success('Session scheduled!');
      navigate('/sessions');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto pb-10">
      <h1 className="page-header mb-6">Schedule a Session</h1>
      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label">Date & Time</label>
          <input
            type="datetime-local"
            className="input"
            value={form.scheduledAt}
            min={new Date().toISOString().slice(0, 16)}
            onChange={(e) => setForm((p) => ({ ...p, scheduledAt: e.target.value }))}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Duration</label>
            <select className="input" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: +e.target.value }))}>
              {[30, 45, 60, 90, 120].map((d) => <option key={d} value={d}>{d} minutes</option>)}
            </select>
          </div>
          <div>
            <label className="label">Format</label>
            <select className="input" value={form.format} onChange={(e) => setForm((p) => ({ ...p, format: e.target.value }))}>
              <option value="video">Video call</option>
              <option value="audio">Audio call</option>
              <option value="text">Text chat</option>
              <option value="in-person">In person</option>
            </select>
          </div>
        </div>
        {(form.format === 'video' || form.format === 'audio') && (
          <div>
            <label className="label">Meeting link <span className="text-xs font-normal text-gray-400">(optional)</span></label>
            <input
              className="input"
              placeholder="https://meet.google.com/..."
              value={form.meetingLink}
              onChange={(e) => setForm((p) => ({ ...p, meetingLink: e.target.value }))}
            />
          </div>
        )}
        <div>
          <label className="label">Skill being taught</label>
          <input
            className="input"
            value={form.skillName}
            onChange={(e) => setForm((p) => ({ ...p, skillName: e.target.value }))}
            required
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 justify-center">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-gradient flex-1 justify-center py-2.5 rounded-xl">
            {loading ? 'Scheduling…' : 'Schedule Session'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Sessions() {
  const { user: me } = useAuthStore();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await sessionsApi.getSessions({ status: filter !== 'all' ? filter : undefined });
        setSessions(data.sessions || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [filter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await sessionsApi.updateStatus(id, { status });
      setSessions((p) => p.map((s) => s._id === id ? { ...s, status } : s));
      toast.success(`Session marked as ${status}`);
    } catch (err) { toast.error(apiError(err)); }
  };

  const counts = sessions.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-brand-500" /> Sessions
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Track your teaching and learning sessions.</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 capitalize ${
              filter === f
                ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-glow-sm'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-300 dark:hover:border-brand-700'
            }`}
          >
            {f === 'all' ? `All (${sessions.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${counts[f] || 0})`}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonList />
      ) : sessions.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No sessions yet"
          description="Accept a swap request and schedule your first session."
        />
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <SessionCard key={session._id} session={session} me={me} onUpdateStatus={handleUpdateStatus} />
          ))}
        </div>
      )}
    </div>
  );
}
