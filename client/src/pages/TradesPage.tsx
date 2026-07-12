import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Trade, PaginatedResponse } from '../types';
import { useAuth } from '../context/AuthContext';

export default function TradesPage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const LIMIT = 15;

  const load = () => {
    setLoading(true);
    api.get<PaginatedResponse<Trade>>(`/trades?page=${page}&limit=${LIMIT}`)
      .then((r) => { setTrades(r.data.data); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const handleStatus = async (id: string, status: 'COMPLETED' | 'DISPUTED') => {
    setUpdating(id);
    try {
      await api.patch(`/trades/${id}/status`, { status });
      load();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Trade History</h1>

      <div className="card">
        {loading ? (
          <p className="text-muted">Loading…</p>
        ) : trades.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p className="text-muted">No trades yet. Place orders to start trading.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Variety</th>
                  <th>Role</th>
                  <th>Counterparty</th>
                  <th>Qty (kg)</th>
                  <th>Price/kg</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => {
                  const isBuyer = t.buyer.id === user?.id;
                  return (
                    <tr key={t.id}>
                      <td className="text-sm">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="text-sm">{t.buyOrder.variety.name}</td>
                      <td><span className={`badge ${isBuyer ? 'badge-green' : 'badge-red'}`}>{isBuyer ? 'Buyer' : 'Seller'}</span></td>
                      <td className="text-sm">{isBuyer ? (t.seller.company || t.seller.name) : (t.buyer.company || t.buyer.name)}</td>
                      <td className="text-sm">{parseFloat(t.quantityKg).toLocaleString()}</td>
                      <td className="text-sm">${parseFloat(t.pricePerKg).toFixed(4)}</td>
                      <td className="text-sm" style={{ fontWeight: 600 }}>${parseFloat(t.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td>
                        <span className={`badge ${t.status === 'COMPLETED' ? 'badge-green' : t.status === 'DISPUTED' ? 'badge-red' : 'badge-yellow'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td>
                        {t.status === 'PENDING' && (
                          <div className="flex gap-1">
                            <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                              onClick={() => handleStatus(t.id, 'COMPLETED')} disabled={updating === t.id}>
                              Complete
                            </button>
                            <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', color: 'var(--color-danger)' }}
                              onClick={() => handleStatus(t.id, 'DISPUTED')} disabled={updating === t.id}>
                              Dispute
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
