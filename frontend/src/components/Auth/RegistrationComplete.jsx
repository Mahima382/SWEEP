/**
 * @fileoverview FR-01 — shown right after account creation, before login.
 * @module RegistrationComplete
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Confirmation screen shown once the minimal account has been created.
 * Directs the user to log in and finish their role-specific profile.
 * @param {object} props Component props.
 * @param {Function} props.onGoToLogin Navigates to the login page.
 * @returns {JSX.Element} The registration-complete page.
 */
export default function RegistrationComplete({ onGoToLogin }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#f1f5f4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px',
    }}
    >
      <div style={{
        width: '100%',
        maxWidth: 440,
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #e8eef0',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        padding: '40px 36px',
        textAlign: 'center',
      }}
      >
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: '#f0fdf4',
          border: '2px solid #bbf7d0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          margin: '0 auto 20px',
        }}
        >
          🎉
        </div>
        <h2 style={{
          margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#0f172a',
        }}
        >
          Account created!
        </h2>
        <p style={{
          margin: '0 0 24px', fontSize: 14.5, color: '#64748b', lineHeight: 1.6,
        }}
        >
          Log in to complete your profile — the rest of your details are
          collected on your dashboard once you&apos;re signed in.
        </p>
        <button
          type="button"
          onClick={onGoToLogin}
          style={{
            width: '100%',
            padding: '12px 0',
            borderRadius: 9,
            border: 'none',
            background: '#065f46',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Go to Login →
        </button>
      </div>
    </div>
  );
}

RegistrationComplete.propTypes = {
  /** Navigates to the login page. */
  onGoToLogin: PropTypes.func.isRequired,
};
