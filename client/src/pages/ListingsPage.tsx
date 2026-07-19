import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  boughtFor: string;
  quantity: string;
  batchDate: string;
}

interface ExpenseItem {
  id: string;
  description: string;
  amount: string;
  date: string;
}

interface CapitalItem {
  id: string;
  description: string;
  amount: string;
  date: string;
}

export default function ListingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'listings' | 'expenses' | 'capital'>('listings');

  // Listings
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ListingItem | null>(null);
  const [addStockId, setAddStockId] = useState<string | null>(null);
  const [addStockQty, setAddStockQty] = useState('');

  // Expenses
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', date: '' });
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editExpenseForm, setEditExpenseForm] = useState<ExpenseItem | null>(null);

  // Capital
  const [capitals, setCapitals] = useState<CapitalItem[]>([]);
  const [showCapitalForm, setShowCapitalForm] = useState(false);
  const [capitalForm, setCapitalForm] = useState({ description: '', amount: '', date: '' });
  const [editingCapitalId, setEditingCapitalId] = useState<string | null>(null);
  const [editCapitalForm, setEditCapitalForm] = useState<CapitalItem | null>(null);

  // === Firestore listeners ===
  useEffect(() => {
    if (!user) return;

    const unsubListings = onSnapshot(
      query(collection(db, 'listings'), where('storeId', '==', STORE_ID), orderBy('createdAt', 'desc')),
      (snap) => setListings(snap.docs.map(d => ({ id: d.id, ...d.data() } as ListingItem)))
    );

    const unsubExpenses = onSnapshot(
      query(collection(db, 'expenses'), where('storeId', '==', STORE_ID), orderBy('createdAt', 'desc')),
      (snap) => setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() } as ExpenseItem)))
    );

    const unsubCapitals = onSnapshot(
      query(collection(db, 'capitals'), where('storeId', '==', STORE_ID), orderBy('createdAt', 'desc')),
      (snap) => setCapitals(snap.docs.map(d => ({ id: d.id, ...d.data() } as CapitalItem)))
    );

    return () => { unsubListings(); unsubExpenses(); unsubCapitals(); };
  }, [user]);

  // === Listings CRUD ===
  const handleDeleteListing = async (id: string) => {
    if (!confirm('Delete this listing?')) return;
    await deleteDoc(doc(db, 'listings', id));
  };

  const handleEditListing = (item: ListingItem) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleSaveListing = async () => {
    if (!editForm) return;
    const { id, ...data } = editForm;
    await updateDoc(doc(db, 'listings', id), data);
    setEditingId(null);
    setEditForm(null);
  };

  const handleAddStock = async (id: string, currentQty: string) => {
    const extra = parseInt(addStockQty, 10);
    if (!extra || extra <= 0) return;
    const newQty = (parseInt(currentQty || '0', 10) + extra).toString();
    await updateDoc(doc(db, 'listings', id), { quantity: newQty });
    setAddStockId(null);
    setAddStockQty('');
  };

  const setField = (key: keyof ListingItem) => (e: any) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [key]: e.target.value });
  };

  const filtered = search
    ? listings.filter(l => l.title.toLowerCase().includes(search.toLowerCase()))
    : listings;

  // === Expenses CRUD ===
  const handleAddExpense = async () => {
    if (!expenseForm.description || !expenseForm.amount || !expenseForm.date || !user) return;
    await addDoc(collection(db, 'expenses'), { ...expenseForm, storeId: STORE_ID, uid: user.uid, createdAt: new Date() });
    setExpenseForm({ description: '', amount: '', date: '' });
    setShowExpenseForm(false);
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    await deleteDoc(doc(db, 'expenses', id));
  };

  const handleSaveExpense = async () => {
    if (!editExpenseForm) return;
    const { id, ...data } = editExpenseForm;
    await updateDoc(doc(db, 'expenses', id), data);
    setEditingExpenseId(null);
    setEditExpenseForm(null);
  };

  // === Capital CRUD ===
  const handleAddCapital = async () => {
    if (!capitalForm.description || !capitalForm.amount || !capitalForm.date || !user) return;
    await addDoc(collection(db, 'capitals'), { ...capitalForm, storeId: STORE_ID, uid: user.uid, createdAt: new Date() });
    setCapitalForm({ description: '', amount: '', date: '' });
    setShowCapitalForm(false);
  };

  const handleDeleteCapital = async (id: string) => {
    if (!confirm('Delete this capital entry?')) return;
    await deleteDoc(doc(db, 'capitals', id));
  };

  const handleSaveCapital = async () => {
    if (!editCapitalForm) return;
    const { id, ...data } = editCapitalForm;
    await updateDoc(doc(db, 'capitals', id), data);
    setEditingCapitalId(null);
    setEditCapitalForm(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Inventory</h1>
        {tab === 'listings' && <Link to="/listings/new" className="btn btn-primary btn-sm">+ New</Link>}
        {tab === 'expenses' && <button className="btn btn-primary btn-sm" onClick={() => setShowExpenseForm(true)}>+ Expense</button>}
        {tab === 'capital' && <button className="btn btn-primary btn-sm" onClick={() => setShowCapitalForm(true)}>+ Capital</button>}
      </div>

      {/* Segment control */}
      <div className="segment-ctrl mb-2">
        <button className={`segment-btn${tab === 'listings' ? ' active' : ''}`} onClick={() => setTab('listings')}>Listings</button>
        <button className={`segment-btn${tab === 'expenses' ? ' active' : ''}`} onClick={() => setTab('expenses')}>Expenses</button>
        <button className={`segment-btn${tab === 'capital' ? ' active' : ''}`} onClick={() => setTab('capital')}>Capital</button>
      </div>

      {/* === LISTINGS TAB === */}
      {tab === 'listings' && (
        <>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings…" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 15, marginBottom: 12 }} />

          {filtered.length === 0 ? (
            <div className="empty"><div className="empty-icon">📭</div><p className="empty-text">No listings yet</p><Link to="/listings/new" className="btn btn-primary btn-sm mt-2">Add your first listing</Link></div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {filtered.map(l => (
                <div key={l.id} className="card">
                  {editingId === l.id && editForm ? (
                    <div>
                      <div className="field"><label>Title</label><input value={editForm.title} onChange={setField('title')} /></div>
                      <div className="row-2">
                        <div className="field"><label>Sell Price</label><input value={editForm.sellPrice} onChange={setField('sellPrice')} type="number" step="0.01" /></div>
                        <div className="field"><label>Bought For</label><input value={editForm.boughtFor} onChange={setField('boughtFor')} type="number" step="0.01" /></div>
                      </div>
                      <div className="row-2">
                        <div className="field"><label>Quantity</label><input value={editForm.quantity} onChange={setField('quantity')} type="number" min="1" /></div>
                        <div className="field"><label>Batch Date</label><input type="date" value={editForm.batchDate} onChange={setField('batchDate')} /></div>
                      </div>
                      <div className="flex gap-1">
                        <button className="btn btn-primary btn-sm" onClick={handleSaveListing}>Save</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditingId(null); setEditForm(null); }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontWeight: 700, marginBottom: 6 }}>{l.title}</p>
                      <div className="flex gap-2" style={{ marginBottom: 6 }}>
                        <span className="text-xs text-muted">Sell: <strong style={{ color: 'var(--buy)' }}>₱{parseFloat(l.sellPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></span>
                        <span className="text-xs text-muted">Cost: <strong>₱{parseFloat(l.boughtFor).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></span>
                        <span className="text-xs text-muted">Qty: <strong>{l.quantity}</strong></span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted">Batch: {l.batchDate}</span>
                        <span className={`badge ${parseFloat(l.sellPrice) > parseFloat(l.boughtFor) ? 'badge-green' : 'badge-red'}`}>
                          Profit: ₱{(parseFloat(l.sellPrice) - parseFloat(l.boughtFor)).toFixed(2)}
                        </span>
                      </div>
                      {/* Add Stock inline */}
                      {addStockId === l.id ? (
                        <div className="flex gap-1 items-center mt-1" style={{ background: 'var(--bg)', padding: '8px 10px', borderRadius: 8 }}>
                          <input value={addStockQty} onChange={e => setAddStockQty(e.target.value)} type="number" min="1" placeholder="Qty to add" style={{ flex: 1, padding: '6px 10px', border: '1.5px solid var(--border)', borderRadius: 6, fontSize: 14 }} />
                          <button className="btn btn-primary btn-sm" onClick={() => handleAddStock(l.id, l.quantity)}>Add</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => { setAddStockId(null); setAddStockQty(''); }}>✕</button>
                        </div>
                      ) : null}
                      <div className="flex gap-1 mt-1" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn btn-sm" style={{ background: 'var(--primary-light)', color: '#fff' }} onClick={() => { setAddStockId(l.id); setAddStockQty(''); }}>+ Stock</button>
                        <button className="btn btn-outline btn-sm" onClick={() => handleEditListing(l)}>Edit</button>
                        <button className="btn btn-sm" style={{ background: 'var(--danger)', color: '#fff' }} onClick={() => handleDeleteListing(l.id)}>Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <Link to="/listings/new" className="fab">+</Link>
        </>
      )}

      {/* === EXPENSES TAB === */}
      {tab === 'expenses' && (
        <>
          {showExpenseForm && (
            <div className="card mb-2">
              <p className="text-sm font-bold mb-1">New Expense</p>
              <div className="field"><label>Description</label><input value={expenseForm.description} onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Delivery, Trucking" /></div>
              <div className="row-2">
                <div className="field"><label>Amount</label><input value={expenseForm.amount} onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))} type="number" step="0.01" placeholder="0.00" /></div>
                <div className="field"><label>Date</label><input type="date" value={expenseForm.date} onChange={e => setExpenseForm(f => ({ ...f, date: e.target.value }))} /></div>
              </div>
              <div className="flex gap-1">
                <button className="btn btn-primary btn-sm" onClick={handleAddExpense}>Add</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowExpenseForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          {expenses.length > 0 && (
            <div className="card mb-2" style={{ background: '#ffe8e8', textAlign: 'center' }}>
              <p className="text-xs text-muted">Total Expenses</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--sell)' }}>
                ₱{expenses.reduce((sum, e) => sum + parseFloat(e.amount || '0'), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          {expenses.length === 0 ? (
            <div className="empty"><div className="empty-icon">🧾</div><p className="empty-text">No expenses recorded</p><button className="btn btn-primary btn-sm mt-2" onClick={() => setShowExpenseForm(true)}>Add your first expense</button></div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {expenses.map(exp => (
                <div key={exp.id} className="card">
                  {editingExpenseId === exp.id && editExpenseForm ? (
                    <div>
                      <div className="field"><label>Description</label><input value={editExpenseForm.description} onChange={e => setEditExpenseForm(f => f ? { ...f, description: e.target.value } : f)} /></div>
                      <div className="row-2">
                        <div className="field"><label>Amount</label><input value={editExpenseForm.amount} onChange={e => setEditExpenseForm(f => f ? { ...f, amount: e.target.value } : f)} type="number" step="0.01" /></div>
                        <div className="field"><label>Date</label><input type="date" value={editExpenseForm.date} onChange={e => setEditExpenseForm(f => f ? { ...f, date: e.target.value } : f)} /></div>
                      </div>
                      <div className="flex gap-1">
                        <button className="btn btn-primary btn-sm" onClick={handleSaveExpense}>Save</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditingExpenseId(null); setEditExpenseForm(null); }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center">
                        <p style={{ fontWeight: 600 }}>{exp.description}</p>
                        <p style={{ fontWeight: 800, color: 'var(--sell)' }}>₱{parseFloat(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted">{exp.date}</span>
                        <div className="flex gap-1">
                          <button className="btn btn-outline btn-sm" onClick={() => { setEditingExpenseId(exp.id); setEditExpenseForm({ ...exp }); }}>Edit</button>
                          <button className="btn btn-sm" style={{ background: 'var(--danger)', color: '#fff' }} onClick={() => handleDeleteExpense(exp.id)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!showExpenseForm && <button className="fab" onClick={() => setShowExpenseForm(true)}>+</button>}
        </>
      )}

      {/* === CAPITAL TAB === */}
      {tab === 'capital' && (
        <>
          {showCapitalForm && (
            <div className="card mb-2">
              <p className="text-sm font-bold mb-1">New Capital Entry</p>
              <div className="field"><label>Description</label><input value={capitalForm.description} onChange={e => setCapitalForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Initial investment, Loan" /></div>
              <div className="row-2">
                <div className="field"><label>Amount</label><input value={capitalForm.amount} onChange={e => setCapitalForm(f => ({ ...f, amount: e.target.value }))} type="number" step="0.01" placeholder="0.00" /></div>
                <div className="field"><label>Date</label><input type="date" value={capitalForm.date} onChange={e => setCapitalForm(f => ({ ...f, date: e.target.value }))} /></div>
              </div>
              <div className="flex gap-1">
                <button className="btn btn-primary btn-sm" onClick={handleAddCapital}>Add</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowCapitalForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          {capitals.length > 0 && (
            <div className="card mb-2" style={{ background: '#dbeafe', textAlign: 'center' }}>
              <p className="text-xs text-muted">Total Capital</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#1e40af' }}>
                ₱{capitals.reduce((sum, c) => sum + parseFloat(c.amount || '0'), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          {capitals.length === 0 ? (
            <div className="empty"><div className="empty-icon">💰</div><p className="empty-text">No capital recorded</p><button className="btn btn-primary btn-sm mt-2" onClick={() => setShowCapitalForm(true)}>Add your first capital entry</button></div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {capitals.map(cap => (
                <div key={cap.id} className="card">
                  {editingCapitalId === cap.id && editCapitalForm ? (
                    <div>
                      <div className="field"><label>Description</label><input value={editCapitalForm.description} onChange={e => setEditCapitalForm(f => f ? { ...f, description: e.target.value } : f)} /></div>
                      <div className="row-2">
                        <div className="field"><label>Amount</label><input value={editCapitalForm.amount} onChange={e => setEditCapitalForm(f => f ? { ...f, amount: e.target.value } : f)} type="number" step="0.01" /></div>
                        <div className="field"><label>Date</label><input type="date" value={editCapitalForm.date} onChange={e => setEditCapitalForm(f => f ? { ...f, date: e.target.value } : f)} /></div>
                      </div>
                      <div className="flex gap-1">
                        <button className="btn btn-primary btn-sm" onClick={handleSaveCapital}>Save</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditingCapitalId(null); setEditCapitalForm(null); }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center">
                        <p style={{ fontWeight: 600 }}>{cap.description}</p>
                        <p style={{ fontWeight: 800, color: '#1e40af' }}>₱{parseFloat(cap.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted">{cap.date}</span>
                        <div className="flex gap-1">
                          <button className="btn btn-outline btn-sm" onClick={() => { setEditingCapitalId(cap.id); setEditCapitalForm({ ...cap }); }}>Edit</button>
                          <button className="btn btn-sm" style={{ background: 'var(--danger)', color: '#fff' }} onClick={() => handleDeleteCapital(cap.id)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!showCapitalForm && <button className="fab" onClick={() => setShowCapitalForm(true)}>+</button>}
        </>
      )}
    </div>
  );
}
