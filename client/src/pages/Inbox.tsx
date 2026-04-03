import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getMyRequests, type Request } from '../api/requests';
import RequestCard from '../components/RequestCard';

type Tab = 'outgoing' | 'incoming';

export default function Inbox() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('outgoing');

  useEffect(() => {
    getMyRequests()
      .then(setRequests)
      .catch(() => setError('Failed to load requests.'))
      .finally(() => setLoading(false));
  }, []);

  if (!currentUser) return null;

  const outgoing = requests.filter((r) => r.fromUser._id === currentUser._id);
  const incoming = requests.filter((r) => r.toUser._id === currentUser._id);
  const displayed = activeTab === 'outgoing' ? outgoing : incoming;

  return (
    <main className="page page-inbox">
      <h1>Inbox</h1>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'outgoing' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('outgoing')}
        >
          Outgoing
          {outgoing.length > 0 && (
            <span className="tab-badge">{outgoing.length}</span>
          )}
        </button>
        <button
          className={`tab-btn ${activeTab === 'incoming' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('incoming')}
        >
          Incoming
          {incoming.length > 0 && (
            <span className="tab-badge">{incoming.length}</span>
          )}
        </button>
      </div>

      {loading && (
        <div className="page-loading">
          <div className="spinner" />
        </div>
      )}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && !error && displayed.length === 0 && (
        <p className="empty-state">
          No {activeTab} requests.{' '}
          {activeTab === 'outgoing' && (
            <a href="/">Browse users to send a request.</a>
          )}
        </p>
      )}
      {!loading && !error && displayed.length > 0 && (
        <div className="request-list">
          {displayed.map((req) => (
            <RequestCard key={req._id} request={req} currentUserId={currentUser._id} />
          ))}
        </div>
      )}
    </main>
  );
}
