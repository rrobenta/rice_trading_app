export default function ProfilePage() {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: 36, background: 'var(--primary)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, marginBottom: 8 }}>R</div>
        <p style={{ fontSize: 20, fontWeight: 800 }}>Rice Trader</p>
        <p className="text-sm text-muted">TRADER</p>
      </div>

      <div className="stat-grid mb-2">
        <div className="stat-card"><div className="stat-num">3</div><div className="stat-label">Listings</div></div>
        <div className="stat-card"><div className="stat-num">5</div><div className="stat-label">Orders</div></div>
        <div className="stat-card"><div className="stat-num">2</div><div className="stat-label">Trades</div></div>
      </div>

      <div className="card mb-2">
        <p className="text-sm font-bold mb-1">Account Details</p>
        <div style={{ display: 'grid', gap: 10 }}>
          <div className="flex justify-between" style={{ paddingBottom: 8, borderBottom: '1px solid var(--border)' }}><span className="text-xs text-muted">Email</span><span className="text-sm">trader@example.com</span></div>
          <div className="flex justify-between" style={{ paddingBottom: 8, borderBottom: '1px solid var(--border)' }}><span className="text-xs text-muted">Role</span><span className="badge badge-green">TRADER</span></div>
          <div className="flex justify-between"><span className="text-xs text-muted">Member since</span><span className="text-sm">July 2026</span></div>
        </div>
      </div>

      <div className="card" style={{ background: '#e8f5e9', textAlign: 'center' }}>
        <p className="text-xs text-muted">Deploy the backend to enable login, profile editing, and real data</p>
      </div>
    </div>
  );
}
