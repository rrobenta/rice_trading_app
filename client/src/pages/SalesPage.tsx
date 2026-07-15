import { useState, useEffect } from 'react';
import {
  collection, addDoc, deleteDoc, doc, query, where, onSnapshot, orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

interface ListingItem {
  id: string;
  title: string;
  sellPrice: string;
  quantity: string;
}

interface SaleItem {
  id: string;
  listingTitle: string;
  quantitySold: string;
  pricePerUnit: string;
  totalAmount: number;
  description: string;
  customerName: string;
  date: string;
}

export default function SalesPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ listingTitle: '', quantitySold: '', pricePerUnit: '', description: '', customerName: '', date: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;

    const unsubListings = onSnapshot(
      query(collection(db, 'listings'), where('uid', '==', uid)),
      (snap) => setListings(snap.docs.map(d => ({ id: d.id, ...d.data() } as ListingItem))),
      () => {}
    );

    const unsubSales = onSnapshot(
      query(collection(db, 'sales'), where('uid', '==', uid), orderBy('createdAt', 'desc')),
      (snap) => setSales(snap.docs.map(d => ({ id: d.id, ...d.data() } as SaleItem))),
      () => {}
    );

    return () => { unsubListings(); unsubSales(); };
  }, [user]);

  const handleSelectListing = (title: string) => {
    const listing = listings.find(l => l.title === title);
    setForm(f => ({
      ...f,
      listingTitle: title,
      pricePerUnit: listing?.sellPrice || '',
    }));
  };

  const handleAddSale = async () => {
    if (!form.listingTitle || !form.quantitySold || !form.pricePerUnit || !form.date || !user) return;
    setSaving(true);
    try {
      const totalAmount = parseFloat(form.pricePerUnit) * parseInt(form.quantitySold, 10);
      await addDoc(collection(db, 'sales'), {
        listingTitle: form.listingTitle,
        quantitySold: form.quantitySold,
        pricePerUnit: form.pricePerUnit,
        totalAmount,
        description: form.description,
        customerName: form.customerName,
        date: form.date,
        uid: user.uid,
        createdAt: new Date(),
      });
      setForm({ listingTitle: '', quantitySold: '', pricePerUnit: '', description: '', customerName: '', date: '' });
      setShowForm(false);
    } catch (err: any) {
      alert('Failed to save: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this sale record?')) return;
    await deleteDoc(doc(db, 'sales', id));
  };

  const totalSales = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const totalQtySold = sales.reduce((sum, s) => sum + parseInt(s.quantitySold || '0', 10), 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Sales</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ Record Sale</button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <p className="text-xs text-muted">Total Revenue</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--buy)' }}>₱{totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <p className="text-xs text-muted">Units Sold</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>{totalQtySold}</p>
        </div>
      </div>

      {/* Add sale form */}
      {showForm && (
        <div className="card mb-2">
          <p className="text-sm font-bold mb-1">Record a Sale</p>

          <div className="field">
            <label>Item (from listings) *</label>
            <select value={form.listingTitle} onChange={e => handleSelectListing(e.target.value)}>
              <option value="">Select an item…</option>
              {listings.map(l => (
                <option key={l.id} value={l.title}>{l.title} (₱{parseFloat(l.sellPrice).toFixed(2)} × {l.quantity} in stock)</option>
              ))}
            </select>
          </div>

          <div className="row-2">
            <div className="field">
              <label>Qty Sold *</label>
              <input value={form.quantitySold} onChange={e => setForm(f => ({ ...f, quantitySold: e.target.value }))} type="number" min="1" placeholder="e.g. 10" />
            </div>
            <div className="field">
              <label>Price/Unit *</label>
              <input value={form.pricePerUnit} onChange={e => setForm(f => ({ ...f, pricePerUnit: e.target.value }))} type="number" step="0.01" placeholder="Auto from listing" />
            </div>
          </div>

          <div className="field">
            <label>Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Bulk order, retail sale" />
          </div>

          <div className="field">
            <label>Customer Name (optional)</label>
            <input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} placeholder="e.g. Juan Dela Cruz" />
          </div>

          <div className="field">
            <label>Date *</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>

          {form.quantitySold && form.pricePerUnit && (
            <div className="card mb-2" style={{ background: '#e8f5e9', textAlign: 'center', padding: 10 }}>
              <p className="text-xs text-muted">Sale Total</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--buy)' }}>
                ₱{(parseFloat(form.pricePerUnit) * parseInt(form.quantitySold || '0', 10)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          <div className="flex gap-1">
            <button className="btn btn-primary btn-sm" onClick={handleAddSale} disabled={saving}>{saving ? 'Saving…' : 'Save Sale'}</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Sales list */}
      {sales.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🧾</div>
          <p className="empty-text">No sales recorded yet</p>
          <button className="btn btn-primary btn-sm mt-2" onClick={() => setShowForm(true)}>Record your first sale</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {sales.map(s => (
            <div key={s.id} className="card">
              <div className="flex justify-between items-center">
                <p style={{ fontWeight: 700 }}>{s.listingTitle}</p>
                <p style={{ fontWeight: 800, color: 'var(--buy)' }}>₱{(s.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="flex gap-2 mt-1">
                <span className="text-xs text-muted">{s.quantitySold} units × ₱{parseFloat(s.pricePerUnit).toFixed(2)}</span>
                <span className="text-xs text-muted">{s.date}</span>
              </div>
              {s.description && <p className="text-xs text-muted mt-1">{s.description}</p>}
              {s.customerName && <p className="text-xs mt-1" style={{ color: 'var(--primary)' }}>👤 {s.customerName}</p>}
              <div className="flex mt-1" style={{ justifyContent: 'flex-end' }}>
                <button className="btn btn-sm" style={{ background: 'var(--danger)', color: '#fff' }} onClick={() => handleDelete(s.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!showForm && <button className="fab" onClick={() => setShowForm(true)}>+</button>}
    </div>
  );
}
