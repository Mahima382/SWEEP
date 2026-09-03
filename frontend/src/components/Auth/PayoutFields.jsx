/**
 * @fileoverview Shared payout-method block for profile completion (FR-01):
 * optional at this stage for every role (only required before a first
 * withdrawal — FR-04/FR-06), so all fields here are skippable.
 * @module PayoutFields
 */

import React from 'react';
import PropTypes from 'prop-types';
import { TextField, SelectField } from './ProfileFormFields';

const METHODS = [
  {
    id: 'bkash', label: 'bKash', desc: 'Mobile financial service', icon: '📱',
  },
  {
    id: 'nagad', label: 'Nagad', desc: 'Mobile financial service', icon: '📲',
  },
  {
    id: 'bank', label: 'Bank Account', desc: 'Direct bank transfer', icon: '🏦',
  },
];

/**
 * Renders the payout-method picker (bKash / Nagad / bank) and its
 * conditional account-detail fields.
 * @param {object} props Component props.
 * @param {object} props.value Current payout value ({ method, accountNumber,
 *   bankName, branchName }).
 * @param {object} props.errors Field errors keyed by unprefixed field name.
 * @param {Function} props.onChange Called with (field, value) for one subfield.
 * @returns {JSX.Element} The payout field block.
 */
export default function PayoutFields({ value, errors, onChange }) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{
          margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#0f172a',
        }}
        >
          How would you like to receive payments?
        </h3>
        <p style={{ margin: 0, fontSize: 13.5, color: '#64748b' }}>
          Optional for now — you can skip this and set it up later, but a
          verified payout account is required before your first withdrawal.
        </p>
      </div>
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20,
      }}
      >
        {METHODS.map((m) => (
          /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
             jsx-a11y/no-static-element-interactions */
          <div
            key={m.id}
            onClick={() => onChange('method', value.method === m.id ? '' : m.id)}
            style={{
              padding: '14px 18px',
              borderRadius: 10,
              cursor: 'pointer',
              border: `2px solid ${value.method === m.id ? '#065f46' : '#e2e8f0'}`,
              background: value.method === m.id ? '#f0fdf4' : '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 20 }}>{m.icon}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{m.label}</div>
              <div style={{ fontSize: 12.5, color: '#64748b' }}>{m.desc}</div>
            </div>
            {value.method === m.id && (
              <div style={{
                marginLeft: 'auto', color: '#065f46', fontWeight: 700, fontSize: 16,
              }}
              >
                ✓
              </div>
            )}
          </div>
        ))}
      </div>
      {value.method && (
        <div style={{
          padding: '16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0',
        }}
        >
          <TextField
            label={value.method === 'bank' ? 'Account Number' : `${value.method === 'bkash' ? 'bKash' : 'Nagad'} Number`}
            name="accountNumber"
            type="text"
            placeholder={value.method === 'bank' ? 'Enter account number' : '01XXXXXXXXX'}
            value={value.accountNumber}
            error={errors.accountNumber}
            required
            onChange={(v) => onChange('accountNumber', v)}
          />
          {value.method === 'bank' && (
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 12,
            }}
            >
              <SelectField
                label="Bank Name"
                name="bankName"
                placeholder="Select bank"
                options={['City Bank', 'BRAC Bank', 'Dutch-Bangla Bank', 'Islami Bank', 'Sonali Bank']}
                value={value.bankName}
                error={errors.bankName}
                required
                onChange={(v) => onChange('bankName', v)}
              />
              <TextField
                label="Branch Name"
                name="branchName"
                type="text"
                placeholder="Branch name"
                value={value.branchName}
                onChange={(v) => onChange('branchName', v)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

PayoutFields.propTypes = {
  value: PropTypes.shape({
    method: PropTypes.string,
    accountNumber: PropTypes.string,
    bankName: PropTypes.string,
    branchName: PropTypes.string,
  }).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  errors: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
