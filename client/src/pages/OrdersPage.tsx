import { Link } from 'react-router-dom';

export default function OrdersPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Orders & Trades</h1>
        <Link to="/orders/new" className="btn btn-primary btn-sm">+ Order</Link>
      </div>

      <div className="segment-ctrl mb-2">
        <button className="segment-btn active">My Orders</button>
        <button className="segment-btn">Sales</button>
      </div>

      {/* Sample orders */}
      <div style={{ display: 'grid', gap: 10 }}>
        <div className="card">
          <div className="flex justify-between items-center mb-1">
            <span className="badge badge-green">BUY</span>
            <span className="badge badge-green">OPEN</span>
          </div>
          <p className="text-sm font-bold">Jasmine Rice</p>
          <div className="flex gap-2 mt-1">
            <span className="text-xs text-muted">$1.8500/kg</span>
            <span className="text-xs text-muted">1,000 kg</span>
          </div>
          <div className="progress mt-1"><div className="progress-fill" style={{ width: '0%' }} /></div>
          <p className="text-xs text-muted mt-1">0% filled</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-1">
            <span className="badge badge-red">SELL</span>
            <span className="badge badge-yellow">PARTIALLY FILLED</span>
          </div>
          <p className="text-sm font-bold">Basmati Rice</p>
          <div className="flex gap-2 mt-1">
            <span className="text-xs text-muted">$2.2200/kg</span>
            <span className="text-xs text-muted">5,000 kg</span>
          </div>
          <div className="progress mt-1"><div className="progress-fill" style={{ width: '40%' }} /></div>
          <p className="text-xs text-muted mt-1">40% filled</p>
        </div>
      </div>

      <div className="card mt-2" style={{ background: '#e8f5e9', textAlign: 'center' }}>
        <p className="text-xs text-muted">Deploy the backend to see your real orders and trade history</p>
      </div>

      <Link to="/orders/new" className="fab">+</Link>
    </div>
  );
}
