import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', varietyId: '', pricePerKg: '', quantityKg: '', minOrderKg: '', grade: '', moisture: '', location: '' });

  const set = (key: string) => (e: any) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert('Backend not connected — deploy the server to create listings');
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>New Listing</h1>
      <form onSubmit={handleSubmit}>
        <div className="field"><label>Title *</label><input value={form.title} onChange={set('title')} required placeholder="Premium Jasmine Rice Grade A" /></div>
        <div className="field"><label>Description</label><textarea value={form.description} onChange={set('description')} rows={3} placeholder="Quality details…" /></div>
        <div className="field"><label>Rice Variety *</label>
          <select value={form.varietyId} onChange={set('varietyId')}>
            <option value="jasmine">Jasmine Rice</option>
            <option value="basmati">Basmati Rice</option>
            <option value="parboiled">Parboiled Rice</option>
            <option value="brown">Brown Rice</option>
          </select>
        </div>
        <div className="row-2">
          <div className="field"><label>Price/kg (USD) *</label><input value={form.pricePerKg} onChange={set('pricePerKg')} type="number" step="0.0001" placeholder="1.8500" /></div>
          <div className="field"><label>Quantity (kg) *</label><input value={form.quantityKg} onChange={set('quantityKg')} type="number" step="0.01" placeholder="50000" /></div>
        </div>
        <div className="row-2">
          <div className="field"><label>Min. order (kg)</label><input value={form.minOrderKg} onChange={set('minOrderKg')} type="number" placeholder="1000" /></div>
          <div className="field"><label>Grade</label><input value={form.grade} onChange={set('grade')} placeholder="Grade A" /></div>
        </div>
        <div className="row-2">
          <div className="field"><label>Moisture (%)</label><input value={form.moisture} onChange={set('moisture')} type="number" step="0.1" placeholder="14.0" /></div>
          <div className="field"><label>Location</label><input value={form.location} onChange={set('location')} placeholder="City, Country" /></div>
        </div>
        <button type="submit" className="btn btn-primary btn-full">Create Listing</button>
        <button type="button" className="btn btn-ghost btn-full mt-1" onClick={() => navigate('/listings')}>Cancel</button>
      </form>
    </div>
  );
}
