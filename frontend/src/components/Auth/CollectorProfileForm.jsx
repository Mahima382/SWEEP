/**
 * @fileoverview Local Collector post-login profile completion (FR-01,
 * FR-05): NID + KYC documents, personal details, service address, pickup
 * capacity, service zones, and an optional payout method. The account
 * stays "pending_kyc" until an admin approves it. See
 * PROFILE_COMPLETION_SPEC.md.
 * @module CollectorProfileForm
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ProfileFormShell from './ProfileFormShell';
import AddressFields from './AddressFields';
import PayoutFields from './PayoutFields';
import {
  TextField, SelectField, ChipMultiSelect, UploadBox,
} from './ProfileFormFields';
import { validateCollectorProfile, pickFields } from '../../utils/profileValidation';

const STEPS = ['NID & Documents', 'Personal & Service Area', 'Capacity & Zones', 'Payout'];
const STEP_FIELDS = [
  ['nid', 'documents'],
  ['dob', 'address'],
  ['dailyCapacity', 'serviceZones'],
  ['payout'],
];

const SERVICE_ZONES = ['Mirpur-1', 'Mirpur-10', 'Mirpur-11', 'Pallabi', 'Kazipara', 'Shewrapara', 'Kafrul'];
const VEHICLE_TYPES = ['Van', 'Rickshaw Van', 'Pickup Truck', 'Motorcycle'];

const EMPTY_FORM = {
  nid: '',
  nidIssueDate: '',
  documents: {
    nidFront: '', nidBack: '', profilePhoto: '',
  },
  dob: '',
  gender: '',
  address: {
    division: '', district: '', city: '', ward: '', area: '', postalCode: '', detailedAddress: '',
  },
  dailyCapacity: '',
  vehicleType: '',
  vehicleRegistrationNumber: '',
  serviceZones: [],
  payout: {
    method: '', accountNumber: '', bankName: '', branchName: '',
  },
};

/**
 * Multi-step local-collector profile-completion wizard.
 * @param {object} props Component props.
 * @param {Function} props.onComplete Called with the assembled profile data.
 * @param {boolean} props.submitting Whether the profile is currently being saved.
 * @param {string} props.submitError Server-side error message, if any.
 * @returns {JSX.Element} The local-collector profile wizard.
 */
export default function CollectorProfileForm({ onComplete, submitting, submitError }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const updateDoc = (field, value) => setForm(
    (f) => ({ ...f, documents: { ...f.documents, [field]: value } }),
  );
  const updateAddress = (field, value) => setForm(
    (f) => ({ ...f, address: { ...f.address, [field]: value } }),
  );
  const updatePayout = (field, value) => setForm(
    (f) => ({ ...f, payout: { ...f.payout, [field]: value } }),
  );
  const toggleZone = (zone) => setForm((f) => ({
    ...f,
    serviceZones: f.serviceZones.includes(zone)
      ? f.serviceZones.filter((z) => z !== zone)
      : [...f.serviceZones, zone],
  }));

  const handleContinue = () => {
    const allErrors = validateCollectorProfile(form);
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
      roleLabel="Local Collector"
      roleIcon="🚛"
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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
            <TextField
              label="NID Issue Date"
              name="nidIssueDate"
              type="date"
              placeholder=""
              value={form.nidIssueDate}
              onChange={(v) => setForm((f) => ({ ...f, nidIssueDate: v }))}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <UploadBox label="NID Front" fileName={form.documents.nidFront} error={(errors.documents || {}).nidFront} onChange={(v) => updateDoc('nidFront', v)} />
            <UploadBox label="NID Back" fileName={form.documents.nidBack} error={(errors.documents || {}).nidBack} onChange={(v) => updateDoc('nidBack', v)} />
            <UploadBox label="Profile Photo" fileName={form.documents.profilePhoto} error={(errors.documents || {}).profilePhoto} onChange={(v) => updateDoc('profilePhoto', v)} />
          </div>
        </div>
      )}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <TextField
              label="Date of Birth"
              name="dob"
              type="date"
              placeholder=""
              value={form.dob}
              error={errors.dob}
              required
              onChange={(v) => setForm((f) => ({ ...f, dob: v }))}
            />
            <SelectField
              label="Gender"
              name="gender"
              placeholder="Select gender"
              options={['Male', 'Female', 'Other']}
              value={form.gender}
              onChange={(v) => setForm((f) => ({ ...f, gender: v }))}
            />
          </div>
          <AddressFields
            value={form.address}
            errors={errors.address || {}}
            onChange={updateAddress}
          />
        </div>
      )}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <TextField
            label="Daily Pickup Capacity"
            name="dailyCapacity"
            type="text"
            placeholder="e.g. 12 pickups/day"
            value={form.dailyCapacity}
            error={errors.dailyCapacity}
            required
            onChange={(v) => setForm((f) => ({ ...f, dailyCapacity: v }))}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <SelectField
              label="Vehicle Type"
              name="vehicleType"
              placeholder="Select vehicle"
              options={VEHICLE_TYPES}
              value={form.vehicleType}
              onChange={(v) => setForm((f) => ({ ...f, vehicleType: v }))}
            />
            <TextField
              label="Vehicle Registration Number"
              name="vehicleRegistrationNumber"
              type="text"
              placeholder="Dhaka Metro XX-XXXX"
              value={form.vehicleRegistrationNumber}
              onChange={(v) => setForm((f) => ({ ...f, vehicleRegistrationNumber: v }))}
            />
          </div>
          <ChipMultiSelect
            label="Service Zones / Wards"
            options={SERVICE_ZONES}
            selected={form.serviceZones}
            error={errors.serviceZones}
            onToggle={toggleZone}
          />
        </div>
      )}
      {step === 3 && (
        <PayoutFields value={form.payout} errors={errors.payout || {}} onChange={updatePayout} />
      )}
    </ProfileFormShell>
  );
}

CollectorProfileForm.propTypes = {
  onComplete: PropTypes.func.isRequired,
  // eslint-disable-next-line react/require-default-props
  submitting: PropTypes.bool,
  // eslint-disable-next-line react/require-default-props
  submitError: PropTypes.string,
};
