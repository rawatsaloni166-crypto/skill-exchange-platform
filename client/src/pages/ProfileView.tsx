import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getUserById, getUserReviews, type Review } from '../api/users';
import { createRequest } from '../api/requests';
import type { User } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import SkillTag from '../components/SkillTag';
import StarRating from '../components/StarRating';
import FlagModal from '../components/FlagModal';

export default function ProfileView() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);

  const [reqSkillOffered, setReqSkillOffered] = useState('');
  const [reqSkillWanted, setReqSkillWanted] = useState('');
  const [reqMessage, setReqMessage] = useState('');
  const [reqError, setReqError] = useState('');
  const [reqLoading, setReqLoading] = useState(false);

  const isOwnProfile = currentUser?._id === id;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getUserById(id), getUserReviews(id)])
      .then(([u, r]) => {
        setUser(u);
        setReviews(r);
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSendRequest() {
    if (!user) return;
    setReqError('');
    if (!reqSkillOffered.trim() || !reqSkillWanted.trim() || !reqMessage.trim()) {
      setReqError('All fields are required.');
      return;
    }
    setReqLoading(true);
    try {
      const req = await createRequest({
        toUserId: user._id,
        skillOffered: reqSkillOffered.trim(),
        skillWanted: reqSkillWanted.trim(),
        message: reqMessage.trim(),
      });
      navigate(`/requests/${req._id}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Failed to send request.';
      setReqError(message);
    } finally {
      setReqLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <main className="page">
        <div className="alert alert-error">{error || 'User not found.'}</div>
      </main>
    );
  }

  return (
    <main className="page page-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.displayName} />
          ) : (
            <div className="avatar-placeholder avatar-lg">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="profile-info">
          <h1>{user.displayName}</h1>
          {user.location && <p className="profile-location">📍 {user.location}</p>}
          <div className="profile-rating">
            <StarRating rating={user.averageRating} />
            <span className="review-count">{user.reviewCount} review{user.reviewCount !== 1 ? 's' : ''}</span>
          </div>
          {user.bio && <p className="profile-bio">{user.bio}</p>}

          <div className="profile-actions">
            {isOwnProfile ? (
              <Link to="/me/edit" className="btn btn-primary">
                Edit Profile
              </Link>
            ) : (
              <>
                {currentUser ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowRequestModal(true)}
                  >
                    Request Exchange
                  </button>
                ) : (
                  <Link to="/register" className="btn btn-primary">
                    Join to Request Exchange
                  </Link>
                )}
                {currentUser && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowFlagModal(true)}
                  >
                    🚩 Report
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="profile-skills">
        {user.skillsOffered.length > 0 && (
          <div className="skills-section">
            <h3>Skills Offered</h3>
            <div className="skill-tags">
              {user.skillsOffered.map((s) => (
                <SkillTag key={s} skill={s} variant="offered" />
              ))}
            </div>
          </div>
        )}
        {user.skillsWanted.length > 0 && (
          <div className="skills-section">
            <h3>Skills Wanted</h3>
            <div className="skill-tags">
              {user.skillsWanted.map((s) => (
                <SkillTag key={s} skill={s} variant="wanted" />
              ))}
            </div>
          </div>
        )}
      </div>

      <section className="profile-reviews">
        <h2>Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="empty-state">No reviews yet.</p>
        ) : (
          <ul className="review-list">
            {reviews.map((review) => (
              <li key={review._id} className="review-item">
                <div className="review-header">
                  <Link to={`/users/${review.reviewer._id}`} className="review-author">
                    {review.reviewer.displayName}
                  </Link>
                  <StarRating rating={review.rating} />
                  <time className="review-date" dateTime={review.createdAt}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </time>
                </div>
                {review.comment && <p className="review-comment">{review.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {showRequestModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="request-modal-title">
          <div className="modal">
            <div className="modal-header">
              <h2 id="request-modal-title">Request Exchange with {user.displayName}</h2>
              <button className="modal-close" onClick={() => setShowRequestModal(false)} aria-label="Close">
                ✕
              </button>
            </div>
            <div className="modal-body">
              {reqError && <div className="alert alert-error">{reqError}</div>}
              <div className="form-group">
                <label htmlFor="req-offered">Skill you offer</label>
                <input
                  id="req-offered"
                  type="text"
                  value={reqSkillOffered}
                  onChange={(e) => setReqSkillOffered(e.target.value)}
                  placeholder="e.g. Python programming"
                />
              </div>
              <div className="form-group">
                <label htmlFor="req-wanted">Skill you want</label>
                <input
                  id="req-wanted"
                  type="text"
                  value={reqSkillWanted}
                  onChange={(e) => setReqSkillWanted(e.target.value)}
                  placeholder="e.g. Graphic design"
                />
              </div>
              <div className="form-group">
                <label htmlFor="req-message">Message</label>
                <textarea
                  id="req-message"
                  value={reqMessage}
                  onChange={(e) => setReqMessage(e.target.value)}
                  rows={4}
                  placeholder="Introduce yourself and explain the exchange…"
                />
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowRequestModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSendRequest} disabled={reqLoading}>
                  {reqLoading ? 'Sending…' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFlagModal && id && (
        <FlagModal
          targetType="user"
          targetId={id}
          onClose={() => setShowFlagModal(false)}
        />
      )}
    </main>
  );
}
