/**
 * @fileoverview FR-02 — the login card itself (fields, validation, submit),
 * shared between the dedicated /login page and the landing page's embedded
 * login section. Owns its own state and navigation so either host page can
 * just drop it in.
 * @module LoginForm
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../../services/authService';
import useAuth from '../../hooks/useAuth';
import { ROLE_DASHBOARD_ROUTES } from '../../utils/constants';
import { fieldStyle, labelStyle } from './ProfileFormFields';

const TOKEN_STORAGE_KEY = 'sweep_token';

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
 * The login form card (FR-02): email/password sign-in with role-based
 * redirect, server-enforced 5-attempt lockout and suspended-account
 * blocking, and a link into the password-recovery flow (FR-12).
 * @returns {JSX.Element} The login form card.
 */
export default function LoginForm() {
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
      // Role-specific fields (NID, KYC docs, address, payout, etc.) are
      // collected post-login — see PROFILE_COMPLETION_SPEC.md.
      navigate(user.profileCompleted ? (ROLE_DASHBOARD_ROUTES[user.role] || '/') : '/complete-profile');
    } catch (err) {
      setSubmitError(err.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16, border: '1px solid #e8eef0', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: '32px 36px',
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
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6,
          }}
          >
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="password" style={{ ...labelStyle, marginBottom: 0 }}>
              Password
              {' '}
              <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <Link
              to="/forgot-password"
              style={{
                fontSize: 12.5, color: '#065f46', fontWeight: 600, textDecoration: 'none',
              }}
            >
              Forgot password?
            </Link>
          </div>
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
  );
}
