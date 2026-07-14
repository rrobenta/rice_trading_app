import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Order, Trade, PaginatedResponse } from '../types';

export default function OrdersPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'orders' | 'trades'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const params = new URLSearchParams({ limit: '30' });
    if (typeFilter) params.set('type', typeFilter);
    const [o, t] = await Promise.all([
      api.get<PaginatedResponse<Order>>(`/orders?${params}`),
      api.get<PaginatedResponse<Trade>>('/trades?limit=30'),
    ]);
    setOrders(o.data.data);
    setTrades(t.data.data);
    setLoading(false);
  }, [typeFilter]);

  useEffect(() => { load(); }, [load]);

  const cancelOrder = async (id: string) => {
    if (!confirm('Cancel this order?')) return;
    await api.patch(`/orders/${id}/cancel`);
    load();
  };

  const fillPct = (o: Order) => parseFloat(o.quantityKg) > 0 ? Math.round((parseFloat(o.filledKg) / parseFloat(o.quantityKg)) * 100) : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Orders & Trades</h1>
        <Link to="/orders/new" className="btn btn-primary btn-sm">+ Order</Link>
      </div>

      <div className="segment-ctrl mb-2">
        <button className={`segment-btn${tab === 'orders' ? ' active' : ''}`} onClick={() => setTab('orders')}>My Orders</button>
        <button className={`segment-btn${tab === 'trades' ? ' active' : ''}`} onClick={() => setTab('trades')}>Trade History</button>
      </div>

      {tab === 'orders' && (
        <div className="chip-row mb-2">
          {['', 'BUY', 'SELL'].map(t => (
            <button key={t} className={`chip${typeFilter === t ? ' active' : ''}`} onClick={() => setTypeFilter(t)}>{t || 'All'}</button>
          ))}
        </div>
      )}

      {loading ? <p className="text-muted text-center">Loading…</p> : tab === 'orders' ? (
        orders.length === 0 ? <div className="empty"><div className="empty-icon">📋</div><p className="empty-text">No orders</p></div> : (
          <div style={{ display: 'grid', gap: 10 }}>
            {orders.map(o => (
              <div key={o.id} className="card">
                <div className="flex justify-between items-center mb-1">
                  <span className={`badge ${o.type === 'BUY' ? 'badge-green' : 'badge-red'}`}>{o.type}</span>
                  <span className={`badge badge-${o.status === 'OPEN' ? 'green' : o.status === 'FILLED' ? 'gray' : o.status === 'CANCELLED' ? 'red' : 'yellow'}`}>{o.status.replace('_', ' ')}</span>
                </div>
                <p className="text-sm font-bold">{o.variety.name}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs text-muted">${parseFloat(o.pricePerKg).toFixed(4)}/kg</span>
                  <span className="text-xs text-muted">{parseFloat(o.quantityKg).toLocaleString()} kg</span>
                </div>
                <div className="progress mt-1"><div className="progress-fill" style={{ width: `${fillPct(o)}%` }} /></div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-muted">{fillPct(o)}% filled · {new Date(o.createdAt).toLocaleDateString()}</span>
                  {(o.status === 'OPEN' || o.status === 'PARTIALLY_FILLED') && (
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', padding: '4px 10px' }} onClick={() => cancelOrder(o.id)}>Cancel</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        trades.length === 0 ? <div className="empty"><div className="empty-icon">🤝</div><p className="empty-text">No trades</p></div> : (
          <div style={{ display: 'grid', gap: 10 }}>
            {trades.map(t => {
              const isBuyer = t.buyer.id === user?.id;
              return (
                <Link key={t.id} to={`/trades/${t.id}`} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`badge ${isBuyer ? 'badge-green' : 'badge-red'}`}>{isBuyer ? 'Bought' : 'Sold'}</span>
                    <span className={`badge badge-${t.status === 'COMPLETED' ? 'green' : t.status === 'DISPUTED' ? 'red' : 'yellow'}`}>{t.status}</span>
                  </div>
                  <p className="text-sm font-bold">{t.buyOrder.variety.name}</p>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted">{parseFloat(t.quantityKg).toLocaleString()} kg · ${parseFloat(t.pricePerKg).toFixed(4)}/kg</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>${parseFloat(t.totalAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                  <p className="text-xs text-muted mt-1">{new Date(t.createdAt).toLocaleDateString()}</p>
                </Link>
              );
            })}
          </div>
        )
      )}

      <Link to="/orders/new" className="fab">+</Link>
    </div>
  );
}
