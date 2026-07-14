import { Link } from 'react-router-dom';

export default function ListingDetailPage() {
  return (
    <div>
      <p className="text-xs text-muted mb-1"><Link to="/listings">← Listings</Link></p>
      <div className="flex gap-1 mb-1"><span className="badge badge-green">Jasmine Rice</span><span className="badge badge-gray">Grade A</span></div>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Premium Jasmine Rice - Grade A</h1>

      <div className="card mb-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 20 }}>
        <div style={{ textAlign: 'center' }}><p className="text-xs text-muted">Price/kg</p><p style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>$1.8500</p></div>
        <div style={{ textAlign: 'center' }}><p className="text-xs text-muted">Available</p><p style={{ fontSize: 18, fontWeight: 700 }}>50,000 kg</p></div>
      </div>

      <div className="card mb-2">
        <p className="text-sm font-bold mb-1">Description</p>
        <p className="text-sm text-muted" style={{ lineHeight: 1.6 }}>First-crop jasmine rice, low moisture, excellent aroma. Sourced directly from premium Thai paddies.</p>
      </div>

      <div className="card mb-2">
        <p className="text-sm font-bold mb-1">Details</p>
        <div style={{ display: 'grid', gap: 8 }}>
          <div className="flex justify-between"><span className="text-xs text-muted">Min. order</span><span className="text-sm font-bold">1,000 kg</span></div>
          <div className="flex justify-between"><span className="text-xs text-muted">Moisture</span><span className="text-sm font-bold">14.0%</span></div>
          <div className="flex justify-between"><span className="text-xs text-muted">Location</span><span className="text-sm font-bold">Bangkok, Thailand</span></div>
          <div className="flex justify-between"><span className="text-xs text-muted">Origin</span><span className="text-sm font-bold">Thailand</span></div>
        </div>
      </div>

      <div className="card mb-2">
        <p className="text-sm font-bold mb-1">Seller</p>
        <p className="text-sm">Golden Grain Co.</p>
      </div>

      <Link to="/orders/new?type=BUY" className="btn btn-primary btn-full">Place Buy Order</Link>
    </div>
  );
}
