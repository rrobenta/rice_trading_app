import { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { RiceVariety } from '../types';

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const [varieties, setVarieties] = useState<RiceVariety[]>([]);
  const [form, setForm] = useState({
    type: sp.get('type') || 'BUY',
    varietyId: sp.get('varietyId') || '',
    pricePerKg: sp.get('pricePerKg') || '',
    quantityKg: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/market/varieties').then(r => {
      setVarieties(r.data);
      if (!form.varietyId && r.data.length) setForm(f => ({ ...f, varietyId: r.data[0].id }));
    });
  }, []);

  const set = (key: string) => (e: any) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/orders', form);
      navigate('/orders');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const total = form.pricePerKg && form.quantityKg ? parseFloat(form.pricePerKg) * parseFloat(form.quantityKg) : null;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Place Order</h1>
      <form onSubmit={handleSubmit}>
        {/* Type toggle */}
        <div className="flex gap-1 mb-2">
          {(['BUY', 'SELL'] as const).map(t => (
            <button key={t} type="button" className={`btn btn-full${form.type === t ? (t === 'BUY' ? ' btn-buy' : ' btn-sell') : ' btn-outline'}`} onClick={() => setForm(f => ({ ...f, type: t }))}>
              {t === 'BUY' ? '↑ Buy' : '↓ Sell'}
            </button>
          ))}
        </div>

        <div className="field">
          <label>Rice Variety</label>
          <select value={form.varietyId} onChange={set('varietyId')} required>
            {varieties.map(v => <option key={v.id} value={v.id}>{v.name}{v.origin ? ` (${v.origin})` : ''}</option>)}
          </select>
        </div>

        <div className="row-2">
          <div className="field"><label>Price/kg (USD)</label><input value={form.pricePerKg} onChange={set('pricePerKg')} required type="number" step="0.0001" min="0.0001" placeholder="1.8500" /></div>
          <div className="field"><label>Quantity (kg)</label><input value={form.quantityKg} onChange={set('quantityKg')} required type="number" step="0.01" min="1" placeholder="1000" /></div>
        </div>

        {total !== null && !isNaN(total) && (
          <div className="card mb-2" style={{ background: form.type === 'BUY' ? '#e8f5e9' : '#ffe8e8', textAlign: 'center' }}>
            <p className="text-xs text-muted">Estimated total</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: form.type === 'BUY' ? 'var(--buy)' : 'var(--sell)' }}>${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        )}

        <div className="field"><label>Notes</label><textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="Requirements…" /></div>

        {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <button type="submit" className={`btn btn-full${form.type === 'BUY' ? ' btn-buy' : ' btn-sell'}`} disabled={loading}>
          {loading ? 'Placing…' : `Place ${form.type} Order`}
        </button>
        <button type="button" className="btn btn-ghost btn-full mt-1" onClick={() => navigate('/orders')}>Cancel</button>
      </form>
    </div>
  );
}
