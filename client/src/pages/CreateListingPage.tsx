import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', photo: '', sellPrice: '', boughtFor: '', quantity: '', batchDate: '' });
  const [preview, setPreview] = useState<string | null>(null);

  const set = (key: string) => (e: any) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setForm(f => ({ ...f, photo: file.name }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert('Backend not connected — deploy the server to create listings');
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>New Listing</h1>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Title *</label>
          <input value={form.title} onChange={set('title')} required placeholder="e.g. Jasmine Rice 50kg Sack" />
        </div>

        <div className="field">
          <label>Photo</label>
          <input type="file" accept="image/*" onChange={handlePhoto} style={{ padding: 8 }} />
          {preview && (
            <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />
          )}
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
              ${(parseFloat(form.sellPrice || '0') - parseFloat(form.boughtFor || '0')).toFixed(2)}
            </p>
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-full">Create Listing</button>
        <button type="button" className="btn btn-ghost btn-full mt-1" onClick={() => navigate('/listings')}>Cancel</button>
      </form>
    </div>
  );
}
