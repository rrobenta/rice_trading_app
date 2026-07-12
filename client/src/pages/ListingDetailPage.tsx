import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Listing } from '../types';
import { useAuth } from '../context/AuthContext';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then((r) => setListing(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDeactivate = async () => {
    if (!confirm('Deactivate this listing?')) return;
    setDeleting(true);
    try {
      await api.delete(`/listings/${id}`);
      navigate('/listings');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to deactivate');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <p className="text-muted">Loading…</p>;
  if (!listing) return <p className="text-muted">Listing not found.</p>;

  const isOwner = user?.id === listing.seller.id;

  return (
    <div>
      <div className="flex items-center gap-1 mb-2 text-sm text-muted">
        <Link to="/listings">Listings</Link>
        <span>/</span>
        <span>{listing.title}</span>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div>
          <div className="card">
            <div className="flex justify-between items-center mb-2">
              <span className="badge badge-green">{listing.variety.name}</span>
              {listing.grade && <span className="badge badge-gray">{listing.grade}</span>}
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>{listing.title}</h1>
            {listing.description && <p className="text-muted" style={{ marginBottom: '1rem', lineHeight: 1.6 }}>{listing.description}</p>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <p className="text-sm text-muted">Price per kg</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>${parseFloat(listing.pricePerKg).toFixed(4)}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Available quantity</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>{parseFloat(listing.quantityKg).toLocaleString()} kg</p>
              </div>
              <div>
                <p className="text-sm text-muted">Min. order</p>
                <p style={{ fontWeight: 600 }}>{parseFloat(listing.minOrderKg).toLocaleString()} kg</p>
              </div>
              {listing.moisture && (
                <div>
                  <p className="text-sm text-muted">Moisture</p>
                  <p style={{ fontWeight: 600 }}>{listing.moisture}%</p>
                </div>
              )}
              {listing.location && (
                <div>
                  <p className="text-sm text-muted">Location</p>
                  <p style={{ fontWeight: 600 }}>📍 {listing.location}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted">Listed</p>
                <p style={{ fontWeight: 600 }}>{new Date(listing.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {isOwner ? (
              <div className="flex gap-1">
                <button className="btn btn-danger" onClick={handleDeactivate} disabled={deleting}>
                  {deleting ? 'Deactivating…' : 'Deactivate Listing'}
                </button>
              </div>
            ) : (
              <Link
                to={`/orders/new?varietyId=${listing.variety.id}&pricePerKg=${listing.pricePerKg}&type=BUY`}
                className="btn btn-primary"
              >
                Place Buy Order
              </Link>
            )}
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Seller Information</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <p className="text-sm text-muted">Name</p>
              <p style={{ fontWeight: 600 }}>{listing.seller.name}</p>
            </div>
            {listing.seller.company && (
              <div>
                <p className="text-sm text-muted">Company</p>
                <p style={{ fontWeight: 600 }}>{listing.seller.company}</p>
              </div>
            )}
            {(listing.seller as any).phone && (
              <div>
                <p className="text-sm text-muted">Contact</p>
                <p style={{ fontWeight: 600 }}>{(listing.seller as any).phone}</p>
              </div>
            )}
          </div>

          <hr style={{ margin: '1rem 0', borderColor: 'var(--color-border)' }} />
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Rice Variety</h3>
          <p style={{ fontWeight: 600 }}>{listing.variety.name}</p>
          {listing.variety.description && <p className="text-sm text-muted mt-1">{listing.variety.description}</p>}
          {listing.variety.origin && <p className="text-sm text-muted">Origin: {listing.variety.origin}</p>}
        </div>
      </div>
    </div>
  );
}
