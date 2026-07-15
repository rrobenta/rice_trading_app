import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { STORE_ID } from '../lib/store';
import { useAuth } from '../context/AuthContext';

export default function CreateListingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ title: '', sellPrice: '', boughtFor: '', quantity: '', batchDate: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key: string) => (e: any) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setLoading(true);
    try {
      await addDoc(collection(db, 'listings'), {
        ...form,
        storeId: STORE_ID,
        uid: user.uid,
        createdAt: new Date(),
      });
      navigate('/listings');
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>New Listing</h1>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Title *</label>
          <input value={form.title} onChange={set('title')} required placeholder="e.g. Jasmine Rice 50kg Sack" />
        </div>

        <div className="row-2">
          <div className="field">
            <label>Sell Price *</label>
            <input value={form.sellPrice} onChange={set('sellPrice')} type="number" step="0.01" min="0" required placeholder="0.00" />
          </div>
          <div className="field">
            <label>Bought For *</label>
            <input value={form.boughtFor} onChange={set('boughtFor')} type="number" step="0.01" min="0" required placeholder="0.00" />
          </div>
        </div>

        <div className="field">
          <label>Quantity *</label>
          <input value={form.quantity} onChange={set('quantity')} type="number" min="1" required placeholder="e.g. 50" />
        </div>

        <div className="field">
          <label>Batch Date *</label>
          <input type="date" value={form.batchDate} onChange={set('batchDate')} required />
        </div>

        {form.sellPrice && form.boughtFor && (
          <div className="card mb-2" style={{ background: parseFloat(form.sellPrice) > parseFloat(form.boughtFor) ? '#e8f5e9' : '#ffe8e8', textAlign: 'center' }}>
            <p className="text-xs text-muted">Profit per unit</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: parseFloat(form.sellPrice) > parseFloat(form.boughtFor) ? 'var(--buy)' : 'var(--sell)' }}>
              ₱{(parseFloat(form.sellPrice || '0') - parseFloat(form.boughtFor || '0')).toFixed(2)}
            </p>
          </div>
        )}

        {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Creating…' : 'Create Listing'}
        </button>
        <button type="button" className="btn btn-ghost btn-full mt-1" onClick={() => navigate('/listings')}>Cancel</button>
      </form>
    </div>
  );
}
