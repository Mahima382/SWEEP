import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../services/authService';
import useAuth from '../hooks/useAuth';

const TOKEN_STORAGE_KEY = 'sweep_token';

/** Where each role lands after login (FR-02 role-based routing). */
const ROLE_ROUTES = {
  household: '/household',
  collector: '/collector',
  global: '/collector',
  company: '/company',
  admin: '/admin',
};

const fieldStyle = {
  width: '100%',
  height: 42,
  padding: '0 14px',
  borderRadius: 9,
  border: '1px solid #e2e8f0',
  background: '#fff',
  fontSize: 14,
  color: '#0f172a',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const labelStyle = {
  fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6,
};

/**
 * Validate the login form fields.
 * @param {object} form Current form values ({ email, password }).
 * @returns {object} Map of field name to error message, empty when valid.
 */
function validate(form) {
  const errors = {};
  if (!form.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!form.password) {
    errors.password = 'Password is required.';
  }
  return errors;
}

/**
 * Login page (FR-02): email/password sign-in with role-based redirect,
 * server-enforced 5-attempt lockout and suspended-account blocking.
 * @returns {JSX.Element} The login page.
 */
function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setField = (name) => (value) => setForm((f) => ({ ...f, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitError('');
    setSubmitting(true);
    try {
      const { token, user } = await loginRequest(form.email.trim(), form.password);
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      setUser(user);
      navigate(ROLE_ROUTES[user.role] || '/');
    } catch (err) {
      setSubmitError(err.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#f1f5f4', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px',
    }}
    >
      <div style={{ width: '100%', maxWidth: 420, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}
          >
            ♻️
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: '#0f172a' }}>SWEEP</span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16, border: '1px solid #e8eef0', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', padding: '32px 36px',
        }}
      >
        <h2 style={{
          margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: '#0f172a',
        }}
        >
          Log in to SWEEP
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: 13.5, color: '#64748b' }}>
          Enter your email and password to continue.
        </p>

        {submitError && (
          <p style={{
            margin: '0 0 16px', fontSize: 13, color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px',
          }}
          >
            {submitError}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="email" style={labelStyle}>
              Email Address
              {' '}
              <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={form.email}
              onChange={(e) => setField('email')(e.target.value)}
              style={{ ...fieldStyle, borderColor: errors.email ? '#ef4444' : fieldStyle.border }}
            />
            {errors.email && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#ef4444' }}>{errors.email}</p>}
          </div>

          <div>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="password" style={labelStyle}>
              Password
              {' '}
              <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setField('password')(e.target.value)}
                style={{
                  ...fieldStyle, paddingRight: 40, borderColor: errors.password ? '#ef4444' : fieldStyle.border,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
                }}
              >
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#ef4444' }}>{errors.password}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            marginTop: 24,
            padding: '11px 0',
            borderRadius: 9,
            border: 'none',
            background: '#065f46',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: submitting ? 'default' : 'pointer',
            opacity: submitting ? 0.7 : 1,
            fontFamily: 'inherit',
          }}
        >
          {submitting ? 'Logging in…' : 'Log In →'}
        </button>

        <p style={{
          margin: '18px 0 0', textAlign: 'center', fontSize: 13, color: '#64748b',
        }}
        >
          Don&apos;t have an account?
          {' '}
          <Link to="/register" style={{ color: '#065f46', fontWeight: 600, textDecoration: 'none' }}>
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
