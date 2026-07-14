import { Link } from 'react-router-dom';

export default function TradeDetailPage() {
  return (
    <div>
      <p className="text-xs text-muted mb-1"><Link to="/orders">← Orders</Link></p>
      <div className="card mb-2">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-1">
            <span style={{ fontSize: 28 }}>↑</span>
            <div>
              <p className="text-xs text-muted">You Bought</p>
              <p style={{ fontWeight: 700 }}>Jasmine Rice</p>
            </div>
          </div>
          <span className="badge badge-yellow">PENDING</span>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="text-sm text-muted">Total Value</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>$1,850.00</span>
        </div>
      </div>

      <div className="card mb-2">
        <p className="text-sm font-bold mb-1">Trade Details</p>
        <div className="flex justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}><span className="text-xs text-muted">Quantity</span><span className="text-sm font-bold">1,000 kg</span></div>
        <div className="flex justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}><span className="text-xs text-muted">Price/kg</span><span className="text-sm font-bold">$1.8500</span></div>
        <div className="flex justify-between" style={{ padding: '8px 0' }}><span className="text-xs text-muted">Date</span><span className="text-sm font-bold">{new Date().toLocaleDateString()}</span></div>
      </div>

      <div className="card" style={{ background: '#e8f5e9', textAlign: 'center' }}>
        <p className="text-xs text-muted">Deploy the backend to view real trade details</p>
      </div>
    </div>
  );
}
