import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/profile').then(r => {
      setProfile(r.data);
      setForm({ name: r.data.name, company: r.data.company ?? '', phone: r.data.phone ?? '' });
    }).finally(() => setLoading(false));
  }, []);

  const set = (key: string) => (e: any) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await api.put('/users/profile', form);
      setProfile((p: any) => ({ ...p, ...r.data }));
      setEditing(false);
    } catch { alert('Save failed'); }
    finally { setSaving(false); }
  };

  const handleLogout = () => { if (confirm('Sign out?')) { logout(); navigate('/login'); } };

  if (loading) return <p className="text-muted text-center mt-2">Loading…</p>;

  return (
    <div>
      {/* Avatar */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: 36, background: 'var(--primary)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, marginBottom: 8 }}>{profile?.name?.[0]?.toUpperCase()}</div>
        <p style={{ fontSize: 20, fontWeight: 800 }}>{profile?.name}</p>
        {profile?.company && <p className="text-sm text-muted">{profile.company}</p>}
        <span className="badge badge-green" style={{ marginTop: 6 }}>{profile?.role}</span>
      </div>

      {/* Stats */}
      {profile?.stats && (
        <div className="stat-grid mb-2">
          <div className="stat-card"><div className="stat-num">{profile.stats.totalListings}</div><div className="stat-label">Listings</div></div>
          <div className="stat-card"><div className="stat-num">{profile.stats.totalOrders}</div><div className="stat-label">Orders</div></div>
          <div className="stat-card"><div className="stat-num">{profile.stats.totalTrades}</div><div className="stat-label">Trades</div></div>
        </div>
      )}

      {/* Info / Edit */}
      <div className="card mb-2">
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm font-bold">Account Details</p>
          {!editing && <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>}
        </div>
        {editing ? (
          <form onSubmit={handleSave}>
            <div className="field"><label>Name</label><input value={form.name} onChange={set('name')} required /></div>
            <div className="field"><label>Company</label><input value={form.company} onChange={set('company')} /></div>
            <div className="field"><label>Phone</label><input value={form.phone} onChange={set('phone')} /></div>
            <div className="flex gap-1">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            <Row label="Email" value={profile?.email} />
            <Row label="Phone" value={profile?.phone ?? '—'} />
            <Row label="Member since" value={new Date(profile?.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })} />
          </div>
        )}
      </div>

      <button className="btn btn-outline btn-full" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={handleLogout}>Sign Out</button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between" style={{ paddingBottom: 8, borderBottom: '1px solid var(--border)' }}><span className="text-xs text-muted">{label}</span><span className="text-sm">{value}</span></div>;
}
