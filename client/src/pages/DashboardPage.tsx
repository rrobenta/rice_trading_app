import { Link } from 'react-router-dom';

export default function DashboardPage() {
  return (
    <div>
      {/* Greeting */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>Hello, Trader 👋</h1>
          <p className="text-xs text-muted">Rice Trading Platform</p>
        </div>
        <Link to="/orders/new" className="btn btn-primary btn-sm">+ Order</Link>
      </div>

      {/* Market snapshot */}
      <h2 className="text-sm font-bold mb-1">Market Snapshot</h2>
      <div className="hscroll mb-2">
        <div className="card" style={{ minWidth: 140, flex: '0 0 auto' }}>
          <p className="text-xs text-muted">Jasmine Rice</p>
          <p style={{ fontSize: 18, fontWeight: 800, margin: '4px 0' }}>$1.852<span className="text-xs text-muted">/kg</span></p>
          <span className="badge badge-green">▲ 1.24%</span>
        </div>
        <div className="card" style={{ minWidth: 140, flex: '0 0 auto' }}>
          <p className="text-xs text-muted">Basmati Rice</p>
          <p style={{ fontSize: 18, fontWeight: 800, margin: '4px 0' }}>$2.215<span className="text-xs text-muted">/kg</span></p>
          <span className="badge badge-green">▲ 0.87%</span>
        </div>
        <div className="card" style={{ minWidth: 140, flex: '0 0 auto' }}>
          <p className="text-xs text-muted">Parboiled Rice</p>
          <p style={{ fontSize: 18, fontWeight: 800, margin: '4px 0' }}>$0.932<span className="text-xs text-muted">/kg</span></p>
          <span className="badge badge-red">▼ 0.45%</span>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
        <Link to="/listings/new" className="card text-center" style={{ padding: 12, textDecoration: 'none', color: 'var(--text)' }}><div style={{ fontSize: 22 }}>📦</div><div className="text-xs font-bold">List</div></Link>
        <Link to="/orders/new" className="card text-center" style={{ padding: 12, textDecoration: 'none', color: 'var(--text)' }}><div style={{ fontSize: 22 }}>🔄</div><div className="text-xs font-bold">Order</div></Link>
        <Link to="/market" className="card text-center" style={{ padding: 12, textDecoration: 'none', color: 'var(--text)' }}><div style={{ fontSize: 22 }}>📈</div><div className="text-xs font-bold">Market</div></Link>
        <Link to="/listings" className="card text-center" style={{ padding: 12, textDecoration: 'none', color: 'var(--text)' }}><div style={{ fontSize: 22 }}>🔍</div><div className="text-xs font-bold">Browse</div></Link>
      </div>

      {/* Stats */}
      <div className="stat-grid mb-2">
        <div className="stat-card"><div className="stat-num">3</div><div className="stat-label">Listings</div></div>
        <div className="stat-card"><div className="stat-num">5</div><div className="stat-label">Orders</div></div>
        <div className="stat-card"><div className="stat-num">2</div><div className="stat-label">Trades</div></div>
      </div>

      {/* Recent orders */}
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-sm font-bold">Recent Orders</h2>
        <Link to="/orders" className="text-xs" style={{ color: 'var(--primary)', fontWeight: 600 }}>See all</Link>
      </div>
      <div className="card mb-2" style={{ padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-1">
            <span className="badge badge-green">BUY</span>
            <span className="text-sm">Jasmine Rice</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="text-sm font-bold">$1.8500/kg</p>
            <span className="badge badge-green">OPEN</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px' }}>
          <div className="flex items-center gap-1">
            <span className="badge badge-red">SELL</span>
            <span className="text-sm">Basmati Rice</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="text-sm font-bold">$2.2200/kg</p>
            <span className="badge badge-yellow">PARTIALLY FILLED</span>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="card" style={{ background: '#e8f5e9', textAlign: 'center' }}>
        <p className="text-sm font-bold" style={{ color: 'var(--primary-dark)' }}>Backend Not Connected</p>
        <p className="text-xs text-muted" style={{ marginTop: 4 }}>Deploy the server to Railway to enable live data, login, and order matching.</p>
      </div>
    </div>
  );
}
