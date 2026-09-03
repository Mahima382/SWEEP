import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword as forgotPasswordRequest } from '../services/authService';
import { fieldStyle, labelStyle } from '../components/Auth/ProfileFormFields';

/**
 * Forgot-password page (FR-12): requests a reset link for an email
 * address. The backend always responds with the same generic message
 * whether or not the email is registered, so this page never reveals that
 * distinction either.
 *
 * There is no email provider wired into this project (deliberately small
 * stack), so when the account exists the backend returns the reset token
 * directly — shown here as a dev-mode link so the flow is fully testable.
 * In a production deployment with a mail provider this would be emailed
 * instead, and the on-page link removed.
 * @returns {JSX.Element} The forgot-password page.
 */
function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [devResetLink, setDevResetLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await forgotPasswordRequest(email.trim());
      setMessage(res.message);
      setDevResetLink(res.resetToken ? `/reset-password?token=${res.resetToken}` : '');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
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
          Forgot your password?
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: 13.5, color: '#64748b' }}>
          Enter your account email and we&apos;ll send you a link to reset it.
        </p>

        {message ? (
          <div>
            <p style={{
              margin: '0 0 16px', fontSize: 13.5, color: '#065f46', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 14px', lineHeight: 1.6,
            }}
            >
              {message}
            </p>
            {devResetLink && (
              <p style={{
                margin: '0 0 4px', fontSize: 12.5, color: '#a16207', background: '#fefce8', border: '1px solid #fde68a', borderRadius: 8, padding: '12px 14px', lineHeight: 1.6,
              }}
              >
                No email provider is configured in this project, so here&apos;s
                your reset link directly:
                {' '}
                <Link to={devResetLink} style={{ color: '#065f46', fontWeight: 700 }}>
                  Reset your password →
                </Link>
              </p>
            )}
          </div>
        ) : (
          <>
            {error && (
              <p style={{
                margin: '0 0 16px', fontSize: 13, color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px',
              }}
              >
                {error}
              </p>
            )}
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
                placeholder="Enter your account email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={fieldStyle}
              />
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
              {submitting ? 'Sending…' : 'Send Reset Link →'}
            </button>
          </>
        )}

        <p style={{
          margin: '18px 0 0', textAlign: 'center', fontSize: 13, color: '#64748b',
        }}
        >
          Remembered it?
          {' '}
          <Link to="/login" style={{ color: '#065f46', fontWeight: 600, textDecoration: 'none' }}>
            Back to login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default ForgotPassword;
