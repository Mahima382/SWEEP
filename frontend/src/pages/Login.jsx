import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { login as authLogin } from '../services/authService';

/**
 * Login page matching the frontend-reference LoginPage (FR-02, FR-12).
 * Handles: credentials, remember me, suspended/banned states,
 * forgot password link, loading state, error messages.
 * @returns {JSX.Element} The login page.
 */
function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [authState, setAuthState] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const redirectForRole = (role) => {
    if (role === 'admin') {
      navigate('/admin', { replace: true });
      return;
    }
    if (role === 'collector') {
      navigate('/collector', { replace: true });
      return;
    }
    if (role === 'company') {
      navigate('/company', { replace: true });
      return;
    }
    if (role === 'household') {
      navigate('/household', { replace: true });
      return;
    }
    navigate('/', { replace: true });
  };

  const handleSubmit = async (event) => {
    if (event) { event.preventDefault(); }
    if (!email || !password) { return; }
    setAuthState('loading');
    setErrorMsg('');
    try {
      const res = await authLogin(email, password, remember);
      if (res && res.token) {
        setAuth(res.token, { email, role: res.role, name: email });
        redirectForRole(res.role);
        return;
      }
      setAuthState('error');
      setErrorMsg('Login succeeded but no token was returned.');
    } catch (err) {
      if (err.status === 403) {
        const msg = (err.message || '').toLowerCase();
        if (msg.includes('suspended') || msg.includes('restricted')) {
          setAuthState('suspended');
          return;
        }
        if (msg.includes('banned') || msg.includes('permanently')) {
          setAuthState('banned');
          return;
        }
        if (msg.includes('locked')) {
          setAuthState('error');
          setErrorMsg(
            'Account temporarily locked due to too many failed attempts. '
            + 'Please try again in 15 minutes.',
          );
          return;
        }
        if (msg.includes('deactivated') || msg.includes('kyc')) {
          setAuthState('error');
          setErrorMsg(err.message);
          return;
        }
        setAuthState('error');
        setErrorMsg(err.message || 'Access denied.');
        return;
      }
      setAuthState('error');
      setErrorMsg(
        err.message
        || 'The email/phone or password is incorrect. Please try again.',
      );
    }
  };

  const inputFieldStyle = (hasError) => ({
    width: '100%',
    height: 42,
    padding: '0 14px',
    borderRadius: 9,
    border: `1px solid ${hasError ? '#fca5a5' : '#e2e8f0'}`,
    background: hasError ? '#fef2f2' : '#fff',
    fontSize: 14,
    color: '#0f172a',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box',
  });

  const isError = authState === 'error';

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#f1f5f4',
      overflow: 'hidden',
    }}
    >
      {/* LEFT — Branding Panel */}
      <div style={{
        width: '46%',
        flexShrink: 0,
        background: 'linear-gradient(155deg, #022c22 0%, #065f46 55%, #0d9488 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 52px',
        position: 'relative',
        overflow: 'hidden',
      }}
      >
        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.05)',
            top: -100,
            right: -150,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 350,
            height: 350,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.05)',
            bottom: -80,
            left: -80,
          }}
        />

        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 48,
          }}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: 18,
            }}
            >
              S
            </div>
            <div>
              <div style={{
                color: '#fff',
                fontWeight: 800,
                fontSize: 22,
                letterSpacing: '-0.5px',
                lineHeight: 1,
              }}
              >
                SWEEP
              </div>
              <div style={{
                color: '#6ee7b7',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.05em',
                marginTop: 2,
              }}
              >
                Smart Waste Exchange &amp; Eco Platform
              </div>
            </div>
          </div>

          <h2 style={{
            margin: '0 0 12px',
            fontSize: 30,
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.8px',
            lineHeight: 1.2,
          }}
          >
            Turning waste into value
            <br />
            through a smarter
            <br />
            circular economy.
          </h2>
          <p style={{
            margin: '0 0 40px',
            fontSize: 14.5,
            color: '#a7f3d0',
            lineHeight: 1.7,
          }}
          >
            Connect households, collectors, and recyclers on one unified
            platform. Track every kilogram from pickup to processing.
          </p>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', gap: 0 }}>
          {[
            { value: '12,400+ kg', label: 'waste recycled' },
            { value: '2,850+', label: 'collections completed' },
            { value: '4.8 ★', label: 'collector rating' },
          ].map((m, i) => (
            <div
              key={m.label}
              style={{
                flex: 1,
                padding: '14px 0',
                borderLeft:
                  i > 0
                    ? '1px solid rgba(255,255,255,0.12)'
                    : 'none',
                paddingLeft: i > 0 ? 20 : 0,
              }}
            >
              <div style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 18,
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.3px',
              }}
              >
                {m.value}
              </div>
              <div style={{
                fontSize: 11.5,
                color: '#6ee7b7',
                marginTop: 2,
              }}
              >
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Login Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 48px',
      }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{
              margin: '0 0 6px',
              fontSize: 26,
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.5px',
            }}
            >
              Welcome back
            </h1>
            <p style={{
              margin: 0,
              fontSize: 14.5,
              color: '#64748b',
            }}
            >
              Sign in to your SWEEP account
            </p>
          </div>

          {/* Error states */}
          {isError && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 18,
              fontSize: 13.5,
              color: '#dc2626',
              display: 'flex',
              gap: 8,
            }}
            >
              <span>⚠️</span>
              {errorMsg || 'The email/phone or password is incorrect. Please try again.'}
            </div>
          )}
          {authState === 'suspended' && (
            <div style={{
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 18,
              fontSize: 13.5,
              color: '#c2410c',
            }}
            >
              {'🚫 Your account has been suspended. Please contact '}
              <strong>SWEEP support</strong>
              {' for assistance.'}
            </div>
          )}
          {authState === 'banned' && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 18,
              fontSize: 13.5,
              color: '#b91c1c',
            }}
            >
              🔒 Your account access has been permanently restricted.
              Contact support if you believe this is an error.
            </div>
          )}

          {/* Email */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label
                htmlFor="login-email"
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#374151',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Email or Phone Number
                <input
                  id="login-email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (authState !== 'idle') { setAuthState('idle'); }
                  }}
                  placeholder="you@example.com or 01XXXXXXXXX"
                  type="email"
                  style={{
                    ...inputFieldStyle(isError),
                    display: 'block',
                    marginTop: 6,
                  }}
                />
              </label>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 8 }}>
              <label
                htmlFor="login-password"
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#374151',
                  display: 'block',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                }}
                >
                  <span>Password</span>
                  <Link
                    to="/forgot-password"
                    style={{
                      fontSize: 12.5,
                      color: '#065f46',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontWeight: 500,
                      textDecoration: 'none',
                    }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPw ? 'text' : 'password'}
                    placeholder="Enter your password"
                    style={{
                      ...inputFieldStyle(isError),
                      paddingRight: 42,
                      display: 'block',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 15,
                      color: '#94a3b8',
                    }}
                  >
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>
              </label>
            </div>

            {/* Remember me */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 24,
            }}
            >
              <label
                htmlFor="login-remember"
                style={{
                  fontSize: 13,
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <input
                  id="login-remember"
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember((r) => !r)}
                  style={{
                    width: 16,
                    height: 16,
                    accentColor: '#065f46',
                    cursor: 'pointer',
                  }}
                />
                Remember me for 30 days
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={authState === 'loading' || !email || !password}
              style={{
                width: '100%',
                height: 44,
                borderRadius: 10,
                background:
                  authState === 'loading' || !email || !password
                    ? '#6ee7b7'
                    : '#065f46',
                border: 'none',
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                cursor:
                  authState === 'loading' || !email || !password
                    ? 'not-allowed'
                    : 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {authState === 'loading' ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            marginTop: 20,
            fontSize: 13.5,
            color: '#64748b',
          }}
          >
            {'Don\'t have an account? '}
            <Link
              to="/register"
              style={{
                color: '#065f46',
                fontWeight: 700,
                fontSize: 13.5,
                textDecoration: 'none',
              }}
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
