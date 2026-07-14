import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.toLowerCase().trim(), password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo">🌾</div>
        <h1 className="auth-title">RiceMarket</h1>
        <p className="auth-sub">Sign in to your trading account</p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
          </div>
          {error && <p className="field err" style={{ color: 'var(--danger)', fontSize: 13, textAlign: 'center' }}>{error}</p>}
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="text-sm text-muted text-center mt-2">
          No account? <Link to="/register" style={{ fontWeight: 600 }}>Create one</Link>
        </p>
        <div style={{ marginTop: 16, background: '#e8f5e9', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
          <p className="text-xs font-bold" style={{ color: 'var(--primary-dark)' }}>Demo Accounts</p>
          <p className="text-xs text-muted">supplier@example.com · buyer@example.com</p>
          <p className="text-xs text-muted">Password: password123</p>
        </div>
      </div>
    </div>
  );
}
