/**
 * @fileoverview FR-01 — minimal account creation. Only the fields needed to
 * create the login credential are collected here; every role-specific field
 * (NID, KYC documents, address, payout method, etc.) is deferred to the
 * post-login profile completion flow — see PROFILE_COMPLETION_SPEC.md.
 * @module RegisterFlow
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';

const typeLabels = {
  household: 'Household',
  collector: 'Local Collector',
  global: 'Global Collector',
  company: 'Recycling Company',
};

const typeIcons = {
  household: '🏠', collector: '🚛', global: '🚚', company: '🏭',
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

const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const MOBILE_POLICY = /^01[0-9]{9}$/;

/**
 * Validate the registration form fields.
 * @param {object} form Current form values.
 * @param {string} accountType One of household | collector | global | company.
 * @returns {object} Map of field name to error message, empty when valid.
 */
function validate(form, accountType) {
  const errors = {};
  if (!form.fullName.trim()) {
    errors.fullName = accountType === 'company' ? 'Company name is required.' : 'Full name is required.';
  }
  if (!form.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!form.mobile.trim()) {
    errors.mobile = 'Mobile number is required.';
  } else if (!MOBILE_POLICY.test(form.mobile)) {
    errors.mobile = 'Enter an 11-digit Bangladeshi mobile number (e.g. 01XXXXXXXXX).';
  }
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
 * Single labeled text input with an inline validation message.
 * @param {object} props Component props.
 * @param {string} props.label Field label text.
 * @param {string} props.name Field name, used for the input id and change handler.
 * @param {string} props.type HTML input type.
 * @param {string} props.placeholder Placeholder text.
 * @param {string} props.value Current field value.
 * @param {string} props.error Validation message, if any.
 * @param {Function} props.onChange Called with the new field value.
 * @returns {JSX.Element} The labeled input.
 */
function TextField({
  label, name, type, placeholder, value, error, onChange,
}) {
  return (
    <div>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label htmlFor={name} style={labelStyle}>
        {label}
        {' '}
        <span style={{ color: '#ef4444' }}>*</span>
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...fieldStyle, borderColor: error ? '#ef4444' : fieldStyle.border }}
      />
      {error && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#ef4444' }}>{error}</p>}
    </div>
  );
}

TextField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  // eslint-disable-next-line react/require-default-props
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

/**
 * Minimal account-creation form (FR-01): full name, email, mobile number,
 * and password. Everything role-specific is collected later, after login.
 * @param {object} props Component props.
 * @param {string} props.accountType One of household | collector | global | company.
 * @param {Function} props.onComplete Called with the submitted account data.
 * @param {Function} props.onBack Returns to account type selection.
 * @returns {JSX.Element} The registration form.
 */
export default function RegisterFlow({ accountType, onComplete, onBack }) {
  const [form, setForm] = useState({
    fullName: '', email: '', mobile: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);

  const setField = (name) => (value) => setForm((f) => ({ ...f, [name]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = validate(form, accountType);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      onComplete({ accountType, ...form });
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#f1f5f4', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px',
    }}
    >
      {/* Header */}
      <div style={{ width: '100%', maxWidth: 480, marginBottom: 24 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
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
            <span style={{ fontSize: 16 }}>{typeIcons[accountType]}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
              {typeLabels[accountType]}
              {' '}
              Registration
            </span>
          </div>
        </div>
      </div>

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%', maxWidth: 480, background: '#fff', borderRadius: 16, border: '1px solid #e8eef0', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', padding: '32px 36px',
        }}
      >
        <h2 style={{
          margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: '#0f172a',
        }}
        >
          Create your account
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: 13.5, color: '#64748b' }}>
          You&apos;ll complete the rest of your profile after logging in.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TextField
            label={accountType === 'company' ? 'Company Name' : 'Full Name'}
            name="fullName"
            type="text"
            placeholder={accountType === 'company' ? 'Enter your company name' : 'Enter your full name'}
            value={form.fullName}
            error={errors.fullName}
            onChange={setField('fullName')}
          />
          <TextField
            label="Email Address"
            name="email"
            type="email"
            placeholder="Enter your email address"
            value={form.email}
            error={errors.email}
            onChange={setField('email')}
          />
          <TextField
            label="Mobile Number"
            name="mobile"
            type="tel"
            placeholder="01XXXXXXXXX"
            value={form.mobile}
            error={errors.mobile}
            onChange={setField('mobile')}
          />
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
                placeholder="Create a password"
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
          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type={showPw ? 'text' : 'password'}
            placeholder="Repeat password"
            value={form.confirmPassword}
            error={errors.confirmPassword}
            onChange={setField('confirmPassword')}
          />
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid #f1f5f9',
        }}
        >
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: '10px 20px',
              borderRadius: 9,
              border: '1px solid #e2e8f0',
              background: '#fff',
              color: '#475569',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ← Back
          </button>
          <button
            type="submit"
            style={{
              padding: '10px 28px',
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
            Create Account →
          </button>
        </div>
      </form>
    </div>
  );
}

RegisterFlow.propTypes = {
  /** One of: household | collector | global | company. */
  accountType: PropTypes.oneOf(['household', 'collector', 'global', 'company']).isRequired,
  /** Called with the submitted account data once the form is valid. */
  onComplete: PropTypes.func.isRequired,
  /** Returns to account type selection. */
  onBack: PropTypes.func.isRequired,
};
