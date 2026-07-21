import { useState, useEffect } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { STORE_ID } from '../lib/store';
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

interface CustomerSummary {
  name: string;
  totalQty: number;
  totalAmount: number;
  orders: { date: string; item: string; qty: number; amount: number }[];
}

export default function SalesPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'sales' | 'customers'>('sales');
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ listingTitle: '', quantitySold: '', pricePerUnit: '', description: '', customerName: '', date: '' });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<SaleItem | null>(null);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsubListings = onSnapshot(
      query(collection(db, 'listings'), where('storeId', '==', STORE_ID)),
      (snap) => setListings(snap.docs.map(d => ({ id: d.id, ...d.data() } as ListingItem))),
      () => {}
    );

    const unsubSales = onSnapshot(
      query(collection(db, 'sales'), where('storeId', '==', STORE_ID), orderBy('createdAt', 'desc')),
      (snap) => setSales(snap.docs.map(d => ({ id: d.id, ...d.data() } as SaleItem))),
      () => {}
    );

    return () => { unsubListings(); unsubSales(); };
  }, [user]);

  // --- Add sale ---
  const handleSelectListing = (title: string) => {
    const listing = listings.find(l => l.title === title);
    setForm(f => ({ ...f, listingTitle: title, pricePerUnit: listing?.sellPrice || '' }));
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
        storeId: STORE_ID,
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

  // --- Edit sale ---
  const handleEdit = (s: SaleItem) => {
    setEditingId(s.id);
    setEditForm({ ...s });
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;
    const { id, ...data } = editForm;
    const totalAmount = parseFloat(data.pricePerUnit) * parseInt(data.quantitySold, 10);
    await updateDoc(doc(db, 'sales', id), { ...data, totalAmount });
    setEditingId(null);
    setEditForm(null);
  };

  // --- Delete sale ---
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this sale record?')) return;
    await deleteDoc(doc(db, 'sales', id));
  };

  // --- Customer summary ---
  const customerSummaries: CustomerSummary[] = (() => {
    const map: Record<string, CustomerSummary> = {};
    sales.forEach(s => {
      const name = s.customerName?.trim() || '';
      if (!name) return;
      if (!map[name]) {
        map[name] = { name, totalQty: 0, totalAmount: 0, orders: [] };
      }
      const qty = parseInt(s.quantitySold || '0', 10);
      const amount = s.totalAmount || 0;
      map[name].totalQty += qty;
      map[name].totalAmount += amount;
      map[name].orders.push({ date: s.date, item: s.listingTitle, qty, amount });
    });
    // Sort by total amount descending
    return Object.values(map).sort((a, b) => b.totalAmount - a.totalAmount);
  })();

  const totalSales = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const totalQtySold = sales.reduce((sum, s) => sum + parseInt(s.quantitySold || '0', 10), 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Sales</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ Record Sale</button>
      </div>

      {/* Segment: Sales | Customers */}
      <div className="segment-ctrl mb-2">
        <button className={`segment-btn${tab === 'sales' ? ' active' : ''}`} onClick={() => setTab('sales')}>All Sales</button>
        <button className={`segment-btn${tab === 'customers' ? ' active' : ''}`} onClick={() => setTab('customers')}>Customers</button>
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

      {/* === SALES TAB === */}
      {tab === 'sales' && (
        <>
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
                <div className="field"><label>Qty Sold *</label><input value={form.quantitySold} onChange={e => setForm(f => ({ ...f, quantitySold: e.target.value }))} type="number" min="1" placeholder="e.g. 10" /></div>
                <div className="field"><label>Price/Unit *</label><input value={form.pricePerUnit} onChange={e => setForm(f => ({ ...f, pricePerUnit: e.target.value }))} type="number" step="0.01" placeholder="Auto from listing" /></div>
              </div>
              <div className="field"><label>Description</label><input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Bulk order, retail sale" /></div>
              <div className="field"><label>Customer Name (optional)</label><input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} placeholder="e.g. Juan Dela Cruz" /></div>
              <div className="field"><label>Date *</label><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
              {form.quantitySold && form.pricePerUnit && (
                <div className="card mb-2" style={{ background: '#e8f5e9', textAlign: 'center', padding: 10 }}>
                  <p className="text-xs text-muted">Sale Total</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--buy)' }}>₱{(parseFloat(form.pricePerUnit) * parseInt(form.quantitySold || '0', 10)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
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
            <div className="empty"><div className="empty-icon">🧾</div><p className="empty-text">No sales recorded yet</p><button className="btn btn-primary btn-sm mt-2" onClick={() => setShowForm(true)}>Record your first sale</button></div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {sales.map(s => (
                <div key={s.id} className="card">
                  {editingId === s.id && editForm ? (
                    /* Edit mode */
                    <div>
                      <div className="field"><label>Item</label>
                        <select value={editForm.listingTitle} onChange={e => setEditForm(f => f ? { ...f, listingTitle: e.target.value } : f)}>
                          {listings.map(l => <option key={l.id} value={l.title}>{l.title}</option>)}
                        </select>
                      </div>
                      <div className="row-2">
                        <div className="field"><label>Qty Sold</label><input value={editForm.quantitySold} onChange={e => setEditForm(f => f ? { ...f, quantitySold: e.target.value } : f)} type="number" min="1" /></div>
                        <div className="field"><label>Price/Unit</label><input value={editForm.pricePerUnit} onChange={e => setEditForm(f => f ? { ...f, pricePerUnit: e.target.value } : f)} type="number" step="0.01" /></div>
                      </div>
                      <div className="field"><label>Description</label><input value={editForm.description} onChange={e => setEditForm(f => f ? { ...f, description: e.target.value } : f)} /></div>
                      <div className="field"><label>Customer Name</label><input value={editForm.customerName} onChange={e => setEditForm(f => f ? { ...f, customerName: e.target.value } : f)} /></div>
                      <div className="field"><label>Date</label><input type="date" value={editForm.date} onChange={e => setEditForm(f => f ? { ...f, date: e.target.value } : f)} /></div>
                      <div className="flex gap-1">
                        <button className="btn btn-primary btn-sm" onClick={handleSaveEdit}>Save</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditingId(null); setEditForm(null); }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    /* View mode */
                    <div>
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
                      <div className="flex gap-1 mt-1" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => handleEdit(s)}>Edit</button>
                        <button className="btn btn-sm" style={{ background: 'var(--danger)', color: '#fff' }} onClick={() => handleDelete(s.id)}>Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!showForm && <button className="fab" onClick={() => setShowForm(true)}>+</button>}
        </>
      )}

      {/* === CUSTOMERS TAB === */}
      {tab === 'customers' && (
        <>
          {customerSummaries.length === 0 ? (
            <div className="empty"><div className="empty-icon">👥</div><p className="empty-text">No customer data yet</p><p className="text-xs text-muted">Add a customer name when recording sales to track repeat orders</p></div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {customerSummaries.map(c => (
                <div key={c.name} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  {/* Customer header — tap to expand */}
                  <div
                    style={{ padding: '12px 14px', cursor: 'pointer' }}
                    onClick={() => setExpandedCustomer(expandedCustomer === c.name ? null : c.name)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p style={{ fontWeight: 700 }}>👤 {c.name}</p>
                        <p className="text-xs text-muted">{c.orders.length} order{c.orders.length !== 1 ? 's' : ''} · {c.totalQty} units total</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 800, color: 'var(--buy)' }}>₱{c.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <span className="text-xs text-muted">{expandedCustomer === c.name ? '▲' : '▼'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded order list */}
                  {expandedCustomer === c.name && (
                    <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
                      {/* Order list header */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 6, padding: '8px 14px', borderBottom: '1px solid var(--border)' }}>
                        <span className="text-xs font-bold text-muted">Date</span>
                        <span className="text-xs font-bold text-muted" style={{ width: 80, textAlign: 'right' }}>Item</span>
                        <span className="text-xs font-bold text-muted" style={{ width: 40, textAlign: 'right' }}>Qty</span>
                        <span className="text-xs font-bold text-muted" style={{ width: 70, textAlign: 'right' }}>Amount</span>
                      </div>
                      {c.orders.map((order, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 6, padding: '8px 14px', borderBottom: i < c.orders.length - 1 ? '1px solid var(--border)' : 'none' }}>
                          <span className="text-xs">{order.date}</span>
                          <span className="text-xs" style={{ width: 80, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.item}</span>
                          <span className="text-xs font-bold" style={{ width: 40, textAlign: 'right' }}>{order.qty}</span>
                          <span className="text-xs font-bold" style={{ width: 70, textAlign: 'right', color: 'var(--buy)' }}>₱{order.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                      {/* Totals row */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 6, padding: '10px 14px', background: '#e8f5e9', fontWeight: 700 }}>
                        <span className="text-xs">TOTAL</span>
                        <span className="text-xs" style={{ width: 80 }}></span>
                        <span className="text-xs" style={{ width: 40, textAlign: 'right' }}>{c.totalQty}</span>
                        <span className="text-xs" style={{ width: 70, textAlign: 'right', color: 'var(--buy)' }}>₱{c.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
