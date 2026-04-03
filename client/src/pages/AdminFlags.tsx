import { useState, useEffect } from 'react';
import { getFlags, resolveFlag, type Flag } from '../api/flags';

export default function AdminFlags() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    getFlags()
      .then(setFlags)
      .catch(() => setError('Failed to load flags.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleResolve(flagId: string) {
    setResolvingId(flagId);
    try {
      await resolveFlag(flagId);
      setFlags((prev) =>
        prev.map((f) => (f._id === flagId ? { ...f, status: 'resolved' } : f))
      );
    } catch {
      setError('Failed to resolve flag.');
    } finally {
      setResolvingId(null);
    }
  }

  const openFlags = flags.filter((f) => f.status !== 'resolved');
  const resolvedFlags = flags.filter((f) => f.status === 'resolved');

  return (
    <main className="page page-admin">
      <h1>Admin — Content Flags</h1>
      <p className="page-subtitle">
        {openFlags.length} open flag{openFlags.length !== 1 ? 's' : ''}
      </p>

      {loading && (
        <div className="page-loading">
          <div className="spinner" />
        </div>
      )}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && flags.length === 0 && (
        <p className="empty-state">No flags reported yet.</p>
      )}

      {!loading && flags.length > 0 && (
        <>
          {openFlags.length > 0 && (
            <section className="flags-section">
              <h2>Open</h2>
              <div className="table-wrapper">
                <table className="flags-table">
                  <thead>
                    <tr>
                      <th>Reporter</th>
                      <th>Type</th>
                      <th>Target ID</th>
                      <th>Reason</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openFlags.map((flag) => (
                      <tr key={flag._id}>
                        <td>{flag.reporter.displayName}</td>
                        <td>
                          <span className="badge badge-default">{flag.targetType}</span>
                        </td>
                        <td>
                          <code className="code-id">{flag.targetId}</code>
                        </td>
                        <td className="flag-reason">{flag.reason}</td>
                        <td>
                          <time dateTime={flag.createdAt}>
                            {new Date(flag.createdAt).toLocaleDateString()}
                          </time>
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleResolve(flag._id)}
                            disabled={resolvingId === flag._id}
                          >
                            {resolvingId === flag._id ? 'Resolving…' : 'Resolve'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {resolvedFlags.length > 0 && (
            <section className="flags-section">
              <h2>Resolved</h2>
              <div className="table-wrapper">
                <table className="flags-table flags-table-resolved">
                  <thead>
                    <tr>
                      <th>Reporter</th>
                      <th>Type</th>
                      <th>Target ID</th>
                      <th>Reason</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resolvedFlags.map((flag) => (
                      <tr key={flag._id}>
                        <td>{flag.reporter.displayName}</td>
                        <td>
                          <span className="badge badge-default">{flag.targetType}</span>
                        </td>
                        <td>
                          <code className="code-id">{flag.targetId}</code>
                        </td>
                        <td className="flag-reason">{flag.reason}</td>
                        <td>
                          <time dateTime={flag.createdAt}>
                            {new Date(flag.createdAt).toLocaleDateString()}
                          </time>
                        </td>
                        <td>
                          <span className="badge badge-completed">Resolved</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
