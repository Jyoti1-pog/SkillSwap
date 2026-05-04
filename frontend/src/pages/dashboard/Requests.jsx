import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { requestsApi, usersApi, skillsApi } from '../../services/api';
import useAuthStore from '../../store/authStore';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/SkeletonCard';
import { statusColor, timeAgo, apiError, CATEGORY_ICONS } from '../../utils/helpers';

function RequestCard({ req, onAccept, onReject, onCancel, meId }) {
  const isSender = req.sender?._id === meId;
  const other = isSender ? req.receiver : req.sender;

  return (
    <Link to={`/requests/${req._id}`} className="card-hover block">
      <div className="flex items-center gap-4">
        <Avatar user={other} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900 dark:text-white">{other?.name}</p>
            <span className={`badge ${statusColor[req.status]}`}>{req.status}</span>
          </div>
          <p className="text-sm text-muted truncate">
            {isSender ? 'You offer' : 'They offer'}: {req.senderSkillOffer?.name} →{' '}
            {isSender ? 'You want' : 'They want'}: {req.receiverSkillWanted?.name}
          </p>
          <p className="text-xs text-muted mt-0.5">{timeAgo(req.createdAt)}</p>
        </div>
        {req.matchScore > 0 && (
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold text-brand-600">{req.matchScore}%</p>
            <p className="text-xs text-muted">match</p>
          </div>
        )}
      </div>
    </Link>
  );
}

export function NewSwapRequest() {
  const [params] = useSearchParams();
  const receiverId = params.get('receiverId');
  const navigate = useNavigate();
  const [receiver, setReceiver] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const { user: me } = useAuthStore();
  const [form, setForm] = useState({
    senderSkillName: me?.skillsToTeach?.[0]?.name || '',
    senderSkillCategory: me?.skillsToTeach?.[0]?.category || 'Programming',
    receiverSkillName: '',
    receiverSkillCategory: 'Programming',
    message: '',
  });

  useEffect(() => {
    if (receiverId) usersApi.getProfile(receiverId).then(({ data }) => setReceiver(data.user));
    skillsApi.getCategories().then(({ data }) => setCategories(data.categories || []));
  }, [receiverId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestsApi.sendRequest({
        receiverId,
        senderSkillOffer: { name: form.senderSkillName, category: form.senderSkillCategory },
        receiverSkillWanted: { name: form.receiverSkillName, category: form.receiverSkillCategory },
        message: form.message,
      });
      toast.success('Swap request sent!');
      navigate('/requests');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="page-header mb-6">Send Swap Request</h1>
      {receiver && (
        <div className="card mb-6 flex items-center gap-4">
          <Avatar user={receiver} size="lg" />
          <div>
            <p className="font-bold">{receiver.name}</p>
            <p className="text-sm text-muted">{receiver.profile?.headline}</p>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label">What skill will YOU teach?</label>
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="e.g. JavaScript" value={form.senderSkillName}
              onChange={(e) => setForm((p) => ({ ...p, senderSkillName: e.target.value }))} required />
            <select className="input" value={form.senderSkillCategory}
              onChange={(e) => setForm((p) => ({ ...p, senderSkillCategory: e.target.value }))}>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          {me?.skillsToTeach?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {me.skillsToTeach.map((s) => (
                <button key={s.name} type="button" onClick={() => setForm((p) => ({ ...p, senderSkillName: s.name, senderSkillCategory: s.category }))}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${form.senderSkillName === s.name ? 'bg-brand-500 text-white border-brand-500' : 'border-gray-200 dark:border-gray-700 hover:border-brand-400'}`}>
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="label">What skill do you want to LEARN from them?</label>
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="e.g. Guitar" value={form.receiverSkillName}
              onChange={(e) => setForm((p) => ({ ...p, receiverSkillName: e.target.value }))} required />
            <select className="input" value={form.receiverSkillCategory}
              onChange={(e) => setForm((p) => ({ ...p, receiverSkillCategory: e.target.value }))}>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          {receiver?.skillsToTeach?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {receiver.skillsToTeach.map((s) => (
                <button key={s.name} type="button" onClick={() => setForm((p) => ({ ...p, receiverSkillName: s.name, receiverSkillCategory: s.category }))}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${form.receiverSkillName === s.name ? 'bg-accent-500 text-white border-accent-500' : 'border-gray-200 dark:border-gray-700 hover:border-accent-400'}`}>
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="label">Message (optional)</label>
          <textarea className="input resize-none" rows={3} placeholder="Tell them why you'd be a great swap partner..."
            value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} />
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={loading} className="flex-1">Send Request</Button>
        </div>
      </form>
    </div>
  );
}

export function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: me } = useAuthStore();
  const [req, setReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    requestsApi.getRequest(id).then(({ data }) => { setReq(data.request); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <SkeletonList />;
  if (!req) return <div className="text-muted text-center py-20">Request not found</div>;

  const isSender = req.sender?._id === me?._id;
  const other = isSender ? req.receiver : req.sender;

  const handleAction = async (action, reason = null) => {
    setActionLoading(true);
    try {
      if (action === 'accept') { await requestsApi.acceptRequest(id); toast.success('Request accepted!'); }
      else if (action === 'reject') { await requestsApi.rejectRequest(id, reason); toast.success('Request declined'); }
      else if (action === 'cancel') { await requestsApi.cancelRequest(id, reason); toast.success('Request cancelled'); }
      navigate('/requests');
    } catch (err) { toast.error(apiError(err)); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => navigate('/requests')}>← Back</Button>
        <h1 className="page-header">Swap Request</h1>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <Avatar user={other} size="xl" />
          <div>
            <p className="font-bold text-lg">{other?.name}</p>
            <p className="text-muted text-sm">{other?.profile?.headline}</p>
            <span className={`badge mt-1 ${statusColor[req.status]}`}>{req.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-brand-50 dark:bg-brand-950/50 rounded-xl p-4">
            <p className="text-xs text-muted uppercase font-semibold mb-1">Offering</p>
            <p className="font-bold text-brand-700 dark:text-brand-300">{req.senderSkillOffer?.name}</p>
            <p className="text-xs text-muted">{req.senderSkillOffer?.category}</p>
          </div>
          <div className="bg-accent-50 dark:bg-pink-950/50 rounded-xl p-4">
            <p className="text-xs text-muted uppercase font-semibold mb-1">Wanting</p>
            <p className="font-bold text-accent-700 dark:text-pink-300">{req.receiverSkillWanted?.name}</p>
            <p className="text-xs text-muted">{req.receiverSkillWanted?.category}</p>
          </div>
        </div>

        {req.message && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <p className="text-sm font-semibold mb-1">Message</p>
            <p className="text-sm text-muted">{req.message}</p>
          </div>
        )}

        {req.matchScore > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-brand-50 to-accent-50 dark:from-brand-950/50 dark:to-pink-950/50 rounded-xl">
            <p className="text-sm font-semibold mb-2">Match Analysis: {req.matchScore}%</p>
            <div className="space-y-1">
              {(req.matchReasons || []).map((r, i) => (
                <p key={i} className="text-sm text-muted flex items-center gap-2"><span className="text-green-500">✓</span> {r}</p>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          {req.status === 'pending' && !isSender && (
            <>
              <Button onClick={() => handleAction('accept')} loading={actionLoading} className="flex-1">Accept</Button>
              <Button variant="danger" onClick={() => handleAction('reject')} loading={actionLoading}>Decline</Button>
            </>
          )}
          {req.status === 'pending' && isSender && (
            <Button variant="danger" onClick={() => handleAction('cancel')} loading={actionLoading}>Cancel Request</Button>
          )}
          {req.status === 'accepted' && req.conversation && (
            <Link to={`/messages/${req.conversation}`} className="btn-primary flex-1 text-center">Open Chat</Link>
          )}
          {req.status === 'accepted' && (
            <Link to={`/sessions/new?requestId=${req._id}`} className="btn-secondary flex-1 text-center">Schedule Session</Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Requests() {
  const { user: me } = useAuthStore();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await requestsApi.getRequests({ type: filter === 'sent' ? 'sent' : filter === 'received' ? 'received' : 'all' });
        setRequests(data.requests || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [filter]);

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="page-header">Swap Requests</h1>
        <Link to="/discover" className="btn-primary text-sm">New Request</Link>
      </div>

      <div className="flex gap-2">
        {['all', 'received', 'sent'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-muted hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? <SkeletonList /> : requests.length === 0 ? (
        <EmptyState icon="🔄" title="No requests yet" description="Discover people to swap skills with." action={() => navigate('/discover')} actionLabel="Discover People" />
      ) : (
        <div className="space-y-3">
          {requests.map((req) => <RequestCard key={req._id} req={req} meId={me?._id} />)}
        </div>
      )}
    </div>
  );
}
