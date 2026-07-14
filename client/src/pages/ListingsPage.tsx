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

interface ExpenseItem {
  id: string;
  description: string;
  amount: string;
  date: string;
}

export default function ListingsPage() {
  const [tab, setTab] = useState<'listings' | 'expenses'>('listings');
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ListingItem | null>(null);

  // Expense form
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', date: '' });
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editExpenseForm, setEditExpenseForm] = useState<ExpenseItem | null>(null);

  // --- Listings logic ---
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

  // --- Expenses logic ---
  const handleAddExpense = () => {
    if (!expenseForm.description || !expenseForm.amount || !expenseForm.date) return;
    const newExpense: ExpenseItem = {
      id: Date.now().toString(),
      description: expenseForm.description,
      amount: expenseForm.amount,
      date: expenseForm.date,
    };
    setExpenses(prev => [newExpense, ...prev]);
    setExpenseForm({ description: '', amount: '', date: '' });
    setShowExpenseForm(false);
  };

  const handleDeleteExpense = (id: string) => {
    if (!confirm('Delete this expense?')) return;
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const handleEditExpense = (item: ExpenseItem) => {
    setEditingExpenseId(item.id);
    setEditExpenseForm({ ...item });
  };

  const handleSaveExpense = () => {
    if (!editExpenseForm) return;
    setExpenses(prev => prev.map(e => e.id === editExpenseForm.id ? editExpenseForm : e));
    setEditingExpenseId(null);
    setEditExpenseForm(null);
  };

  const handleCancelExpense = () => {
    setEditingExpenseId(null);
    setEditExpenseForm(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Inventory</h1>
        {tab === 'listings' && <Link to="/listings/new" className="btn btn-primary btn-sm">+ New</Link>}
        {tab === 'expenses' && <button className="btn btn-primary btn-sm" onClick={() => setShowExpenseForm(true)}>+ Expense</button>}
      </div>

      {/* Segment control */}
      <div className="segment-ctrl mb-2">
        <button className={`segment-btn${tab === 'listings' ? ' active' : ''}`} onClick={() => setTab('listings')}>Listings</button>
        <button className={`segment-btn${tab === 'expenses' ? ' active' : ''}`} onClick={() => setTab('expenses')}>Expenses</button>
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
                      <div className="field"><label>Batch Date</label><input type="date" value={editForm.batchDate} onChange={setField('batchDate')} /></div>
                      <div className="flex gap-1">
                        <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
                        <button className="btn btn-ghost btn-sm" onClick={handleCancel}>Cancel</button>
                      </div>
                    </div>
                  ) : (
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
        </>
      )}

      {/* === EXPENSES TAB === */}
      {tab === 'expenses' && (
        <>
          {/* Add expense form */}
          {showExpenseForm && (
            <div className="card mb-2">
              <p className="text-sm font-bold mb-1">New Expense</p>
              <div className="field"><label>Description</label><input value={expenseForm.description} onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Delivery, Trucking, Sacks" /></div>
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

          {/* Total expenses */}
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
                        <button className="btn btn-ghost btn-sm" onClick={handleCancelExpense}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center">
                        <p style={{ fontWeight: 600 }}>{exp.description}</p>
                        <p style={{ fontWeight: 800, color: 'var(--sell)' }}>₱{parseFloat(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted">{new Date(exp.date).toLocaleDateString()}</span>
                        <div className="flex gap-1">
                          <button className="btn btn-outline btn-sm" onClick={() => handleEditExpense(exp)}>Edit</button>
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
    </div>
  );
}
