import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Listing, RiceVariety, PaginatedResponse } from '../types';

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [varieties, setVarieties] = useState<RiceVariety[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [varietyId, setVarietyId] = useState('');
  const [loading, setLoading] = useState(true);
  const LIMIT = 12;

  useEffect(() => { api.get('/market/varieties').then(r => setVarieties(r.data)); }, []);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (search) p.set('search', search);
    if (varietyId) p.set('varietyId', varietyId);
    api.get<PaginatedResponse<Listing>>(`/listings?${p}`)
      .then(r => { setListings(r.data.data); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [page, search, varietyId]);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Listings</h1>
        <Link to="/listings/new" className="btn btn-primary btn-sm">+ New</Link>
      </div>

      {/* Search */}
      <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search listings…" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 15, marginBottom: 10 }} />

      {/* Variety filter */}
      <div className="chip-row mb-2">
        <button className={`chip${!varietyId ? ' active' : ''}`} onClick={() => { setVarietyId(''); setPage(1); }}>All</button>
        {varieties.map(v => (
          <button key={v.id} className={`chip${varietyId === v.id ? ' active' : ''}`} onClick={() => { setVarietyId(v.id); setPage(1); }}>{v.name}</button>
        ))}
      </div>

      {loading ? <p className="text-muted text-center mt-2">Loading…</p> : listings.length === 0 ? (
        <div className="empty"><div className="empty-icon">📭</div><p className="empty-text">No listings found</p></div>
      ) : (
        <>
          <p className="text-xs text-muted mb-1">{total} listing{total !== 1 ? 's' : ''}</p>
          <div style={{ display: 'grid', gap: 12 }}>
            {listings.map(l => (
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
          {total > LIMIT && (
            <div className="flex items-center gap-1 mt-2" style={{ justifyContent: 'center' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</button>
              <span className="text-xs text-muted">Page {page}/{Math.ceil(total / LIMIT)}</span>
              <button className="btn btn-outline btn-sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / LIMIT)}>Next →</button>
            </div>
          )}
        </>
      )}

      <Link to="/listings/new" className="fab">+</Link>
    </div>
  );
}
