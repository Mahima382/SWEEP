/**
 * @fileoverview Recycling Company post-login profile completion (FR-01,
 * FR-07, FR-08): company info, supported waste categories (E-waste is
 * licence-gated), KYC documents, and the authorized person. Subscription
 * plan selection happens later, after KYC approval (FR-07), and is not
 * part of this flow. See PROFILE_COMPLETION_SPEC.md.
 * @module CompanyProfileForm
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ProfileFormShell from './ProfileFormShell';
import {
  TextField, TextAreaField, SelectField, ChipMultiSelect, UploadBox,
} from './ProfileFormFields';
import { validateCompanyProfile, pickFields } from '../../utils/profileValidation';
import { WASTE_CATEGORIES } from '../../utils/constants';

const STEPS = ['Company Info', 'Waste Categories', 'KYC Documents', 'Authorized Person'];
const STEP_FIELDS = [
  ['registrationNumber', 'officeAddress'],
  ['supportedCategories', 'ewasteLicenceNumber', 'ewasteDocuments'],
  ['documents'],
  ['authorizedPerson'],
];

const BUSINESS_TYPES = ['Sole Proprietorship', 'Partnership', 'Private Limited', 'Public Limited'];

const EMPTY_FORM = {
  registrationNumber: '',
  businessType: '',
  yearEstablished: '',
  officeAddress: '',
  serviceRegions: '',
  supportedCategories: [],
  ewasteLicenceNumber: '',
  documents: {
    ewasteLicence: '', tradeLicence: '', companyRegistration: '', tin: '', vat: '', directorNid: '', other: '',
  },
  authorizedPerson: {
    name: '', role: '', phone: '', email: '', nid: '',
  },
};

/**
 * Multi-step recycling-company profile-completion wizard.
 * @param {object} props Component props.
 * @param {Function} props.onComplete Called with the assembled profile data.
 * @param {boolean} props.submitting Whether the profile is currently being saved.
 * @param {string} props.submitError Server-side error message, if any.
 * @returns {JSX.Element} The company profile wizard.
 */
export default function CompanyProfileForm({ onComplete, submitting, submitError }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const updateDoc = (field, value) => setForm(
    (f) => ({ ...f, documents: { ...f.documents, [field]: value } }),
  );
  const updatePerson = (field, value) => setForm(
    (f) => ({ ...f, authorizedPerson: { ...f.authorizedPerson, [field]: value } }),
  );
  const toggleCategory = (category) => setForm((f) => ({
    ...f,
    supportedCategories: f.supportedCategories.includes(category)
      ? f.supportedCategories.filter((c) => c !== category)
      : [...f.supportedCategories, category],
  }));

  const handleContinue = () => {
    const allErrors = validateCompanyProfile(form);
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
  const ewasteDocErrors = errors.ewasteDocuments || {};
  const needsEwasteLicence = form.supportedCategories.includes('E-waste');

  return (
    <ProfileFormShell
      roleLabel="Recycling Company"
      roleIcon="🏭"
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
              label="Registration Number"
              name="registrationNumber"
              type="text"
              placeholder="C-XXXXXXXX"
              value={form.registrationNumber}
              error={errors.registrationNumber}
              required
              onChange={(v) => setForm((f) => ({ ...f, registrationNumber: v }))}
            />
            <SelectField
              label="Business Type"
              name="businessType"
              placeholder="Select type"
              options={BUSINESS_TYPES}
              value={form.businessType}
              onChange={(v) => setForm((f) => ({ ...f, businessType: v }))}
            />
            <TextField
              label="Year Established"
              name="yearEstablished"
              type="number"
              placeholder="e.g. 2018"
              value={form.yearEstablished}
              onChange={(v) => setForm((f) => ({ ...f, yearEstablished: v }))}
            />
            <SelectField
              label="Service Regions"
              name="serviceRegions"
              placeholder="Select regions served"
              options={['Dhaka', 'Chattogram', 'Khulna', 'Rajshahi', 'Sylhet', 'Nationwide']}
              value={form.serviceRegions}
              onChange={(v) => setForm((f) => ({ ...f, serviceRegions: v }))}
            />
          </div>
          <TextAreaField
            label="Office Address"
            name="officeAddress"
            placeholder="Full office address"
            value={form.officeAddress}
            error={errors.officeAddress}
            required
            onChange={(v) => setForm((f) => ({ ...f, officeAddress: v }))}
          />
        </div>
      )}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ChipMultiSelect
            label="Supported Waste Categories"
            options={WASTE_CATEGORIES}
            selected={form.supportedCategories}
            error={errors.supportedCategories}
            onToggle={toggleCategory}
          />
          {needsEwasteLicence && (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 14, padding: '14px 16px', background: '#fef9c3', borderRadius: 10, border: '1px solid #fde68a',
            }}
            >
              <div style={{ fontWeight: 600, fontSize: 13, color: '#a16207' }}>
                🪪 E-Waste Licence Required
              </div>
              <TextField
                label="E-Waste Handling Licence Number"
                name="ewasteLicenceNumber"
                type="text"
                placeholder="Licence number"
                value={form.ewasteLicenceNumber}
                error={errors.ewasteLicenceNumber}
                required
                onChange={(v) => setForm((f) => ({ ...f, ewasteLicenceNumber: v }))}
              />
              <UploadBox label="E-Waste Licence Document" fileName={form.documents.ewasteLicence} error={ewasteDocErrors.ewasteLicence} onChange={(v) => updateDoc('ewasteLicence', v)} />
            </div>
          )}
        </div>
      )}
      {step === 2 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <UploadBox label="Trade Licence" fileName={form.documents.tradeLicence} error={docErrors.tradeLicence} onChange={(v) => updateDoc('tradeLicence', v)} />
          <UploadBox label="Company Registration" fileName={form.documents.companyRegistration} error={docErrors.companyRegistration} onChange={(v) => updateDoc('companyRegistration', v)} />
          <UploadBox label="TIN / Tax Certificate" fileName={form.documents.tin} error={docErrors.tin} onChange={(v) => updateDoc('tin', v)} />
          <UploadBox label="VAT Certificate" fileName={form.documents.vat} error={docErrors.vat} onChange={(v) => updateDoc('vat', v)} />
          <UploadBox label="Director NID" fileName={form.documents.directorNid} error={docErrors.directorNid} onChange={(v) => updateDoc('directorNid', v)} />
          <UploadBox label="Other Documents" fileName={form.documents.other} onChange={(v) => updateDoc('other', v)} />
        </div>
      )}
      {step === 3 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <TextField
            label="Authorized Person Name"
            name="authorizedPersonName"
            type="text"
            placeholder="Full name"
            value={form.authorizedPerson.name}
            error={(errors.authorizedPerson || {}).name}
            required
            onChange={(v) => updatePerson('name', v)}
          />
          <TextField
            label="Role / Designation"
            name="authorizedPersonRole"
            type="text"
            placeholder="e.g. Managing Director"
            value={form.authorizedPerson.role}
            error={(errors.authorizedPerson || {}).role}
            required
            onChange={(v) => updatePerson('role', v)}
          />
          <TextField
            label="Phone"
            name="authorizedPersonPhone"
            type="tel"
            placeholder="01XXXXXXXXX"
            value={form.authorizedPerson.phone}
            error={(errors.authorizedPerson || {}).phone}
            required
            onChange={(v) => updatePerson('phone', v)}
          />
          <TextField
            label="Email"
            name="authorizedPersonEmail"
            type="email"
            placeholder="person@company.com"
            value={form.authorizedPerson.email}
            error={(errors.authorizedPerson || {}).email}
            required
            onChange={(v) => updatePerson('email', v)}
          />
          <TextField
            label="NID Number"
            name="authorizedPersonNid"
            type="text"
            placeholder="Enter NID number"
            value={form.authorizedPerson.nid}
            error={(errors.authorizedPerson || {}).nid}
            required
            onChange={(v) => updatePerson('nid', v)}
          />
        </div>
      )}
    </ProfileFormShell>
  );
}

CompanyProfileForm.propTypes = {
  onComplete: PropTypes.func.isRequired,
  // eslint-disable-next-line react/require-default-props
  submitting: PropTypes.bool,
  // eslint-disable-next-line react/require-default-props
  submitError: PropTypes.string,
};
