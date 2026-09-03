/**
 * @fileoverview Shared address block for profile completion (FR-01):
 * household pickup address and local-collector service address use the
 * same shape (division, district, city, area, detailed address). No map
 * pin — there is no Google Maps integration in this project.
 * @module AddressFields
 */

import React from 'react';
import PropTypes from 'prop-types';
import { TextField, TextAreaField, SelectField } from './ProfileFormFields';

const DIVISIONS = [
  'Barishal', 'Chattogram', 'Dhaka', 'Khulna', 'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet',
];

/**
 * Renders the division/district/city/ward/area/postal-code/detailed-address
 * fields plus a map-pin placeholder, shared by household and local-collector
 * profile completion.
 * @param {object} props Component props.
 * @param {object} props.value Current address value.
 * @param {object} props.errors Field errors keyed by unprefixed field name
 *   (division, district, city, area, detailedAddress).
 * @param {Function} props.onChange Called with (field, value) for one subfield.
 * @returns {JSX.Element} The address field block.
 */
export default function AddressFields({ value, errors, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <SelectField
          label="Division"
          name="division"
          placeholder="Select division"
          options={DIVISIONS}
          value={value.division}
          error={errors.division}
          required
          onChange={(v) => onChange('division', v)}
        />
        <TextField
          label="District"
          name="district"
          type="text"
          placeholder="e.g. Dhaka"
          value={value.district}
          error={errors.district}
          required
          onChange={(v) => onChange('district', v)}
        />
        <TextField
          label="City / Municipality"
          name="city"
          type="text"
          placeholder="e.g. Dhaka City Corporation"
          value={value.city}
          error={errors.city}
          required
          onChange={(v) => onChange('city', v)}
        />
        <TextField
          label="Ward / Zone"
          name="ward"
          type="text"
          placeholder="e.g. Ward 32"
          value={value.ward}
          onChange={(v) => onChange('ward', v)}
        />
        <TextField
          label="Area"
          name="area"
          type="text"
          placeholder="e.g. Mirpur-10"
          value={value.area}
          error={errors.area}
          required
          onChange={(v) => onChange('area', v)}
        />
        <TextField
          label="Postal Code"
          name="postalCode"
          type="text"
          placeholder="e.g. 1216"
          value={value.postalCode}
          onChange={(v) => onChange('postalCode', v)}
        />
      </div>
      <TextAreaField
        label="Detailed Address"
        name="detailedAddress"
        placeholder="House/Flat number, Road, Block..."
        value={value.detailedAddress}
        error={errors.detailedAddress}
        required
        onChange={(v) => onChange('detailedAddress', v)}
      />
    </div>
  );
}

AddressFields.propTypes = {
  value: PropTypes.shape({
    division: PropTypes.string,
    district: PropTypes.string,
    city: PropTypes.string,
    ward: PropTypes.string,
    area: PropTypes.string,
    postalCode: PropTypes.string,
    detailedAddress: PropTypes.string,
  }).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  errors: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
