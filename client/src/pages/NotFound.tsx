import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="page page-not-found">
      <div className="not-found-content">
        <h1 className="not-found-code">404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn btn-primary">
          Back to Browse
        </Link>
      </div>
    </main>
  );
}
