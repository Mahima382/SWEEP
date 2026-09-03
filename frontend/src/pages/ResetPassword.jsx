import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/authService';

/**
 * Reset password page (FR-12). Accessed via the link in the password
 * reset email containing token and email query parameters.
 * @returns {JSX.Element} The reset password page.
 */
function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = useMemo(
    () => searchParams.get('token') || '',
    [searchParams],
  );
  const email = useMemo(
    () => searchParams.get('email') || '',
    [searchParams],
  );

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordChecks = useMemo(() => ({
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^a-zA-Z0-9]/.test(newPassword),
  }), [newPassword]);

  const isStrong = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = newPassword === confirmPassword
    && confirmPassword.length > 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!token || !email) {
      setError('Invalid or expired reset link.');
      return;
    }
    if (!isStrong) {
      setError('Password does not meet strength requirements.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      await resetPassword(email, token, newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setBusy(false);
    }
  };

  const checkStyle = (passed) => ({
    fontSize: 12,
    color: passed ? '#059669' : '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  });

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

        {success ? (
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
              ✅
            </div>
            <h2 style={{
              margin: '0 0 6px',
              fontSize: 22,
              fontWeight: 800,
              color: '#0f172a',
            }}
            >
              Password Reset Successful
            </h2>
            <p style={{
              margin: '0 0 24px',
              fontSize: 13.5,
              color: '#64748b',
              lineHeight: 1.6,
            }}
            >
              Your password has been updated. All existing sessions have
              been logged out for security. You can now sign in with your
              new password.
            </p>
            <Link
              to="/login"
              style={{
                display: 'block',
                width: '100%',
                height: 44,
                lineHeight: '44px',
                borderRadius: 10,
                border: 'none',
                background: '#065f46',
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'center',
                textDecoration: 'none',
                boxSizing: 'border-box',
              }}
            >
              Sign In
            </Link>
          </>
        ) : (
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
              🔒
            </div>
            <h2 style={{
              margin: '0 0 6px',
              fontSize: 22,
              fontWeight: 800,
              color: '#0f172a',
            }}
            >
              Set New Password
            </h2>
            <p style={{
              margin: '0 0 24px',
              fontSize: 13.5,
              color: '#64748b',
              lineHeight: 1.6,
            }}
            >
              Create a strong new password for your account.
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
              <div style={{ marginBottom: 14 }}>
                <label
                  htmlFor="new-password"
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: '#374151',
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  New Password
                  <input
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type="password"
                    placeholder="Enter new password"
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

              {/* Password strength indicators */}
              {newPassword.length > 0 && (
                <div style={{
                  marginBottom: 14,
                  padding: '10px 12px',
                  background: '#f8fafc',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
                >
                  <div style={checkStyle(passwordChecks.length)}>
                    {passwordChecks.length ? '✓' : '○'}
                    {' At least 8 characters'}
                  </div>
                  <div style={checkStyle(passwordChecks.upper)}>
                    {passwordChecks.upper ? '✓' : '○'}
                    {' One uppercase letter'}
                  </div>
                  <div style={checkStyle(passwordChecks.lower)}>
                    {passwordChecks.lower ? '✓' : '○'}
                    {' One lowercase letter'}
                  </div>
                  <div style={checkStyle(passwordChecks.number)}>
                    {passwordChecks.number ? '✓' : '○'}
                    {' One number'}
                  </div>
                  <div style={checkStyle(passwordChecks.special)}>
                    {passwordChecks.special ? '✓' : '○'}
                    {' One special character'}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <label
                  htmlFor="confirm-password"
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: '#374151',
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  Confirm Password
                  <input
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    placeholder="Re-enter new password"
                    required
                    style={{
                      width: '100%',
                      height: 42,
                      padding: '0 14px',
                      borderRadius: 9,
                      border: `1px solid ${
                        confirmPassword.length > 0 && !passwordsMatch
                          ? '#fca5a5'
                          : '#e2e8f0'
                      }`,
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
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <div style={{
                    fontSize: 12,
                    color: '#dc2626',
                    marginTop: 4,
                  }}
                  >
                    Passwords do not match
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!isStrong || !passwordsMatch || busy}
                style={{
                  width: '100%',
                  height: 44,
                  borderRadius: 10,
                  border: 'none',
                  background:
                    isStrong && passwordsMatch && !busy
                      ? '#065f46'
                      : '#e2e8f0',
                  color:
                    isStrong && passwordsMatch && !busy
                      ? '#fff'
                      : '#94a3b8',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor:
                    isStrong && passwordsMatch && !busy
                      ? 'pointer'
                      : 'not-allowed',
                  fontFamily: 'inherit',
                }}
              >
                {busy ? 'Resetting...' : 'Reset Password'}
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
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
