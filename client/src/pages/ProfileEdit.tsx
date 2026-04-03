import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../api/auth';
import { updateMyProfile } from '../api/users';
import { useAuth } from '../hooks/useAuth';

export default function ProfileEdit() {
  const { setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [skillsOffered, setSkillsOffered] = useState('');
  const [skillsWanted, setSkillsWanted] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getMe()
      .then((user) => {
        setDisplayName(user.displayName);
        setBio(user.bio ?? '');
        setLocation(user.location ?? '');
        setAvatarUrl(user.avatarUrl ?? '');
        setSkillsOffered(user.skillsOffered.join(', '));
        setSkillsWanted(user.skillsWanted.join(', '));
      })
      .catch(() => setError('Failed to load your profile.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!displayName.trim()) {
      setError('Display name is required.');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateMyProfile({
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        skillsOffered: skillsOffered
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        skillsWanted: skillsWanted
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setCurrentUser(updated);
      setSuccess(true);
      setTimeout(() => navigate(`/users/${updated._id}`), 1000);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Failed to save profile.';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <main className="page page-profile-edit">
      <div className="form-card">
        <h1>Edit Profile</h1>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">Profile saved!</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="displayName">Display Name *</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Tell others about yourself…"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
            />
          </div>

          <div className="form-group">
            <label htmlFor="avatarUrl">Avatar URL</label>
            <input
              id="avatarUrl"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://…"
            />
            {avatarUrl && /^https?:\/\//.test(avatarUrl) && (
              <img src={avatarUrl} alt="Avatar preview" className="avatar-preview" />
            )}
          </div>

          <div className="form-group">
            <label htmlFor="skillsOffered">Skills I Offer</label>
            <input
              id="skillsOffered"
              type="text"
              value={skillsOffered}
              onChange={(e) => setSkillsOffered(e.target.value)}
              placeholder="Python, Guitar, Photography (comma-separated)"
            />
            <small className="form-hint">Separate skills with commas</small>
          </div>

          <div className="form-group">
            <label htmlFor="skillsWanted">Skills I Want</label>
            <input
              id="skillsWanted"
              type="text"
              value={skillsWanted}
              onChange={(e) => setSkillsWanted(e.target.value)}
              placeholder="Spanish, Cooking, Design (comma-separated)"
            />
            <small className="form-hint">Separate skills with commas</small>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
