import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">
          SkillSwap
        </Link>
      </div>

      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          Browse
        </NavLink>

        {currentUser && (
          <NavLink to="/inbox" className={({ isActive }) => (isActive ? 'active' : '')}>
            Inbox
          </NavLink>
        )}

        {currentUser?.role === 'admin' && (
          <NavLink to="/admin/flags" className={({ isActive }) => (isActive ? 'active' : '')}>
            Admin
          </NavLink>
        )}
      </div>

      <div className="navbar-auth">
        {currentUser ? (
          <>
            <NavLink
              to={`/users/${currentUser._id}`}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {currentUser.displayName}
            </NavLink>
            <Link to="/me/edit" className="btn btn-secondary btn-sm">
              My Profile
            </Link>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline btn-sm">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
