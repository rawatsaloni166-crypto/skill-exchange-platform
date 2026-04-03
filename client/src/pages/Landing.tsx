import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { searchUsers, type UserSearchParams } from '../api/users';
import type { User } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import SkillTag from '../components/SkillTag';
import StarRating from '../components/StarRating';

export default function Landing() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [keyword, setKeyword] = useState('');
  const [skillOffered, setSkillOffered] = useState('');
  const [skillWanted, setSkillWanted] = useState('');
  const [location, setLocation] = useState('');

  async function fetchUsers(params: UserSearchParams = {}) {
    setLoading(true);
    setError('');
    try {
      const data = await searchUsers(params);
      setUsers(data);
    } catch {
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    fetchUsers({
      keyword: keyword.trim() || undefined,
      skillOffered: skillOffered.trim() || undefined,
      skillWanted: skillWanted.trim() || undefined,
      location: location.trim() || undefined,
    });
  }

  function handleReset() {
    setKeyword('');
    setSkillOffered('');
    setSkillWanted('');
    setLocation('');
    fetchUsers();
  }

  return (
    <main className="page page-landing">
      <section className="hero">
        <h1>Exchange Skills, Grow Together</h1>
        <p className="hero-subtitle">
          Connect with people who have skills you want. Offer what you know in return.
        </p>
        {!currentUser && (
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary btn-lg">
              Join Now — It's Free
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Sign In
            </Link>
          </div>
        )}
      </section>

      <section className="search-section">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-row">
            <input
              type="text"
              placeholder="Search by name or keyword…"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="search-input"
            />
            <input
              type="text"
              placeholder="Skill offered…"
              value={skillOffered}
              onChange={(e) => setSkillOffered(e.target.value)}
            />
            <input
              type="text"
              placeholder="Skill wanted…"
              value={skillWanted}
              onChange={(e) => setSkillWanted(e.target.value)}
            />
            <input
              type="text"
              placeholder="Location…"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="search-actions">
            <button type="submit" className="btn btn-primary">
              Search
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Reset
            </button>
          </div>
        </form>
      </section>

      <section className="users-section">
        {loading && (
          <div className="page-loading">
            <div className="spinner" />
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}
        {!loading && !error && users.length === 0 && (
          <p className="empty-state">No users found matching your criteria.</p>
        )}
        {!loading && !error && users.length > 0 && (
          <div className="users-grid">
            {users.map((user) => (
              <Link key={user._id} to={`/users/${user._id}`} className="user-card">
                <div className="user-card-avatar">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.displayName} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="user-card-body">
                  <h3 className="user-card-name">{user.displayName}</h3>
                  {user.location && (
                    <p className="user-card-location">📍 {user.location}</p>
                  )}
                  <StarRating rating={user.averageRating} />
                  <span className="user-card-review-count">({user.reviewCount} reviews)</span>

                  {user.skillsOffered.length > 0 && (
                    <div className="user-card-skills">
                      <span className="skills-label">Offers:</span>
                      <div className="skill-tags">
                        {user.skillsOffered.slice(0, 3).map((s) => (
                          <SkillTag key={s} skill={s} variant="offered" />
                        ))}
                        {user.skillsOffered.length > 3 && (
                          <span className="skill-tag-more">+{user.skillsOffered.length - 3}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {user.skillsWanted.length > 0 && (
                    <div className="user-card-skills">
                      <span className="skills-label">Wants:</span>
                      <div className="skill-tags">
                        {user.skillsWanted.slice(0, 3).map((s) => (
                          <SkillTag key={s} skill={s} variant="wanted" />
                        ))}
                        {user.skillsWanted.length > 3 && (
                          <span className="skill-tag-more">+{user.skillsWanted.length - 3}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
