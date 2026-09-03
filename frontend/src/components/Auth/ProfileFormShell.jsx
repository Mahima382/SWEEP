/**
 * @fileoverview Shared page chrome for the post-login profile-completion
 * wizard (FR-01) — header, form card, step indicator, and Back/Continue
 * actions. Each role's wizard (HouseholdProfileForm, CollectorProfileForm,
 * GlobalCollectorProfileForm, CompanyProfileForm) renders its own step
 * fields as children.
 * @module ProfileFormShell
 */

import React from 'react';
import PropTypes from 'prop-types';
import { StepIndicator } from './ProfileFormFields';

/**
 * Wraps one step of a role's profile-completion wizard in the shared card
 * layout: brand header, step indicator, step title, the step's own fields,
 * and Back/Continue actions.
 * @param {object} props Component props.
 * @param {string} props.roleLabel Human-readable role name shown in the header.
 * @param {string} props.roleIcon Emoji shown next to the role label.
 * @param {string[]} props.steps Ordered step names for this role's wizard.
 * @param {number} props.current Zero-based index of the active step.
 * @param {Function} props.onBack Called to go back a step; omit to hide the button.
 * @param {Function} props.onContinue Called to validate and advance/submit.
 * @param {string} props.continueLabel Label for the primary action button.
 * @param {boolean} props.submitting Whether the final submission is in flight.
 * @param {string} props.submitError Server-side error message, if any.
 * @param {React.ReactNode} props.children The active step's fields.
 * @returns {JSX.Element} The wizard step shell.
 */
export default function ProfileFormShell({
  roleLabel, roleIcon, steps, current, onBack, onContinue,
  continueLabel, submitting, submitError, children,
}) {
  return (
    <div style={{
      minHeight: '100vh', background: '#f1f5f4', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px',
    }}
    >
      <div style={{ width: '100%', maxWidth: 760, marginBottom: 32 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28,
        }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, background: '#a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}
            >
              ♻️
            </div>
            <span style={{ fontWeight: 800, fontSize: 17, color: '#0f172a' }}>SWEEP</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px',
          }}
          >
            <span style={{ fontSize: 16 }}>{roleIcon}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
              Complete your
              {' '}
              {roleLabel}
              {' '}
              profile
            </span>
          </div>
        </div>
        <StepIndicator steps={steps} current={current} />
      </div>

      <div style={{
        width: '100%', maxWidth: 760, background: '#fff', borderRadius: 16, border: '1px solid #e8eef0', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', padding: '32px 36px',
      }}
      >
        <h2 style={{
          margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: '#0f172a',
        }}
        >
          {steps[current]}
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: 13.5, color: '#64748b' }}>
          Step
          {' '}
          {current + 1}
          {' '}
          of
          {' '}
          {steps.length}
        </p>

        {submitError && (
          <p style={{
            margin: '0 0 20px', fontSize: 13, color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px',
          }}
          >
            {submitError}
          </p>
        )}

        {children}

        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid #f1f5f9',
        }}
        >
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              style={{
                padding: '10px 20px', borderRadius: 9, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              ← Previous
            </button>
          ) : <span />}
          <button
            type="button"
            onClick={onContinue}
            disabled={submitting}
            style={{
              padding: '10px 28px',
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
            {submitting ? 'Saving…' : continueLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

ProfileFormShell.propTypes = {
  roleLabel: PropTypes.string.isRequired,
  roleIcon: PropTypes.string.isRequired,
  steps: PropTypes.arrayOf(PropTypes.string).isRequired,
  current: PropTypes.number.isRequired,
  // eslint-disable-next-line react/require-default-props
  onBack: PropTypes.func,
  onContinue: PropTypes.func.isRequired,
  continueLabel: PropTypes.string.isRequired,
  // eslint-disable-next-line react/require-default-props
  submitting: PropTypes.bool,
  // eslint-disable-next-line react/require-default-props
  submitError: PropTypes.string,
  children: PropTypes.node.isRequired,
};
