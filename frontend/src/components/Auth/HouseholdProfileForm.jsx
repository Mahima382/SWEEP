/**
 * @fileoverview Household post-login profile completion (FR-01, FR-03,
 * FR-04): NID + pickup address, then an optional payout method. No KYC —
 * household accounts are already active. See PROFILE_COMPLETION_SPEC.md.
 * @module HouseholdProfileForm
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ProfileFormShell from './ProfileFormShell';
import AddressFields from './AddressFields';
import PayoutFields from './PayoutFields';
import { TextField } from './ProfileFormFields';
import { validateHouseholdProfile, pickFields } from '../../utils/profileValidation';

const STEPS = ['Identity & Address', 'Payout'];
const STEP_FIELDS = [['nid', 'address'], ['payout']];

const EMPTY_FORM = {
  nid: '',
  address: {
    division: '', district: '', city: '', ward: '', area: '', postalCode: '', detailedAddress: '',
  },
  payout: {
    method: '', accountNumber: '', bankName: '', branchName: '',
  },
};

/**
 * Multi-step household profile-completion wizard.
 * @param {object} props Component props.
 * @param {Function} props.onComplete Called with the assembled profile data.
 * @param {boolean} props.submitting Whether the account is currently being saved.
 * @param {string} props.submitError Server-side error message, if any.
 * @returns {JSX.Element} The household profile wizard.
 */
export default function HouseholdProfileForm({ onComplete, submitting, submitError }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const updateAddress = (field, value) => setForm(
    (f) => ({ ...f, address: { ...f.address, [field]: value } }),
  );
  const updatePayout = (field, value) => setForm(
    (f) => ({ ...f, payout: { ...f.payout, [field]: value } }),
  );

  const handleContinue = () => {
    const allErrors = validateHouseholdProfile(form);
    const stepErrors = pickFields(allErrors, STEP_FIELDS[step]);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) {
      return;
    }
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    onComplete(form);
  };

  return (
    <ProfileFormShell
      roleLabel="Household"
      roleIcon="🏠"
      steps={STEPS}
      current={step}
      onBack={step > 0 ? () => setStep((s) => s - 1) : undefined}
      onContinue={handleContinue}
      continueLabel={step === STEPS.length - 1 ? 'Save Profile →' : 'Continue →'}
      submitting={submitting}
      submitError={submitError}
    >
      {step === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <TextField
            label="NID Number"
            name="nid"
            type="text"
            placeholder="Enter your NID number"
            value={form.nid}
            error={errors.nid}
            required
            onChange={(v) => setForm((f) => ({ ...f, nid: v }))}
          />
          <AddressFields
            value={form.address}
            errors={errors.address || {}}
            onChange={updateAddress}
          />
        </div>
      )}
      {step === 1 && (
        <PayoutFields value={form.payout} errors={errors.payout || {}} onChange={updatePayout} />
      )}
    </ProfileFormShell>
  );
}

HouseholdProfileForm.propTypes = {
  onComplete: PropTypes.func.isRequired,
  // eslint-disable-next-line react/require-default-props
  submitting: PropTypes.bool,
  // eslint-disable-next-line react/require-default-props
  submitError: PropTypes.string,
};
