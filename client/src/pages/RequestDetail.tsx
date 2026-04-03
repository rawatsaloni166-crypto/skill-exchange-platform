import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRequestById, updateRequestStatus, type Request } from '../api/requests';
import { getMessages, sendMessage, type Message } from '../api/messages';
import { createReview } from '../api/reviews';
import { useAuth } from '../hooks/useAuth';
import MessageList from '../components/MessageList';
import FlagModal from '../components/FlagModal';

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();

  const [request, setRequest] = useState<Request | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [msgBody, setMsgBody] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgError, setMsgError] = useState('');

  const [statusError, setStatusError] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewDone, setReviewDone] = useState(false);

  const [showFlagModal, setShowFlagModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getRequestById(id), getMessages(id)])
      .then(([req, msgs]) => {
        setRequest(req);
        setMessages(msgs);
      })
      .catch(() => setError('Failed to load request.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleStatusChange(newStatus: 'accepted' | 'declined' | 'cancelled' | 'completed') {
    if (!id) return;
    setStatusError('');
    setStatusLoading(true);
    try {
      const updated = await updateRequestStatus(id, newStatus);
      setRequest(updated);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Failed to update status.';
      setStatusError(message);
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleSendMessage(e: FormEvent) {
    e.preventDefault();
    if (!id || !msgBody.trim()) return;
    setSendingMsg(true);
    setMsgError('');
    try {
      const newMsg = await sendMessage(id, msgBody.trim());
      setMessages((prev) => [...prev, newMsg]);
      setMsgBody('');
    } catch {
      setMsgError('Failed to send message.');
    } finally {
      setSendingMsg(false);
    }
  }

  async function handleReviewSubmit(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    setReviewError('');
    setReviewLoading(true);
    try {
      await createReview({ requestId: id, rating: reviewRating, comment: reviewComment });
      setReviewDone(true);
      setShowReviewForm(false);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Failed to submit review.';
      setReviewError(message);
    } finally {
      setReviewLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (error || !request || !currentUser) {
    return (
      <main className="page">
        <div className="alert alert-error">{error || 'Request not found.'}</div>
      </main>
    );
  }

  const isFromUser = request.fromUser._id === currentUser._id;
  const isToUser = request.toUser._id === currentUser._id;
  const otherUser = isFromUser ? request.toUser : request.fromUser;

  const STATUS_LABELS: Record<Request['status'], string> = {
    pending: 'Pending',
    accepted: 'Accepted',
    declined: 'Declined',
    cancelled: 'Cancelled',
    completed: 'Completed',
  };

  return (
    <main className="page page-request-detail">
      <div className="request-detail-header">
        <div className="request-detail-info">
          <h1>Exchange Request</h1>
          <span className={`badge badge-${request.status}`}>
            {STATUS_LABELS[request.status]}
          </span>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => setShowFlagModal(true)}>
          🚩 Report
        </button>
      </div>

      <div className="request-detail-card card">
        <div className="request-participants">
          <div className="participant">
            <Link to={`/users/${request.fromUser._id}`}>{request.fromUser.displayName}</Link>
            <span className="participant-label">Sender</span>
          </div>
          <div className="exchange-arrow">↔</div>
          <div className="participant">
            <Link to={`/users/${request.toUser._id}`}>{request.toUser.displayName}</Link>
            <span className="participant-label">Recipient</span>
          </div>
        </div>

        <div className="request-skills-detail">
          <div className="skill-detail-item">
            <span className="skill-detail-label">Skill Offered</span>
            <strong>{request.skillOffered}</strong>
          </div>
          <div className="skill-detail-item">
            <span className="skill-detail-label">Skill Wanted</span>
            <strong>{request.skillWanted}</strong>
          </div>
        </div>

        {request.message && (
          <div className="request-initial-message">
            <p className="field-label">Initial Message</p>
            <p>{request.message}</p>
          </div>
        )}

        {statusError && <div className="alert alert-error">{statusError}</div>}

        <div className="request-actions">
          {request.status === 'pending' && isToUser && (
            <>
              <button
                className="btn btn-primary"
                onClick={() => handleStatusChange('accepted')}
                disabled={statusLoading}
              >
                Accept
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleStatusChange('declined')}
                disabled={statusLoading}
              >
                Decline
              </button>
            </>
          )}
          {request.status === 'pending' && isFromUser && (
            <button
              className="btn btn-secondary"
              onClick={() => handleStatusChange('cancelled')}
              disabled={statusLoading}
            >
              Cancel Request
            </button>
          )}
          {request.status === 'accepted' && (isFromUser || isToUser) && (
            <button
              className="btn btn-primary"
              onClick={() => handleStatusChange('completed')}
              disabled={statusLoading}
            >
              Mark as Completed
            </button>
          )}
          {request.status === 'completed' && !reviewDone && (
            <button className="btn btn-secondary" onClick={() => setShowReviewForm(true)}>
              Leave a Review for {otherUser.displayName}
            </button>
          )}
          {reviewDone && (
            <div className="alert alert-success">Review submitted! Thank you.</div>
          )}
        </div>

        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} className="review-form">
            <h3>Review {otherUser.displayName}</h3>
            {reviewError && <div className="alert alert-error">{reviewError}</div>}
            <div className="form-group">
              <label htmlFor="review-rating">Rating</label>
              <div className="star-picker">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-pick ${star <= reviewRating ? 'star-pick-active' : ''}`}
                    onClick={() => setReviewRating(star)}
                    aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="review-comment">Comment (optional)</label>
              <textarea
                id="review-comment"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                placeholder="Share your experience…"
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowReviewForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={reviewLoading}>
                {reviewLoading ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>

      <section className="messages-section">
        <h2>Messages</h2>
        <div className="messages-container">
          <MessageList messages={messages} currentUserId={currentUser._id} />
          <div ref={messagesEndRef} />
        </div>

        {(request.status === 'pending' || request.status === 'accepted') && (
          <form onSubmit={handleSendMessage} className="message-form">
            {msgError && <div className="alert alert-error">{msgError}</div>}
            <div className="message-input-row">
              <textarea
                value={msgBody}
                onChange={(e) => setMsgBody(e.target.value)}
                rows={2}
                placeholder="Write a message…"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (msgBody.trim()) handleSendMessage(e as unknown as FormEvent);
                  }
                }}
              />
              <button type="submit" className="btn btn-primary" disabled={sendingMsg || !msgBody.trim()}>
                {sendingMsg ? '…' : 'Send'}
              </button>
            </div>
            <small className="form-hint">Press Enter to send, Shift+Enter for new line</small>
          </form>
        )}
      </section>

      {showFlagModal && id && (
        <FlagModal
          targetType="request"
          targetId={id}
          onClose={() => setShowFlagModal(false)}
        />
      )}
    </main>
  );
}
