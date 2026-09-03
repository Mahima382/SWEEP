/**
 * @fileoverview Shared UI atoms for the post-login profile-completion
 * wizard (FR-01) — step indicator, labeled inputs, a map-pin placeholder,
 * a chip multi-select, and a file-upload placeholder. Styling mirrors
 * RegisterFlow.jsx / Login.jsx so the whole auth flow feels like one piece.
 * @module ProfileFormFields
 */

import React from 'react';
import PropTypes from 'prop-types';

export const fieldStyle = {
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

export const labelStyle = {
  fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6,
};

/**
 * Progress indicator across the steps of one role's profile-completion
 * wizard.
 * @param {object} props Component props.
 * @param {string[]} props.steps Ordered step names for the active role.
 * @param {number} props.current Zero-based index of the active step.
 * @returns {JSX.Element} The step indicator.
 */
export function StepIndicator({ steps, current }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0, marginBottom: 36,
    }}
    >
      {steps.map((step, i) => (
        <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
          }}
          >
            <div style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: (() => {
                if (i < current) { return '#065f46'; }
                return i === current ? '#10b981' : '#e2e8f0';
              })(),
              border: i === current ? '2px solid #065f46' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: i <= current ? '#fff' : '#94a3b8',
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
            }}
            >
              {i < current ? '✓' : i + 1}
            </div>
            <div style={{
              fontSize: 10, fontWeight: i === current ? 700 : 400, color: i === current ? '#065f46' : '#94a3b8', whiteSpace: 'nowrap',
            }}
            >
              {step}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: 2, background: i < current ? '#065f46' : '#e2e8f0', margin: '0 6px', marginBottom: 16,
            }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

StepIndicator.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.string).isRequired,
  current: PropTypes.number.isRequired,
};

/**
 * Single labeled text/date/number input with an inline validation message.
 * @param {object} props Component props.
 * @param {string} props.label Field label text.
 * @param {string} props.name Field name, used for the input id.
 * @param {string} props.type HTML input type.
 * @param {string} props.placeholder Placeholder text.
 * @param {string} props.value Current field value.
 * @param {string} props.error Validation message, if any.
 * @param {boolean} props.required Whether to show the required asterisk.
 * @param {Function} props.onChange Called with the new field value.
 * @returns {JSX.Element} The labeled input.
 */
export function TextField({
  label, name, type, placeholder, value, error, required, onChange,
}) {
  return (
    <div>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label htmlFor={name} style={labelStyle}>
        {label}
        {' '}
        {required && <span style={{ color: '#ef4444' }}>*</span>}
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
  // eslint-disable-next-line react/require-default-props
  type: PropTypes.string,
  // eslint-disable-next-line react/require-default-props
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  // eslint-disable-next-line react/require-default-props
  error: PropTypes.string,
  // eslint-disable-next-line react/require-default-props
  required: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

/**
 * Single labeled multiline textarea with an inline validation message.
 * @param {object} props Component props.
 * @param {string} props.label Field label text.
 * @param {string} props.name Field name, used for the textarea id.
 * @param {string} props.placeholder Placeholder text.
 * @param {string} props.value Current field value.
 * @param {string} props.error Validation message, if any.
 * @param {boolean} props.required Whether to show the required asterisk.
 * @param {Function} props.onChange Called with the new field value.
 * @returns {JSX.Element} The labeled textarea.
 */
export function TextAreaField({
  label, name, placeholder, value, error, required, onChange,
}) {
  return (
    <div>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label htmlFor={name} style={labelStyle}>
        {label}
        {' '}
        {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...fieldStyle, height: 80, resize: 'vertical', paddingTop: 10, borderColor: error ? '#ef4444' : fieldStyle.border,
        }}
      />
      {error && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#ef4444' }}>{error}</p>}
    </div>
  );
}

TextAreaField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  // eslint-disable-next-line react/require-default-props
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  // eslint-disable-next-line react/require-default-props
  error: PropTypes.string,
  // eslint-disable-next-line react/require-default-props
  required: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

/**
 * Single labeled select with an inline validation message.
 * @param {object} props Component props.
 * @param {string} props.label Field label text.
 * @param {string} props.name Field name, used for the select id.
 * @param {string} props.placeholder First, disabled "choose one" option.
 * @param {string[]} props.options Selectable option values.
 * @param {string} props.value Current field value.
 * @param {string} props.error Validation message, if any.
 * @param {boolean} props.required Whether to show the required asterisk.
 * @param {Function} props.onChange Called with the new field value.
 * @returns {JSX.Element} The labeled select.
 */
export function SelectField({
  label, name, placeholder, options, value, error, required, onChange,
}) {
  return (
    <div>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label htmlFor={name} style={labelStyle}>
        {label}
        {' '}
        {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...fieldStyle, appearance: 'none', borderColor: error ? '#ef4444' : fieldStyle.border,
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      {error && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#ef4444' }}>{error}</p>}
    </div>
  );
}

SelectField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  value: PropTypes.string.isRequired,
  // eslint-disable-next-line react/require-default-props
  error: PropTypes.string,
  // eslint-disable-next-line react/require-default-props
  required: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

/**
 * Toggleable pill list for selecting one or more values from a fixed set
 * (service zones, supported waste categories, ...).
 * @param {object} props Component props.
 * @param {string} props.label Field label text.
 * @param {string[]} props.options Selectable option values.
 * @param {string[]} props.selected Currently selected values.
 * @param {string} props.error Validation message, if any.
 * @param {Function} props.onToggle Called with the option that was clicked.
 * @returns {JSX.Element} The chip multi-select.
 */
export function ChipMultiSelect({
  label, options, selected, error, onToggle,
}) {
  return (
    <div>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label style={{ ...labelStyle, marginBottom: 8 }}>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              style={{
                padding: '6px 14px',
                borderRadius: 9999,
                border: `1px solid ${isSelected ? '#065f46' : '#e2e8f0'}`,
                fontSize: 13,
                cursor: 'pointer',
                background: isSelected ? '#f0fdf4' : '#f8fafc',
                color: isSelected ? '#065f46' : '#475569',
                fontFamily: 'inherit',
                fontWeight: isSelected ? 700 : 400,
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
      {error && <p style={{ margin: '8px 0 0', fontSize: 12, color: '#ef4444' }}>{error}</p>}
    </div>
  );
}

ChipMultiSelect.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
  // eslint-disable-next-line react/require-default-props
  error: PropTypes.string,
  onToggle: PropTypes.func.isRequired,
};

/**
 * File-picker placeholder for a KYC document. Captures the chosen file's
 * name only — there is no server-side file storage in this project yet, so
 * "uploading" here means recording that the user attached something; see
 * PROFILE_COMPLETION_SPEC.md.
 * @param {object} props Component props.
 * @param {string} props.label Name of the document to upload.
 * @param {string} props.fileName Currently selected file's name, if any.
 * @param {string} props.error Validation message, if any.
 * @param {Function} props.onChange Called with the selected file's name.
 * @returns {JSX.Element} The upload box.
 */
export function UploadBox({
  label, fileName, error, onChange,
}) {
  const inputId = `upload-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label
        htmlFor={inputId}
        style={{
          display: 'block',
          border: `2px dashed ${error ? '#ef4444' : '#e2e8f0'}`,
          borderRadius: 10,
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          background: fileName ? '#f0fdf4' : '#fafafa',
        }}
      >
        <div style={{ fontSize: 24, marginBottom: 6 }}>{fileName ? '✅' : '📎'}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</div>
        <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
          {fileName || 'PDF, JPG, or PNG — click to choose a file'}
        </div>
        <input
          id={inputId}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => onChange((e.target.files && e.target.files[0] && e.target.files[0].name) || '')}
          style={{ display: 'none' }}
        />
      </label>
      {error && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#ef4444' }}>{error}</p>}
    </div>
  );
}

UploadBox.propTypes = {
  label: PropTypes.string.isRequired,
  // eslint-disable-next-line react/require-default-props
  fileName: PropTypes.string,
  // eslint-disable-next-line react/require-default-props
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default {
  StepIndicator, TextField, TextAreaField, SelectField, ChipMultiSelect, UploadBox,
};
