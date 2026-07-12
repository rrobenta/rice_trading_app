import { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { RiceVariety } from '../types';

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [varieties, setVarieties] = useState<RiceVariety[]>([]);
  const [form, setForm] = useState({
    type: searchParams.get('type') || 'BUY',
    varietyId: searchParams.get('varietyId') || '',
    pricePerKg: searchParams.get('pricePerKg') || '',
    quantityKg: '',
    notes: '',
    expiresAt: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/market/varieties').then((r) => {
      setVarieties(r.data);
      if (!form.varietyId && r.data.length > 0) {
        setForm(f => ({ ...f, varietyId: r.data[0].id }));
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/orders', form);
      navigate('/orders');
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const selectedVariety = varieties.find(v => v.id === form.varietyId);

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Place Order</h1>

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label>Order Type *</label>
          <div className="flex gap-1">
            {(['BUY', 'SELL'] as const).map((t) => (
              <button key={t} type="button"
                className={`btn ${form.type === t ? (t === 'BUY' ? 'btn-primary' : 'btn-danger') : 'btn-outline'}`}
                onClick={() => setForm({ ...form, type: t })}
                style={{ flex: 1 }}
              >
                {t === 'BUY' ? '↑ Buy Order' : '↓ Sell Order'}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="varietyId">Rice Variety *</label>
          <select id="varietyId" name="varietyId" value={form.varietyId} onChange={handleChange} required>
            {varieties.map((v) => <option key={v.id} value={v.id}>{v.name}{v.origin ? ` (${v.origin})` : ''}</option>)}
          </select>
          {selectedVariety?.description && <p className="text-sm text-muted">{selectedVariety.description}</p>}
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label htmlFor="pricePerKg">Price per kg (USD) *</label>
            <input id="pricePerKg" name="pricePerKg" value={form.pricePerKg} onChange={handleChange} required type="number" step="0.0001" min="0.0001" placeholder="1.8500" />
          </div>
          <div className="form-group">
            <label htmlFor="quantityKg">Quantity (kg) *</label>
            <input id="quantityKg" name="quantityKg" value={form.quantityKg} onChange={handleChange} required type="number" step="0.01" min="1" placeholder="1000" />
          </div>
        </div>

        {form.pricePerKg && form.quantityKg && (
          <div className="card" style={{ background: 'var(--color-bg)', marginBottom: '1rem', padding: '0.75rem 1rem' }}>
            <p className="text-sm text-muted">Estimated total</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              ${(parseFloat(form.pricePerKg) * parseFloat(form.quantityKg)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="expiresAt">Expiry date (optional)</label>
          <input id="expiresAt" name="expiresAt" value={form.expiresAt} onChange={handleChange} type="datetime-local" />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea id="notes" name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Any additional requirements…" style={{ resize: 'vertical' }} />
        </div>

        {error && <p className="error-msg mb-2">{error}</p>}

        <div className="flex gap-1">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Placing order…' : `Place ${form.type} Order`}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/orders')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
