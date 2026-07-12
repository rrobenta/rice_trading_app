import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Listing, RiceVariety, PaginatedResponse } from '../types';

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [varieties, setVarieties] = useState<RiceVariety[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', varietyId: '', minPrice: '', maxPrice: '', location: '' });
  const [loading, setLoading] = useState(true);

  const LIMIT = 12;

  useEffect(() => {
    api.get('/market/varieties').then((r) => setVarieties(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    api.get<PaginatedResponse<Listing>>(`/listings?${params}`)
      .then((r) => { setListings(r.data.data); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [page, filters]);

  const handleFilter = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Listings</h1>
        <Link to="/listings/new" className="btn btn-primary">+ New Listing</Link>
      </div>

      {/* Filters */}
      <div className="card mb-2">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
          <input name="search" value={filters.search} onChange={handleFilter} placeholder="Search listings…" style={{ padding: '0.45rem 0.75rem', border: '1.5px solid var(--color-border)', borderRadius: 6, fontSize: '0.875rem' }} />
          <select name="varietyId" value={filters.varietyId} onChange={handleFilter} style={{ padding: '0.45rem 0.75rem', border: '1.5px solid var(--color-border)', borderRadius: 6, fontSize: '0.875rem' }}>
            <option value="">All varieties</option>
            {varieties.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <input name="location" value={filters.location} onChange={handleFilter} placeholder="Location…" style={{ padding: '0.45rem 0.75rem', border: '1.5px solid var(--color-border)', borderRadius: 6, fontSize: '0.875rem' }} />
          <input name="minPrice" value={filters.minPrice} onChange={handleFilter} placeholder="Min $/kg" type="number" step="0.01" style={{ padding: '0.45rem 0.75rem', border: '1.5px solid var(--color-border)', borderRadius: 6, fontSize: '0.875rem' }} />
          <input name="maxPrice" value={filters.maxPrice} onChange={handleFilter} placeholder="Max $/kg" type="number" step="0.01" style={{ padding: '0.45rem 0.75rem', border: '1.5px solid var(--color-border)', borderRadius: 6, fontSize: '0.875rem' }} />
        </div>
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : listings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p className="text-muted">No listings found.</p>
          <Link to="/listings/new" className="btn btn-primary mt-2">Create a listing</Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted mb-2">{total} listing{total !== 1 ? 's' : ''} found</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {listings.map((listing) => (
              <Link key={listing.id} to={`/listings/${listing.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card" style={{ height: '100%', transition: 'box-shadow 0.15s', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow)')}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="badge badge-green">{listing.variety.name}</span>
                    {listing.grade && <span className="text-sm text-muted">{listing.grade}</span>}
                  </div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>{listing.title}</h3>
                  <p style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    ${parseFloat(listing.pricePerKg).toFixed(3)}<span className="text-sm text-muted" style={{ fontWeight: 400 }}>/kg</span>
                  </p>
                  <div className="text-sm text-muted mt-1">
                    <p>Available: {parseFloat(listing.quantityKg).toLocaleString()} kg</p>
                    <p>Min order: {parseFloat(listing.minOrderKg).toLocaleString()} kg</p>
                    {listing.location && <p>📍 {listing.location}</p>}
                  </div>
                  <p className="text-sm text-muted mt-1">{listing.seller.company || listing.seller.name}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {total > LIMIT && (
            <div className="flex gap-1 items-center mt-2" style={{ justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</button>
              <span className="text-sm text-muted">Page {page} of {Math.ceil(total / LIMIT)}</span>
              <button className="btn btn-outline" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / LIMIT)}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
