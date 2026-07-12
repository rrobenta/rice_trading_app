import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { MarketSummaryItem, Order, Trade } from '../types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<MarketSummaryItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/market/summary'),
      api.get('/orders?limit=5'),
      api.get('/trades?limit=5'),
    ])
      .then(([s, o, t]) => {
        setSummary(s.data);
        setRecentOrders(o.data.data);
        setRecentTrades(t.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted">Loading dashboard…</p>;

  const statusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'badge-green';
      case 'PARTIALLY_FILLED': return 'badge-yellow';
      case 'FILLED': return 'badge-gray';
      case 'CANCELLED': return 'badge-red';
      default: return 'badge-gray';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted text-sm">{user?.company && `${user.company} · `}{user?.role}</p>
        </div>
        <div className="flex gap-1">
          <Link to="/listings/new" className="btn btn-outline">+ New Listing</Link>
          <Link to="/orders/new" className="btn btn-primary">+ Place Order</Link>
        </div>
      </div>

      {/* Market snapshot */}
      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Market Snapshot</h2>
      <div className="grid-3 mb-2">
        {summary.filter(s => s.currentPrice).slice(0, 3).map((item) => {
          const change = parseFloat(item.changePct || '0');
          return (
            <div key={item.variety.id} className="card">
              <p className="text-sm text-muted">{item.variety.name}</p>
              <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.25rem 0' }}>
                ${parseFloat(item.currentPrice!).toFixed(3)}<span className="text-sm text-muted">/kg</span>
              </p>
              <span className={`badge ${change >= 0 ? 'badge-green' : 'badge-red'}`}>
                {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid-2">
        {/* Recent Orders */}
        <div className="card">
          <div className="flex justify-between items-center mb-2">
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent Orders</h2>
            <Link to="/orders" className="text-sm">View all</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-muted text-sm">No orders yet. <Link to="/orders/new">Place one</Link></p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Variety</th>
                    <th>Price/kg</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td><span className={`badge ${o.type === 'BUY' ? 'badge-green' : 'badge-red'}`}>{o.type}</span></td>
                      <td className="text-sm">{o.variety.name}</td>
                      <td className="text-sm">${parseFloat(o.pricePerKg).toFixed(3)}</td>
                      <td><span className={`badge ${statusColor(o.status)}`}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Trades */}
        <div className="card">
          <div className="flex justify-between items-center mb-2">
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent Trades</h2>
            <Link to="/trades" className="text-sm">View all</Link>
          </div>
          {recentTrades.length === 0 ? (
            <p className="text-muted text-sm">No trades yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Variety</th>
                    <th>Qty (kg)</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrades.map((t) => (
                    <tr key={t.id}>
                      <td className="text-sm">{t.buyOrder.variety.name}</td>
                      <td className="text-sm">{parseFloat(t.quantityKg).toLocaleString()}</td>
                      <td className="text-sm">${parseFloat(t.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td><span className={`badge ${t.status === 'COMPLETED' ? 'badge-green' : t.status === 'DISPUTED' ? 'badge-red' : 'badge-yellow'}`}>{t.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
