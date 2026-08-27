import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { login as authLogin } from '../services/authService';

/**
 * Admin login page. On success it stores the JWT + user in the auth context and
 * routes admins to the Admin Portal. A developer token field is provided so the
 * portal can be reviewed before the backend /api/auth/login (FR-02) is live.
 * @returns {JSX.Element} The login page.
 */
function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showDev, setShowDev] = useState(false);
  const [devToken, setDevToken] = useState('');

  const redirectForRole = (user) => {
    if (user && user.role === 'admin') {
      navigate('/admin', { replace: true });
      return;
    }
    navigate('/', { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await authLogin(email, password);
      if (res && res.token) {
        setAuth(res.token, res.user || { email, role: 'admin', name: email });
        redirectForRole(res.user);
        return;
      }
      setError('Login succeeded but no token was returned.');
    } catch (err) {
      setError(err.message || 'Login failed. Is the backend auth service running?');
    } finally {
      setBusy(false);
    }
  };

  const handleDevLogin = (event) => {
    event.preventDefault();
    if (!devToken.trim()) {
      setError('Enter an admin JWT to continue.');
      return;
    }
    setAuth(devToken.trim(), { email: 'admin@sweep.eco', role: 'admin', name: 'Super Admin' });
    navigate('/admin', { replace: true });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f4', padding: 20 }}>
      <div style={{ width: 380, background: '#fff', borderRadius: 14, border: '1px solid #e8eef0', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>S</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>SWEEP Admin</div>
        </div>
        <p style={{ fontSize: 13.5, color: '#64748b', margin: '0 0 20px' }}>Sign in to the Admin Portal</p>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle} htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="admin@sweep.eco" required />

          <label style={labelStyle} htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} placeholder="••••••••" required />

          {error && <div style={{ background: '#fef2f2', color: '#dc2626', fontSize: 12.5, padding: '8px 10px', borderRadius: 8, marginBottom: 12, border: '1px solid #fecaca' }}>{error}</div>}

          <button type="submit" disabled={busy} style={{ width: '100%', padding: '10px 16px', borderRadius: 8, border: '1px solid #065f46', background: '#065f46', color: '#fff', fontWeight: 600, fontSize: 14, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.6 : 1, fontFamily: 'inherit' }}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: 16, fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
          <button type="button" onClick={() => setShowDev((v) => !v)} style={{ background: 'none', border: 'none', color: '#065f46', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
            {showDev ? 'Hide developer access' : 'Have an admin JWT?'}
          </button>
        </div>

        {showDev && (
          <form onSubmit={handleDevLogin} style={{ marginTop: 10 }}>
            <input value={devToken} onChange={(e) => setDevToken(e.target.value)} style={{ ...inputStyle, fontFamily: "'DM Mono', monospace", fontSize: 12 }} placeholder="Paste admin JWT" />
            <button type="submit" style={{ width: '100%', marginTop: 8, padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#334155', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              Enter Admin Portal
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: 12.5,
  fontWeight: 600,
  color: '#475569',
  marginBottom: 6,
};

const inputStyle = {
  width: '100%',
  height: 40,
  padding: '0 12px',
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  background: '#fff',
  fontSize: 13.5,
  color: '#0f172a',
  outline: 'none',
  fontFamily: 'inherit',
  marginBottom: 14,
  boxSizing: 'border-box',
};

export default Login;
