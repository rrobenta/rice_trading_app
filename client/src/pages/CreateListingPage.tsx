import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { RiceVariety } from '../types';

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [varieties, setVarieties] = useState<RiceVariety[]>([]);
  const [form, setForm] = useState({
    title: '', description: '', pricePerKg: '', quantityKg: '', minOrderKg: '',
    grade: '', moisture: '', location: '', varietyId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/market/varieties').then((r) => {
      setVarieties(r.data);
      if (r.data.length > 0) setForm(f => ({ ...f, varietyId: r.data[0].id }));
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
      const res = await api.post('/listings', form);
      navigate(`/listings/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Create Listing</h1>

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input id="title" name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Premium Jasmine Rice Grade A" />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe the quality, harvest date, etc." style={{ resize: 'vertical' }} />
        </div>

        <div className="form-group">
          <label htmlFor="varietyId">Rice Variety *</label>
          <select id="varietyId" name="varietyId" value={form.varietyId} onChange={handleChange} required>
            {varieties.map((v) => <option key={v.id} value={v.id}>{v.name}{v.origin ? ` (${v.origin})` : ''}</option>)}
          </select>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label htmlFor="pricePerKg">Price per kg (USD) *</label>
            <input id="pricePerKg" name="pricePerKg" value={form.pricePerKg} onChange={handleChange} required type="number" step="0.0001" min="0" placeholder="1.8500" />
          </div>
          <div className="form-group">
            <label htmlFor="quantityKg">Total quantity (kg) *</label>
            <input id="quantityKg" name="quantityKg" value={form.quantityKg} onChange={handleChange} required type="number" step="0.01" min="1" placeholder="50000" />
          </div>
          <div className="form-group">
            <label htmlFor="minOrderKg">Min. order quantity (kg)</label>
            <input id="minOrderKg" name="minOrderKg" value={form.minOrderKg} onChange={handleChange} type="number" step="0.01" min="1" placeholder="1000" />
          </div>
          <div className="form-group">
            <label htmlFor="grade">Grade</label>
            <input id="grade" name="grade" value={form.grade} onChange={handleChange} placeholder="e.g. Grade A, Extra Long" />
          </div>
          <div className="form-group">
            <label htmlFor="moisture">Moisture content (%)</label>
            <input id="moisture" name="moisture" value={form.moisture} onChange={handleChange} type="number" step="0.1" min="0" max="100" placeholder="14.0" />
          </div>
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input id="location" name="location" value={form.location} onChange={handleChange} placeholder="City, Country" />
          </div>
        </div>

        {error && <p className="error-msg mb-2">{error}</p>}

        <div className="flex gap-1">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating…' : 'Create Listing'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/listings')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
