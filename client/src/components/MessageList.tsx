import type { Message } from '../api/messages';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export default function MessageList({ messages, currentUserId }: MessageListProps) {
  if (messages.length === 0) {
    return <p className="empty-state">No messages yet. Start the conversation!</p>;
  }

  return (
    <ul className="message-list">
      {messages.map((msg) => {
        const isMine = msg.sender._id === currentUserId;
        return (
          <li key={msg._id} className={`message-item ${isMine ? 'message-mine' : 'message-theirs'}`}>
            <div className="message-meta">
              <span className="message-sender">{isMine ? 'You' : msg.sender.displayName}</span>
              <time className="message-time" dateTime={msg.createdAt}>
                {new Date(msg.createdAt).toLocaleString()}
              </time>
            </div>
            <div className="message-bubble">
              <p>{msg.body}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
