import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('alice@acme.com');
  const [password, setPassword] = useState('password');
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch {
      // error surfaced via context
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <form onSubmit={submit} className="card" style={{ width: 360, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: '1.6rem' }}>🚚</div>
          <h1 style={{ fontSize: '1.15rem', margin: '8px 0 2px' }}>FMS Delivery Control Center</h1>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Due Date Delivery & Project Health Management</div>
        </div>
        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 10, borderRadius: 6, marginBottom: 12, fontSize: '0.85rem' }}>{error}</div>}
        <div className="form-field" style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>
        <div className="form-field" style={{ marginBottom: 20 }}>
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: 16, textAlign: 'center' }}>
          Seeded accounts (password: <b>password</b>): alice@acme.com (Admin), maya@acme.com (Manager), helen@acme.com (HR), john@acme.com (Employee)
        </div>
      </form>
    </div>
  );
}
