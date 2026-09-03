import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/authService';

/**
 * Forgot password page matching frontend-reference ForgotPassword (FR-12).
 * Two states: email form and success confirmation.
 * @returns {JSX.Element} The forgot password page.
 */
function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email) { return; }
    setBusy(true);
    setError('');
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    setBusy(true);
    setError('');
    try {
      await forgotPassword(email);
    } catch (err) {
      setError(err.message || 'Failed to resend. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f1f5f4',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}
    >
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #e8eef0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        padding: '40px 36px',
      }}
      >
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 28,
        }}
        >
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
          }}
          >
            ♻️
          </div>
          <span style={{
            fontWeight: 800,
            fontSize: 16,
            color: '#0f172a',
          }}
          >
            SWEEP
          </span>
        </div>

        {!sent ? (
          <>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              marginBottom: 16,
            }}
            >
              🔑
            </div>
            <h2 style={{
              margin: '0 0 6px',
              fontSize: 22,
              fontWeight: 800,
              color: '#0f172a',
            }}
            >
              Forgot Password
            </h2>
            <p style={{
              margin: '0 0 24px',
              fontSize: 13.5,
              color: '#64748b',
              lineHeight: 1.6,
            }}
            >
              Enter your registered email address and we&apos;ll send you
              a password reset link.
            </p>

            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 10,
                padding: '12px 16px',
                marginBottom: 18,
                fontSize: 13.5,
                color: '#dc2626',
              }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label
                  htmlFor="forgot-email"
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: '#374151',
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  Email Address
                  <input
                    id="forgot-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="you@example.com"
                    required
                    style={{
                      width: '100%',
                      height: 42,
                      padding: '0 14px',
                      borderRadius: 9,
                      border: '1px solid #e2e8f0',
                      fontSize: 14,
                      color: '#0f172a',
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                      display: 'block',
                      marginTop: 6,
                    }}
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={!email || busy}
                style={{
                  width: '100%',
                  height: 44,
                  borderRadius: 10,
                  border: 'none',
                  background: email && !busy ? '#065f46' : '#e2e8f0',
                  color: email && !busy ? '#fff' : '#94a3b8',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: email && !busy ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                }}
              >
                {busy ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <Link
              to="/login"
              style={{
                display: 'block',
                width: '100%',
                height: 40,
                lineHeight: '40px',
                marginTop: 10,
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                background: '#fff',
                color: '#64748b',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'center',
                textDecoration: 'none',
                boxSizing: 'border-box',
              }}
            >
              ← Back to Sign In
            </Link>
          </>
        ) : (
          <>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#f0fdf4',
              border: '2px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              marginBottom: 16,
            }}
            >
              📧
            </div>
            <h2 style={{
              margin: '0 0 6px',
              fontSize: 22,
              fontWeight: 800,
              color: '#0f172a',
            }}
            >
              Check your email
            </h2>
            <p style={{
              margin: '0 0 6px',
              fontSize: 13.5,
              color: '#64748b',
              lineHeight: 1.6,
            }}
            >
              We&apos;ve sent a password reset link to
            </p>
            <p style={{
              margin: '0 0 24px',
              fontSize: 14,
              fontWeight: 700,
              color: '#065f46',
            }}
            >
              {email}
            </p>

            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 10,
                padding: '12px 16px',
                marginBottom: 18,
                fontSize: 13.5,
                color: '#dc2626',
              }}
              >
                {error}
              </div>
            )}

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
            >
              <button
                type="button"
                onClick={handleResend}
                disabled={busy}
                style={{
                  width: '100%',
                  height: 44,
                  borderRadius: 10,
                  border: '1px solid #065f46',
                  background: '#f0fdf4',
                  color: '#065f46',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: busy ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {busy ? 'Resending...' : 'Resend Email'}
              </button>
              <Link
                to="/login"
                style={{
                  display: 'block',
                  width: '100%',
                  height: 44,
                  lineHeight: '44px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#64748b',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'center',
                  textDecoration: 'none',
                  boxSizing: 'border-box',
                }}
              >
                ← Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
