import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { StarIcon } from '@heroicons/react/24/outline';
import { reviewsApi, sessionsApi } from '../../services/api';
import useAuthStore from '../../store/authStore';
import Avatar from '../../components/ui/Avatar';
import StarRating from '../../components/ui/StarRating';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/SkeletonCard';
import { timeAgo, apiError } from '../../utils/helpers';

const RATING_LABELS = ['overall', 'communication', 'expertise', 'punctuality', 'helpfulness'];

const RATING_ICONS = {
  overall: '⭐',
  communication: '💬',
  expertise: '🎯',
  punctuality: '⏰',
  helpfulness: '🤝',
};

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110"
        >
          <svg className={`w-7 h-7 transition-colors ${n <= (hover || value) ? 'text-amber-400' : 'text-gray-200 dark:text-gray-700'}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export function NewReview() {
  const [params] = useSearchParams();
  const sessionId = params.get('sessionId');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const { user: me } = useAuthStore();
  const [ratings, setRatings] = useState({ overall: 5, communication: 5, expertise: 5, punctuality: 5, helpfulness: 5 });
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (sessionId) {
      sessionsApi.getSession(sessionId).then(({ data }) => setSession(data.session)).catch(() => {});
    }
  }, [sessionId]);

  const reviewee = session ? (session.teacher?._id === me?._id ? session.learner : session.teacher) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await reviewsApi.createReview({ sessionId, ratings, comment });
      toast.success('Review submitted! Thank you.');
      navigate('/sessions');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto pb-10">
      <h1 className="page-header mb-2">Write a Review</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Share your honest feedback to help the community.</p>

      {reviewee && (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-accent-50 dark:from-brand-950/30 dark:to-accent-950/30 border border-brand-100 dark:border-brand-900/40 mb-6">
          <Avatar user={reviewee} size="md" />
          <div>
            <p className="font-bold text-gray-900 dark:text-white">{reviewee?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{session.skill?.name}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        {RATING_LABELS.map((key) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{RATING_ICONS[key]}</span>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">{key}</label>
            </div>
            <StarPicker value={ratings[key]} onChange={(v) => setRatings((p) => ({ ...p, [key]: v }))} />
          </div>
        ))}

        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          <label className="label">Your experience <span className="font-normal text-gray-400">(optional)</span></label>
          <textarea
            className="input resize-none"
            rows={4}
            placeholder="What did you enjoy? What could be improved?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 justify-center">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-gradient flex-1 justify-center py-2.5 rounded-xl">
            {loading ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Reviews() {
  const { user: me } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!me?._id) return;
    reviewsApi.getUserReviews(me._id)
      .then(({ data }) => setReviews(data.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [me?._id]);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.ratings.overall, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-header flex items-center gap-2">
            <StarIcon className="w-7 h-7 text-amber-400" /> My Reviews
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Feedback you've received from skill exchange partners.
          </p>
        </div>
        {avgRating && (
          <div className="text-right flex-shrink-0">
            <span className="text-3xl font-black text-amber-500">{avgRating}</span>
            <p className="text-xs text-gray-400">avg rating</p>
          </div>
        )}
      </div>

      {loading ? (
        <SkeletonList />
      ) : reviews.length === 0 ? (
        <EmptyState
          icon="⭐"
          title="No reviews yet"
          description="Complete skill sessions to start receiving feedback."
          action={() => navigate('/sessions')}
          actionLabel="View Sessions"
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review, i) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
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
                <StarRating value={review.ratings.overall} size="sm" />
              </div>

              {review.comment && (
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4 italic">"{review.comment}"</p>
              )}

              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {Object.entries(review.ratings)
                  .filter(([k]) => k !== 'overall')
                  .map(([k, v]) => (
                    <span key={k} className="text-xs text-gray-400 dark:text-gray-500 capitalize flex items-center gap-1">
                      {RATING_ICONS[k]} {k}: <strong className="text-amber-500">{v}/5</strong>
                    </span>
                  ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
