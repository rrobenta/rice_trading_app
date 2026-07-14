import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { RiceVariety } from '../types';

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [varieties, setVarieties] = useState<RiceVariety[]>([]);
  const [form, setForm] = useState({ title: '', description: '', varietyId: '', pricePerKg: '', quantityKg: '', minOrderKg: '', grade: '', moisture: '', location: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/market/varieties').then(r => {
      setVarieties(r.data);
      if (r.data.length) setForm(f => ({ ...f, varietyId: r.data[0].id }));
    });
  }, []);

  const set = (key: string) => (e: any) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const r = await api.post('/listings', form);
      navigate(`/listings/${r.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>New Listing</h1>
      <form onSubmit={handleSubmit}>
        <div className="field"><label>Title *</label><input value={form.title} onChange={set('title')} required placeholder="Premium Jasmine Rice Grade A" /></div>
        <div className="field"><label>Description</label><textarea value={form.description} onChange={set('description')} rows={3} placeholder="Quality details…" /></div>
        <div className="field"><label>Rice Variety *</label>
          <select value={form.varietyId} onChange={set('varietyId')} required>
            {varieties.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div className="row-2">
          <div className="field"><label>Price/kg (USD) *</label><input value={form.pricePerKg} onChange={set('pricePerKg')} required type="number" step="0.0001" min="0" placeholder="1.8500" /></div>
          <div className="field"><label>Quantity (kg) *</label><input value={form.quantityKg} onChange={set('quantityKg')} required type="number" step="0.01" min="1" placeholder="50000" /></div>
        </div>
        <div className="row-2">
          <div className="field"><label>Min. order (kg)</label><input value={form.minOrderKg} onChange={set('minOrderKg')} type="number" step="0.01" placeholder="1000" /></div>
          <div className="field"><label>Grade</label><input value={form.grade} onChange={set('grade')} placeholder="Grade A" /></div>
        </div>
        <div className="row-2">
          <div className="field"><label>Moisture (%)</label><input value={form.moisture} onChange={set('moisture')} type="number" step="0.1" placeholder="14.0" /></div>
          <div className="field"><label>Location</label><input value={form.location} onChange={set('location')} placeholder="City, Country" /></div>
        </div>
        {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>{loading ? 'Creating…' : 'Create Listing'}</button>
        <button type="button" className="btn btn-ghost btn-full mt-1" onClick={() => navigate('/listings')}>Cancel</button>
      </form>
    </div>
  );
}
