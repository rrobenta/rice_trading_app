import { useState } from 'react';
import { Link } from 'react-router-dom';

interface ListingItem {
  id: string;
  title: string;
  sellPrice: string;
  boughtFor: string;
  batchDate: string;
  photo?: string;
}

const INITIAL_LISTINGS: ListingItem[] = [
  { id: '1', title: 'Jasmine Rice 25kg', sellPrice: '1250.00', boughtFor: '1050.00', batchDate: '2026-07-01' },
  { id: '2', title: 'Sinandomeng 50kg', sellPrice: '2100.00', boughtFor: '1800.00', batchDate: '2026-06-28' },
  { id: '3', title: 'Bien Rice 25kg', sellPrice: '980.00', boughtFor: '820.00', batchDate: '2026-07-05' },
];

export default function ListingsPage() {
  const [listings, setListings] = useState<ListingItem[]>(INITIAL_LISTINGS);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ListingItem | null>(null);

  const filtered = search
    ? listings.filter(l => l.title.toLowerCase().includes(search.toLowerCase()))
    : listings;

  const handleDelete = (id: string) => {
    if (!confirm('Delete this listing?')) return;
    setListings(prev => prev.filter(l => l.id !== id));
  };

  const handleEdit = (item: ListingItem) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleSave = () => {
    if (!editForm) return;
    setListings(prev => prev.map(l => l.id === editForm.id ? editForm : l));
    setEditingId(null);
    setEditForm(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const setField = (key: keyof ListingItem) => (e: any) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [key]: e.target.value });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Listings</h1>
        <Link to="/listings/new" className="btn btn-primary btn-sm">+ New</Link>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings…" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 15, marginBottom: 12 }} />

      {filtered.length === 0 ? (
        <div className="empty"><div className="empty-icon">📭</div><p className="empty-text">No listings found</p></div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {filtered.map(l => (
            <div key={l.id} className="card">
              {editingId === l.id && editForm ? (
                /* Edit mode */
                <div>
                  <div className="field"><label>Title</label><input value={editForm.title} onChange={setField('title')} /></div>
                  <div className="row-2">
                    <div className="field"><label>Sell Price</label><input value={editForm.sellPrice} onChange={setField('sellPrice')} type="number" step="0.01" /></div>
                    <div className="field"><label>Bought For</label><input value={editForm.boughtFor} onChange={setField('boughtFor')} type="number" step="0.01" /></div>
                  </div>
                  <div className="field"><label>Batch Date</label><input type="date" value={editForm.batchDate} onChange={setField('batchDate')} /></div>
                  <div className="flex gap-1">
                    <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
                    <button className="btn btn-ghost btn-sm" onClick={handleCancel}>Cancel</button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div>
                  <p style={{ fontWeight: 700, marginBottom: 6 }}>{l.title}</p>
                  <div className="flex gap-2" style={{ marginBottom: 6 }}>
                    <span className="text-xs text-muted">Sell: <strong style={{ color: 'var(--buy)' }}>₱{parseFloat(l.sellPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></span>
                    <span className="text-xs text-muted">Cost: <strong>₱{parseFloat(l.boughtFor).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted">Batch: {new Date(l.batchDate).toLocaleDateString()}</span>
                    <span className={`badge ${parseFloat(l.sellPrice) > parseFloat(l.boughtFor) ? 'badge-green' : 'badge-red'}`}>
                      Profit: ₱{(parseFloat(l.sellPrice) - parseFloat(l.boughtFor)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-1 mt-1" style={{ justifyContent: 'flex-end' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => handleEdit(l)}>Edit</button>
                    <button className="btn btn-sm" style={{ background: 'var(--danger)', color: '#fff' }} onClick={() => handleDelete(l.id)}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Link to="/listings/new" className="fab">+</Link>
    </div>
  );
}
