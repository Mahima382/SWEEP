/**
 * @fileoverview Global Collector post-login profile completion (FR-01,
 * FR-05): NID + KYC documents, driving licence, vehicle registration and
 * capacity, and an optional payout method. The account stays "pending_kyc"
 * until an admin approves it. See PROFILE_COMPLETION_SPEC.md.
 * @module GlobalCollectorProfileForm
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ProfileFormShell from './ProfileFormShell';
import PayoutFields from './PayoutFields';
import { TextField, UploadBox } from './ProfileFormFields';
import { validateGlobalCollectorProfile, pickFields } from '../../utils/profileValidation';

const STEPS = ['NID & Documents', 'Licence & Vehicle', 'Payout'];
const STEP_FIELDS = [
  ['nid', 'documents'],
  ['drivingLicenceNumber', 'vehicleRegistrationNumber', 'vehicleCapacity', 'vehicleDocuments'],
  ['payout'],
];

const EMPTY_FORM = {
  nid: '',
  documents: {
    nidFront: '', nidBack: '', profilePhoto: '', drivingLicence: '', vehicleRegistration: '',
  },
  drivingLicenceNumber: '',
  vehicleRegistrationNumber: '',
  vehicleCapacity: '',
  payout: {
    method: '', accountNumber: '', bankName: '', branchName: '',
  },
};

/**
 * Multi-step global-collector (truck driver) profile-completion wizard.
 * @param {object} props Component props.
 * @param {Function} props.onComplete Called with the assembled profile data.
 * @param {boolean} props.submitting Whether the profile is currently being saved.
 * @param {string} props.submitError Server-side error message, if any.
 * @returns {JSX.Element} The global-collector profile wizard.
 */
export default function GlobalCollectorProfileForm({ onComplete, submitting, submitError }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const updateDoc = (field, value) => setForm(
    (f) => ({ ...f, documents: { ...f.documents, [field]: value } }),
  );
  const updatePayout = (field, value) => setForm(
    (f) => ({ ...f, payout: { ...f.payout, [field]: value } }),
  );

  const handleContinue = () => {
    const allErrors = validateGlobalCollectorProfile(form);
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

  const docErrors = errors.documents || {};
  const vehicleDocErrors = errors.vehicleDocuments || {};

  return (
    <ProfileFormShell
      roleLabel="Global Collector"
      roleIcon="🚚"
      steps={STEPS}
      current={step}
      onBack={step > 0 ? () => setStep((s) => s - 1) : undefined}
      onContinue={handleContinue}
      continueLabel={step === STEPS.length - 1 ? 'Submit KYC →' : 'Continue →'}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <UploadBox label="NID Front" fileName={form.documents.nidFront} error={docErrors.nidFront} onChange={(v) => updateDoc('nidFront', v)} />
            <UploadBox label="NID Back" fileName={form.documents.nidBack} error={docErrors.nidBack} onChange={(v) => updateDoc('nidBack', v)} />
            <UploadBox label="Profile Photo" fileName={form.documents.profilePhoto} error={docErrors.profilePhoto} onChange={(v) => updateDoc('profilePhoto', v)} />
          </div>
        </div>
      )}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <TextField
              label="Driving Licence Number"
              name="drivingLicenceNumber"
              type="text"
              placeholder="Enter driving licence number"
              value={form.drivingLicenceNumber}
              error={errors.drivingLicenceNumber}
              required
              onChange={(v) => setForm((f) => ({ ...f, drivingLicenceNumber: v }))}
            />
            <TextField
              label="Vehicle Registration Number"
              name="vehicleRegistrationNumber"
              type="text"
              placeholder="Dhaka Metro XX-XXXX"
              value={form.vehicleRegistrationNumber}
              error={errors.vehicleRegistrationNumber}
              required
              onChange={(v) => setForm((f) => ({ ...f, vehicleRegistrationNumber: v }))}
            />
          </div>
          <TextField
            label="Vehicle Capacity"
            name="vehicleCapacity"
            type="text"
            placeholder="e.g. 5 tons"
            value={form.vehicleCapacity}
            error={errors.vehicleCapacity}
            required
            onChange={(v) => setForm((f) => ({ ...f, vehicleCapacity: v }))}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <UploadBox label="Driving Licence" fileName={form.documents.drivingLicence} error={vehicleDocErrors.drivingLicence} onChange={(v) => updateDoc('drivingLicence', v)} />
            <UploadBox label="Vehicle Registration" fileName={form.documents.vehicleRegistration} error={vehicleDocErrors.vehicleRegistration} onChange={(v) => updateDoc('vehicleRegistration', v)} />
          </div>
        </div>
      )}
      {step === 2 && (
        <PayoutFields value={form.payout} errors={errors.payout || {}} onChange={updatePayout} />
      )}
    </ProfileFormShell>
  );
}

GlobalCollectorProfileForm.propTypes = {
  onComplete: PropTypes.func.isRequired,
  // eslint-disable-next-line react/require-default-props
  submitting: PropTypes.bool,
  // eslint-disable-next-line react/require-default-props
  submitError: PropTypes.string,
};
