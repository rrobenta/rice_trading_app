import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Listing } from '../types';
import { useAuth } from '../context/AuthContext';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get(`/listings/${id}`).then(r => setListing(r.data)).finally(() => setLoading(false)); }, [id]);

  const handleDeactivate = async () => {
    if (!confirm('Deactivate this listing?')) return;
    await api.delete(`/listings/${id}`);
    navigate('/listings');
  };

  if (loading) return <p className="text-muted text-center mt-2">Loading…</p>;
  if (!listing) return <p className="text-muted text-center mt-2">Not found</p>;

  const isOwner = user?.id === listing.seller.id;

  return (
    <div>
      <p className="text-xs text-muted mb-1"><Link to="/listings">← Listings</Link></p>
      <div className="flex gap-1 mb-1"><span className="badge badge-green">{listing.variety.name}</span>{listing.grade && <span className="badge badge-gray">{listing.grade}</span>}</div>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, lineHeight: 1.3 }}>{listing.title}</h1>

      <div className="card mb-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 20 }}>
        <div style={{ textAlign: 'center' }}><p className="text-xs text-muted">Price/kg</p><p style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>${parseFloat(listing.pricePerKg).toFixed(4)}</p></div>
        <div style={{ textAlign: 'center' }}><p className="text-xs text-muted">Available</p><p style={{ fontSize: 18, fontWeight: 700 }}>{parseFloat(listing.quantityKg).toLocaleString()} kg</p></div>
      </div>

      {listing.description && <div className="card mb-2"><p className="text-sm font-bold mb-1">Description</p><p className="text-sm text-muted" style={{ lineHeight: 1.6 }}>{listing.description}</p></div>}

      <div className="card mb-2">
        <p className="text-sm font-bold mb-1">Details</p>
        <div style={{ display: 'grid', gap: 8 }}>
          <Row label="Min. order" value={`${parseFloat(listing.minOrderKg).toLocaleString()} kg`} />
          {listing.moisture && <Row label="Moisture" value={`${listing.moisture}%`} />}
          {listing.location && <Row label="Location" value={listing.location} />}
          <Row label="Origin" value={listing.variety.origin ?? '—'} />
          <Row label="Listed" value={new Date(listing.createdAt).toLocaleDateString()} />
        </div>
      </div>

      <div className="card mb-2">
        <p className="text-sm font-bold mb-1">Seller</p>
        <p className="text-sm">{listing.seller.company ?? listing.seller.name}</p>
        {listing.seller.phone && <p className="text-xs text-muted">{listing.seller.phone}</p>}
      </div>

      {isOwner ? (
        <button className="btn btn-danger btn-full" onClick={handleDeactivate}>Deactivate Listing</button>
      ) : (
        <Link to={`/orders/new?varietyId=${listing.variety.id}&pricePerKg=${listing.pricePerKg}&type=BUY`} className="btn btn-primary btn-full">Place Buy Order</Link>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-xs text-muted">{label}</span><span className="text-sm font-bold">{value}</span></div>;
}
