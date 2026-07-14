import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { MarketSummaryItem, Order, Trade } from '../types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<MarketSummaryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/market/summary'), api.get('/orders?limit=4'), api.get('/trades?limit=3')])
      .then(([s, o, t]) => { setSummary(s.data); setOrders(o.data.data); setTrades(t.data.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted text-center mt-2">Loading…</p>;

  return (
    <div>
      {/* Greeting */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>Hello, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-xs text-muted">{user?.company ?? user?.role}</p>
        </div>
        <Link to="/orders/new" className="btn btn-primary btn-sm">+ Order</Link>
      </div>

      {/* Market snapshot */}
      <h2 className="text-sm font-bold mb-1">Market Snapshot</h2>
      <div className="hscroll mb-2">
        {summary.filter(s => s.currentPrice).map(item => {
          const pct = parseFloat(item.changePct ?? '0');
          const up = pct >= 0;
          return (
            <div key={item.variety.id} className="card" style={{ minWidth: 140, flex: '0 0 auto' }}>
              <p className="text-xs text-muted">{item.variety.name}</p>
              <p style={{ fontSize: 18, fontWeight: 800, margin: '4px 0' }}>${parseFloat(item.currentPrice!).toFixed(3)}<span className="text-xs text-muted">/kg</span></p>
              <span className={`badge ${up ? 'badge-green' : 'badge-red'}`}>{up ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%</span>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
        <Link to="/listings/new" className="card text-center" style={{ padding: 12, textDecoration: 'none', color: 'var(--text)' }}><div style={{ fontSize: 22 }}>📦</div><div className="text-xs font-bold">List</div></Link>
        <Link to="/orders/new" className="card text-center" style={{ padding: 12, textDecoration: 'none', color: 'var(--text)' }}><div style={{ fontSize: 22 }}>🔄</div><div className="text-xs font-bold">Order</div></Link>
        <Link to="/market" className="card text-center" style={{ padding: 12, textDecoration: 'none', color: 'var(--text)' }}><div style={{ fontSize: 22 }}>📈</div><div className="text-xs font-bold">Market</div></Link>
        <Link to="/listings" className="card text-center" style={{ padding: 12, textDecoration: 'none', color: 'var(--text)' }}><div style={{ fontSize: 22 }}>🔍</div><div className="text-xs font-bold">Browse</div></Link>
      </div>

      {/* Recent orders */}
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-sm font-bold">Recent Orders</h2>
        <Link to="/orders" className="text-xs" style={{ color: 'var(--primary)', fontWeight: 600 }}>See all</Link>
      </div>
      <div className="card mb-2" style={{ padding: 0 }}>
        {orders.length === 0 ? <p className="text-sm text-muted" style={{ padding: 16 }}>No orders yet</p> : orders.map((o, i) => (
          <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: i < orders.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div className="flex items-center gap-1">
              <span className={`badge ${o.type === 'BUY' ? 'badge-green' : 'badge-red'}`}>{o.type}</span>
              <span className="text-sm">{o.variety.name}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="text-sm font-bold">${parseFloat(o.pricePerKg).toFixed(3)}</p>
              <span className={`badge badge-${o.status === 'OPEN' ? 'green' : o.status === 'FILLED' ? 'gray' : o.status === 'CANCELLED' ? 'red' : 'yellow'}`}>{o.status.replace('_', ' ')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent trades */}
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-sm font-bold">Recent Trades</h2>
        <Link to="/orders" className="text-xs" style={{ color: 'var(--primary)', fontWeight: 600 }}>See all</Link>
      </div>
      <div className="card" style={{ padding: 0 }}>
        {trades.length === 0 ? <p className="text-sm text-muted" style={{ padding: 16 }}>No trades yet</p> : trades.map((t, i) => (
          <Link key={t.id} to={`/trades/${t.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: i < trades.length - 1 ? '1px solid var(--border)' : 'none', color: 'inherit', textDecoration: 'none' }}>
            <div className="flex items-center gap-1">
              <span className={`badge ${t.buyer.id === user?.id ? 'badge-green' : 'badge-red'}`}>{t.buyer.id === user?.id ? 'Bought' : 'Sold'}</span>
              <span className="text-sm">{t.buyOrder.variety.name}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="text-sm font-bold">${parseFloat(t.totalAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-muted">{parseFloat(t.quantityKg).toLocaleString()} kg</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
