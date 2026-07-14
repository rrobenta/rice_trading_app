import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'TRADER', label: 'Trader' },
  { value: 'BUYER', label: 'Buyer' },
  { value: 'SUPPLIER', label: 'Supplier' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'TRADER', company: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (e: any) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setError('');
    setLoading(true);
    try {
      await register({ ...form, email: form.email.toLowerCase().trim() });
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo">🌾</div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-sub">Join the rice trading platform</p>
        <form onSubmit={handleSubmit}>
          <div className="row-2">
            <div className="field"><label>Full Name *</label><input value={form.name} onChange={set('name')} required placeholder="Your name" /></div>
            <div className="field">
              <label>Role</label>
              <select value={form.role} onChange={set('role')}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>
          <div className="field"><label>Company (optional)</label><input value={form.company} onChange={set('company')} placeholder="Company name" /></div>
          <div className="field"><label>Email *</label><input type="email" value={form.email} onChange={set('email')} required placeholder="you@example.com" /></div>
          <div className="field"><label>Password *</label><input type="password" value={form.password} onChange={set('password')} required placeholder="Min. 8 characters" minLength={8} /></div>
          {error && <p style={{ color: 'var(--danger)', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{error}</p>}
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>{loading ? 'Creating…' : 'Create Account'}</button>
        </form>
        <p className="text-sm text-muted text-center mt-2">Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link></p>
      </div>
    </div>
  );
}
