import React from 'react';
import LoginForm from '../components/Auth/LoginForm';

/**
 * Login page (FR-02): brand header plus the shared login form card. The
 * form itself (fields, validation, submit, role-based redirect) lives in
 * LoginForm.jsx so it can also be embedded on the landing page.
 * @returns {JSX.Element} The login page.
 */
function Login() {
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

      <LoginForm />
    </div>
  );
}

export default Login;
