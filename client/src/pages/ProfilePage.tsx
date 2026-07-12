import { useEffect, useState, FormEvent } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({ name: '', company: '', phone: '' });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/profile')
      .then((r) => {
        setProfile(r.data);
        setForm({ name: r.data.name, company: r.data.company || '', phone: r.data.phone || '' });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await api.put('/users/profile', form);
      setProfile({ ...profile, ...r.data });
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-muted">Loading…</p>;
  if (!profile) return null;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>My Profile</h1>

      <div className="card mb-2">
        <div className="flex justify-between items-center mb-2">
          <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Account Details</h2>
          {!editing && (
            <button className="btn btn-outline" onClick={() => setEditing(true)}>Edit</button>
          )}
        </div>

        {success && (
          <div style={{ background: '#d8f3dc', color: '#1b4332', padding: '0.6rem 1rem', borderRadius: 6, marginBottom: '1rem', fontSize: '0.875rem' }}>
            Profile updated successfully.
          </div>
        )}

        {editing ? (
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="company">Company</label>
              <input id="company" name="company" value={form.company} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+1-555-000-0000" />
            </div>
            <div className="flex gap-1">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="grid-2">
              <div><p className="text-sm text-muted">Name</p><p style={{ fontWeight: 600 }}>{profile.name}</p></div>
              <div><p className="text-sm text-muted">Email</p><p style={{ fontWeight: 600 }}>{profile.email}</p></div>
              <div><p className="text-sm text-muted">Role</p><span className="badge badge-green">{profile.role}</span></div>
              <div><p className="text-sm text-muted">Member since</p><p style={{ fontWeight: 600 }}>{new Date(profile.createdAt).toLocaleDateString()}</p></div>
              {profile.company && <div><p className="text-sm text-muted">Company</p><p style={{ fontWeight: 600 }}>{profile.company}</p></div>}
              {profile.phone && <div><p className="text-sm text-muted">Phone</p><p style={{ fontWeight: 600 }}>{profile.phone}</p></div>}
            </div>
          </div>
        )}
      </div>

      {profile.stats && (
        <div className="grid-3">
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>{profile.stats.totalListings}</p>
            <p className="text-sm text-muted">Listings</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>{profile.stats.totalOrders}</p>
            <p className="text-sm text-muted">Orders</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>{profile.stats.totalTrades}</p>
            <p className="text-sm text-muted">Trades</p>
          </div>
        </div>
      )}
    </div>
  );
}
