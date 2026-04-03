import { Link } from 'react-router-dom';
import type { Request } from '../api/requests';
import type { User } from '../api/auth';

interface RequestCardProps {
  request: Request;
  currentUserId: string;
}

const STATUS_LABELS: Record<Request['status'], string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

function getOtherUser(request: Request, currentUserId: string): User {
  return request.fromUser._id === currentUserId ? request.toUser : request.fromUser;
}

export default function RequestCard({ request, currentUserId }: RequestCardProps) {
  const otherUser = getOtherUser(request, currentUserId);
  const isFrom = request.fromUser._id === currentUserId;

  return (
    <Link to={`/requests/${request._id}`} className="request-card">
      <div className="request-card-header">
        <span className="request-card-user">{otherUser.displayName}</span>
        <span className={`badge badge-${request.status}`}>{STATUS_LABELS[request.status]}</span>
      </div>
      <div className="request-card-skills">
        <span className="skill-exchange-label">
          {isFrom ? 'You offer' : 'They offer'}:{' '}
          <strong>{isFrom ? request.skillOffered : request.skillWanted}</strong>
        </span>
        <span className="skill-exchange-arrow">↔</span>
        <span className="skill-exchange-label">
          {isFrom ? 'You want' : 'They want'}:{' '}
          <strong>{isFrom ? request.skillWanted : request.skillOffered}</strong>
        </span>
      </div>
      <p className="request-card-message">{request.message}</p>
      <time className="request-card-date" dateTime={request.createdAt}>
        {new Date(request.createdAt).toLocaleDateString()}
      </time>
    </Link>
  );
}
