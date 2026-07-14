import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!confirm('Sign out?')) return;
    await logout();
    navigate('/login');
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: 36, background: 'var(--primary)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, marginBottom: 8 }}>
          {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
        </div>
        <p style={{ fontSize: 20, fontWeight: 800 }}>{user?.displayName || 'User'}</p>
        <p className="text-sm text-muted">{user?.email}</p>
      </div>

      <div className="card mb-2">
        <p className="text-sm font-bold mb-1">Account Details</p>
        <div style={{ display: 'grid', gap: 10 }}>
          <div className="flex justify-between" style={{ paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
            <span className="text-xs text-muted">Name</span>
            <span className="text-sm">{user?.displayName || '—'}</span>
          </div>
          <div className="flex justify-between" style={{ paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
            <span className="text-xs text-muted">Email</span>
            <span className="text-sm">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-muted">Member since</span>
            <span className="text-sm">{user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : '—'}</span>
          </div>
        </div>
      </div>

      <button className="btn btn-outline btn-full" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={handleLogout}>Sign Out</button>
    </div>
  );
}
