import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Order, PaginatedResponse } from '../types';

const STATUS_COLOR: Record<string, string> = {
  OPEN: 'badge-green',
  PARTIALLY_FILLED: 'badge-yellow',
  FILLED: 'badge-gray',
  CANCELLED: 'badge-red',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ type: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const LIMIT = 15;

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (filters.type) params.set('type', filters.type);
    if (filters.status) params.set('status', filters.status);
    api.get<PaginatedResponse<Order>>(`/orders?${params}`)
      .then((r) => { setOrders(r.data.data); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, filters]);

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this order?')) return;
    setCancelling(id);
    try {
      await api.patch(`/orders/${id}/cancel`);
      load();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to cancel');
    } finally {
      setCancelling(null);
    }
  };

  const fillPct = (o: Order) => {
    const qty = parseFloat(o.quantityKg);
    if (qty === 0) return 0;
    return Math.round((parseFloat(o.filledKg) / qty) * 100);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>My Orders</h1>
        <Link to="/orders/new" className="btn btn-primary">+ Place Order</Link>
      </div>

      <div className="flex gap-1 mb-2">
        <select value={filters.type} onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setPage(1); }}
          style={{ padding: '0.4rem 0.65rem', border: '1.5px solid var(--color-border)', borderRadius: 6, fontSize: '0.875rem' }}>
          <option value="">All types</option>
          <option value="BUY">Buy</option>
          <option value="SELL">Sell</option>
        </select>
        <select value={filters.status} onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
          style={{ padding: '0.4rem 0.65rem', border: '1.5px solid var(--color-border)', borderRadius: 6, fontSize: '0.875rem' }}>
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="PARTIALLY_FILLED">Partially Filled</option>
          <option value="FILLED">Filled</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <p className="text-muted">Loading…</p>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p className="text-muted">No orders found.</p>
            <Link to="/orders/new" className="btn btn-primary mt-2">Place your first order</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Variety</th>
                  <th>Price/kg</th>
                  <th>Quantity</th>
                  <th>Filled</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td><span className={`badge ${o.type === 'BUY' ? 'badge-green' : 'badge-red'}`}>{o.type}</span></td>
                    <td className="text-sm">{o.variety.name}</td>
                    <td className="text-sm">${parseFloat(o.pricePerKg).toFixed(4)}</td>
                    <td className="text-sm">{parseFloat(o.quantityKg).toLocaleString()} kg</td>
                    <td className="text-sm">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 60, height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${fillPct(o)}%`, height: '100%', background: 'var(--color-primary)' }} />
                        </div>
                        <span>{fillPct(o)}%</span>
                      </div>
                    </td>
                    <td><span className={`badge ${STATUS_COLOR[o.status]}`}>{o.status}</span></td>
                    <td className="text-sm">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>
                      {(o.status === 'OPEN' || o.status === 'PARTIALLY_FILLED') && (
                        <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                          onClick={() => handleCancel(o.id)} disabled={cancelling === o.id}>
                          {cancelling === o.id ? '…' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {total > LIMIT && (
        <div className="flex gap-1 items-center mt-2" style={{ justifyContent: 'center' }}>
          <button className="btn btn-outline" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</button>
          <span className="text-sm text-muted">Page {page} of {Math.ceil(total / LIMIT)}</span>
          <button className="btn btn-outline" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / LIMIT)}>Next →</button>
        </div>
      )}
    </div>
  );
}
