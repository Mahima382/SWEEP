/**
 * @fileoverview FR-01 — shown once the post-login profile-completion
 * wizard has been submitted successfully.
 * @module ProfileCompletionDone
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Confirmation screen shown once profile-completion data has been saved.
 * KYC roles are told their documents are under review; the household role
 * (no KYC) is sent straight in.
 * @param {object} props Component props.
 * @param {boolean} props.requiresKyc Whether this role's account is pending
 *   KYC approval (collector, global, company).
 * @param {Function} props.onGoToDashboard Navigates to the role dashboard.
 * @returns {JSX.Element} The profile-completion confirmation page.
 */
export default function ProfileCompletionDone({ requiresKyc, onGoToDashboard }) {
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
          {requiresKyc ? '🪪' : '🎉'}
        </div>
        <h2 style={{
          margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#0f172a',
        }}
        >
          {requiresKyc ? 'KYC Submitted' : 'Profile complete!'}
        </h2>
        <p style={{
          margin: '0 0 24px', fontSize: 14.5, color: '#64748b', lineHeight: 1.6,
        }}
        >
          {requiresKyc
            ? "Your verification documents have been submitted. We'll review your application and notify you within 1–2 business days. You can still browse your dashboard while approval is pending."
            : 'Your profile is all set. Head to your dashboard to start listing waste and scheduling pickups.'}
        </p>
        <button
          type="button"
          onClick={onGoToDashboard}
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
          Go to Dashboard →
        </button>
      </div>
    </div>
  );
}

ProfileCompletionDone.propTypes = {
  requiresKyc: PropTypes.bool.isRequired,
  onGoToDashboard: PropTypes.func.isRequired,
};
