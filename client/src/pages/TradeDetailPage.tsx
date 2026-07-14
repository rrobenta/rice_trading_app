import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Trade } from '../types';

export default function TradeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = () => api.get(`/trades/${id}`).then(r => setTrade(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, [id]);

  const handleStatus = async (status: 'COMPLETED' | 'DISPUTED') => {
    if (!confirm(status === 'COMPLETED' ? 'Mark this trade as completed?' : 'Raise a dispute for this trade?')) return;
    setUpdating(true);
    try {
      await api.patch(`/trades/${id}/status`, { status });
      load();
    } catch (e: any) {
      alert(e.response?.data?.error ?? 'Failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p className="text-muted text-center mt-2">Loading…</p>;
  if (!trade) return <p className="text-muted text-center mt-2">Not found</p>;

  const isBuyer = trade.buyer.id === user?.id;
  const counterparty = isBuyer ? trade.seller : trade.buyer;
  const statusColor = trade.status === 'COMPLETED' ? 'badge-green' : trade.status === 'DISPUTED' ? 'badge-red' : 'badge-yellow';

  return (
    <div>
      <p className="text-xs text-muted mb-1"><Link to="/orders">← Orders</Link></p>

      {/* Hero */}
      <div className="card mb-2">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-1">
            <span style={{ fontSize: 28 }}>{isBuyer ? '↑' : '↓'}</span>
            <div>
              <p className="text-xs text-muted">You {isBuyer ? 'Bought' : 'Sold'}</p>
              <p style={{ fontWeight: 700 }}>{trade.buyOrder.variety.name}</p>
            </div>
          </div>
          <span className={`badge ${statusColor}`}>{trade.status}</span>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="text-sm text-muted">Total Value</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>${parseFloat(trade.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Details */}
      <div className="card mb-2">
        <p className="text-sm font-bold mb-1">Trade Details</p>
        <Row label="Quantity" value={`${parseFloat(trade.quantityKg).toLocaleString()} kg`} />
        <Row label="Price/kg" value={`$${parseFloat(trade.pricePerKg).toFixed(4)}`} />
        <Row label="Created" value={new Date(trade.createdAt).toLocaleString()} />
        {trade.completedAt && <Row label="Completed" value={new Date(trade.completedAt).toLocaleString()} />}
      </div>

      {/* Counterparty */}
      <div className="card mb-2">
        <p className="text-sm font-bold mb-1">{isBuyer ? 'Seller' : 'Buyer'}</p>
        <Row label="Name" value={counterparty.name} />
        {counterparty.company && <Row label="Company" value={counterparty.company} />}
        {counterparty.email && <Row label="Email" value={counterparty.email} />}
      </div>

      {/* Actions */}
      {trade.status === 'PENDING' && (
        <div style={{ display: 'grid', gap: 10 }}>
          <button className="btn btn-primary btn-full" onClick={() => handleStatus('COMPLETED')} disabled={updating}>Mark Completed</button>
          <button className="btn btn-outline btn-full" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleStatus('DISPUTED')} disabled={updating}>Raise Dispute</button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}><span className="text-xs text-muted">{label}</span><span className="text-sm font-bold">{value}</span></div>;
}
