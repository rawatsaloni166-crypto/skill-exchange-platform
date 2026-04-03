import { useState, type FormEvent } from 'react';
import { createFlag, type CreateFlagPayload } from '../api/flags';

interface FlagModalProps {
  targetType: CreateFlagPayload['targetType'];
  targetId: string;
  onClose: () => void;
}

export default function FlagModal({ targetType, targetId, onClose }: FlagModalProps) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await createFlag({ targetType, targetId, reason });
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch {
      setError('Failed to submit flag. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="flag-modal-title">
      <div className="modal">
        <div className="modal-header">
          <h2 id="flag-modal-title">Report Content</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {success ? (
          <div className="alert alert-success">Thank you for your report. We'll review it shortly.</div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-body">
            <div className="form-group">
              <label htmlFor="flag-reason">Reason for report</label>
              <textarea
                id="flag-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="Describe why you're reporting this content..."
                required
              />
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-danger" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
