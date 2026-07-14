import { useState, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const [form, setForm] = useState({
    type: sp.get('type') || 'BUY',
    pricePerKg: sp.get('pricePerKg') || '',
    quantityKg: '',
    notes: '',
  });

  const set = (key: string) => (e: any) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert('Backend not connected — deploy the server to place orders');
  };

  const total = form.pricePerKg && form.quantityKg ? parseFloat(form.pricePerKg) * parseFloat(form.quantityKg) : null;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Place Order</h1>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-1 mb-2">
          {(['BUY', 'SELL'] as const).map(t => (
            <button key={t} type="button" className={`btn btn-full${form.type === t ? (t === 'BUY' ? ' btn-buy' : ' btn-sell') : ' btn-outline'}`} onClick={() => setForm(f => ({ ...f, type: t }))}>
              {t === 'BUY' ? '↑ Buy' : '↓ Sell'}
            </button>
          ))}
        </div>

        <div className="field">
          <label>Rice Variety</label>
          <select>
            <option>Jasmine Rice (Thailand)</option>
            <option>Basmati Rice (India)</option>
            <option>Parboiled Rice</option>
            <option>Brown Rice</option>
          </select>
        </div>

        <div className="row-2">
          <div className="field"><label>Price/kg (USD)</label><input value={form.pricePerKg} onChange={set('pricePerKg')} type="number" step="0.0001" placeholder="1.8500" /></div>
          <div className="field"><label>Quantity (kg)</label><input value={form.quantityKg} onChange={set('quantityKg')} type="number" step="0.01" placeholder="1000" /></div>
        </div>

        {total !== null && !isNaN(total) && (
          <div className="card mb-2" style={{ background: form.type === 'BUY' ? '#e8f5e9' : '#ffe8e8', textAlign: 'center' }}>
            <p className="text-xs text-muted">Estimated total</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: form.type === 'BUY' ? 'var(--buy)' : 'var(--sell)' }}>${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        )}

        <div className="field"><label>Notes</label><textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="Requirements…" /></div>

        <button type="submit" className={`btn btn-full${form.type === 'BUY' ? ' btn-buy' : ' btn-sell'}`}>
          Place {form.type} Order
        </button>
        <button type="button" className="btn btn-ghost btn-full mt-1" onClick={() => navigate('/orders')}>Cancel</button>
      </form>
    </div>
  );
}
