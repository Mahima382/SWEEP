import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resetPassword as resetPasswordRequest } from '../services/authService';
import { fieldStyle, labelStyle } from '../components/Auth/ProfileFormFields';

const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

/**
 * Validates the reset-password form fields.
 * @param {object} form Current form values ({ password, confirmPassword }).
 * @returns {object} Map of field name to error message, empty when valid.
 */
function validate(form) {
  const errors = {};
  if (!form.password) {
    errors.password = 'Password is required.';
  } else if (!PASSWORD_POLICY.test(form.password)) {
    errors.password = 'Min 8 characters, with an uppercase, lowercase, number and special character.';
  }
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }
  return errors;
}

/**
 * Reset-password page (FR-12): consumes the token from a forgot-password
 * link and sets a new password.
 * @returns {JSX.Element} The reset-password page.
 */
function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

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
      await resetPasswordRequest(token, form.password);
      setDone(true);
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
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
            width: 32, height: 32, borderRadius: 9, background: '#a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}
          >
            ♻️
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: '#0f172a' }}>SWEEP</span>
        </div>
      </div>

      <div style={{
        width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16, border: '1px solid #e8eef0', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', padding: '32px 36px',
      }}
      >
        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#f0fdf4',
              border: '2px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              margin: '0 auto 16px',
            }}
            >
              ✅
            </div>
            <h2 style={{
              margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#0f172a',
            }}
            >
              Password reset
            </h2>
            <p style={{
              margin: '0 0 20px', fontSize: 14, color: '#64748b', lineHeight: 1.6,
            }}
            >
              Your password has been updated. You can now log in with it.
            </p>
            <Link
              to="/login"
              style={{
                display: 'block',
                width: '100%',
                padding: '11px 0',
                borderRadius: 9,
                background: '#065f46',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
                boxSizing: 'border-box',
              }}
            >
              Go to Login →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 style={{
              margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: '#0f172a',
            }}
            >
              Set a new password
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: 13.5, color: '#64748b' }}>
              Choose a new password for your account.
            </p>

            {!token && (
              <p style={{
                margin: '0 0 16px', fontSize: 13, color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px',
              }}
              >
                This link is missing its reset token. Request a new one from
                the forgot-password page.
              </p>
            )}
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
                <label htmlFor="password" style={labelStyle}>
                  New Password
                  {' '}
                  <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a new password"
                  value={form.password}
                  onChange={(e) => setField('password')(e.target.value)}
                  style={{ ...fieldStyle, borderColor: errors.password ? '#ef4444' : fieldStyle.border }}
                />
                {errors.password && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#ef4444' }}>{errors.password}</p>}
              </div>
              <div>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor="confirmPassword" style={labelStyle}>
                  Confirm New Password
                  {' '}
                  <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repeat new password"
                  value={form.confirmPassword}
                  onChange={(e) => setField('confirmPassword')(e.target.value)}
                  style={{ ...fieldStyle, borderColor: errors.confirmPassword ? '#ef4444' : fieldStyle.border }}
                />
                {errors.confirmPassword && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#ef4444' }}>{errors.confirmPassword}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !token}
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
                cursor: submitting || !token ? 'default' : 'pointer',
                opacity: submitting || !token ? 0.7 : 1,
                fontFamily: 'inherit',
              }}
            >
              {submitting ? 'Saving…' : 'Reset Password →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
