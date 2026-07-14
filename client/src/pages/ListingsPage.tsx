import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Listing, PaginatedResponse } from '../types';

const MOCK_LISTINGS: Listing[] = [
  { id: '1', title: 'Premium Jasmine Rice - Grade A', pricePerKg: '1.8500', quantityKg: '50000', minOrderKg: '1000', grade: 'Grade A', location: 'Bangkok, Thailand', isActive: true, createdAt: new Date().toISOString(), variety: { id: '1', name: 'Jasmine Rice', origin: 'Thailand' }, seller: { id: '1', name: 'Golden Grain Co.', company: 'Golden Grain Co.' } },
  { id: '2', title: 'Basmati Rice - Export Quality', pricePerKg: '2.2000', quantityKg: '30000', minOrderKg: '500', grade: 'Extra Long', location: 'Punjab, India', isActive: true, createdAt: new Date().toISOString(), variety: { id: '2', name: 'Basmati Rice', origin: 'India' }, seller: { id: '1', name: 'Golden Grain Co.', company: 'Golden Grain Co.' } },
  { id: '3', title: 'Parboiled Rice Bulk Lot', pricePerKg: '0.9500', quantityKg: '100000', minOrderKg: '5000', grade: 'Standard', location: 'Ho Chi Minh City, Vietnam', isActive: true, createdAt: new Date().toISOString(), variety: { id: '3', name: 'Parboiled Rice', origin: 'Various' }, seller: { id: '2', name: 'Asia Rice Traders', company: 'Asia Rice Traders' } },
];

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>(MOCK_LISTINGS);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams({ limit: '20' });
    if (search) p.set('search', search);
    api.get<PaginatedResponse<Listing>>(`/listings?${p}`)
      .then(r => setListings(r.data.data))
      .catch(() => {}) // fallback to mock
      .finally(() => setLoading(false));
  }, [search]);

  const filtered = search
    ? listings.filter(l => l.title.toLowerCase().includes(search.toLowerCase()))
    : listings;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Listings</h1>
        <Link to="/listings/new" className="btn btn-primary btn-sm">+ New</Link>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings…" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 15, marginBottom: 12 }} />

      {loading && listings === MOCK_LISTINGS ? <p className="text-muted text-center mt-2">Loading…</p> : filtered.length === 0 ? (
        <div className="empty"><div className="empty-icon">📭</div><p className="empty-text">No listings found</p></div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {filtered.map(l => (
            <Link key={l.id} to={`/listings/${l.id}`} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
                <span className="badge badge-green">{l.variety.name}</span>
                {l.grade && <span className="text-xs text-muted">{l.grade}</span>}
              </div>
              <p style={{ fontWeight: 600, marginBottom: 6 }}>{l.title}</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>${parseFloat(l.pricePerKg).toFixed(3)}<span className="text-xs text-muted">/kg</span></p>
              <div className="flex gap-2 mt-1">
                <span className="text-xs text-muted">📦 {parseFloat(l.quantityKg).toLocaleString()} kg</span>
                {l.location && <span className="text-xs text-muted">📍 {l.location}</span>}
              </div>
              <p className="text-xs text-muted mt-1">{l.seller.company ?? l.seller.name}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
