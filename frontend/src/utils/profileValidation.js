/**
 * Client-side validation for the post-login profile-completion wizard
 * (FR-01). Mirrors backend/utils/validators.js#validateProfileData so the
 * wizard can block a step before the user reaches the server — the backend
 * remains the source of truth and re-validates on submit.
 *
 * Unlike the backend (which returns a flat map of dotted field paths, handy
 * for a JSON API), these return nested error objects shaped like the form
 * state itself, which is what the field components here expect.
 */

const EMAIL_POLICY = /^\S+@\S+\.\S+$/;

/**
 * @param {string} value Candidate value.
 * @returns {boolean} True when the value is missing or, for strings, blank.
 */
function isBlank(value) {
  return value === undefined || value === null || (typeof value === 'string' && !value.trim());
}

/**
 * Validates the address sub-object shared by household and local-collector
 * profiles.
 * @param {object} address Candidate address value.
 * @returns {object} Nested error object for the address fields.
 */
function validateAddress(address) {
  const a = address || {};
  const errors = {};
  if (isBlank(a.division)) { errors.division = 'Division is required.'; }
  if (isBlank(a.district)) { errors.district = 'District is required.'; }
  if (isBlank(a.city)) { errors.city = 'City / Municipality is required.'; }
  if (isBlank(a.area)) { errors.area = 'Area is required.'; }
  if (isBlank(a.detailedAddress)) { errors.detailedAddress = 'Detailed address is required.'; }
  return errors;
}

/**
 * Validates the optional payout sub-object. Never required at
 * profile-completion time — only when a method has been chosen.
 * @param {object} payout Candidate payout value.
 * @returns {object} Nested error object for the payout fields.
 */
function validatePayout(payout) {
  const p = payout || {};
  if (!p.method) { return {}; }
  const errors = {};
  if (isBlank(p.accountNumber)) { errors.accountNumber = 'Account number is required for the selected payout method.'; }
  if (p.method === 'bank' && isBlank(p.bankName)) { errors.bankName = 'Bank name is required.'; }
  return errors;
}

/**
 * @param {object} data Household profile form state.
 * @returns {object} Nested error object.
 */
export function validateHouseholdProfile(data) {
  const errors = {};
  if (isBlank(data.nid)) { errors.nid = 'NID number is required.'; }
  const addressErrors = validateAddress(data.address);
  if (Object.keys(addressErrors).length) { errors.address = addressErrors; }
  const payoutErrors = validatePayout(data.payout);
  if (Object.keys(payoutErrors).length) { errors.payout = payoutErrors; }
  return errors;
}

/**
 * @param {object} data Local-collector profile form state.
 * @returns {object} Nested error object.
 */
export function validateCollectorProfile(data) {
  const errors = {};
  const docs = data.documents || {};
  const docErrors = {};
  if (isBlank(data.nid)) { errors.nid = 'NID number is required.'; }
  if (isBlank(docs.nidFront)) { docErrors.nidFront = 'NID front image is required.'; }
  if (isBlank(docs.nidBack)) { docErrors.nidBack = 'NID back image is required.'; }
  if (isBlank(docs.profilePhoto)) { docErrors.profilePhoto = 'Profile photo is required.'; }
  if (Object.keys(docErrors).length) { errors.documents = docErrors; }
  if (isBlank(data.dob)) { errors.dob = 'Date of birth is required.'; }
  const addressErrors = validateAddress(data.address);
  if (Object.keys(addressErrors).length) { errors.address = addressErrors; }
  if (isBlank(data.dailyCapacity)) { errors.dailyCapacity = 'Daily pickup capacity is required.'; }
  if (!Array.isArray(data.serviceZones) || data.serviceZones.length === 0) {
    errors.serviceZones = 'Select at least one service zone.';
  }
  const payoutErrors = validatePayout(data.payout);
  if (Object.keys(payoutErrors).length) { errors.payout = payoutErrors; }
  return errors;
}

/**
 * @param {object} data Global-collector profile form state.
 * @returns {object} Nested error object. `documents` and `vehicleDocuments`
 *   are kept as separate top-level keys — one per wizard step (NID &
 *   Documents vs. Licence & Vehicle) — so that pickFields() for one step
 *   never drags in unfilled-because-not-reached-yet errors from the other.
 */
export function validateGlobalCollectorProfile(data) {
  const errors = {};
  const docs = data.documents || {};
  const docErrors = {};
  const vehicleDocErrors = {};
  if (isBlank(data.nid)) { errors.nid = 'NID number is required.'; }
  if (isBlank(docs.nidFront)) { docErrors.nidFront = 'NID front image is required.'; }
  if (isBlank(docs.nidBack)) { docErrors.nidBack = 'NID back image is required.'; }
  if (isBlank(docs.profilePhoto)) { docErrors.profilePhoto = 'Profile photo is required.'; }
  if (Object.keys(docErrors).length) { errors.documents = docErrors; }
  if (isBlank(data.drivingLicenceNumber)) { errors.drivingLicenceNumber = 'Driving licence number is required.'; }
  if (isBlank(docs.drivingLicence)) { vehicleDocErrors.drivingLicence = 'Driving licence document is required.'; }
  if (isBlank(data.vehicleRegistrationNumber)) { errors.vehicleRegistrationNumber = 'Vehicle registration number is required.'; }
  if (isBlank(docs.vehicleRegistration)) { vehicleDocErrors.vehicleRegistration = 'Vehicle registration document is required.'; }
  if (Object.keys(vehicleDocErrors).length) { errors.vehicleDocuments = vehicleDocErrors; }
  if (isBlank(data.vehicleCapacity)) { errors.vehicleCapacity = 'Vehicle capacity is required.'; }
  const payoutErrors = validatePayout(data.payout);
  if (Object.keys(payoutErrors).length) { errors.payout = payoutErrors; }
  return errors;
}

/**
 * @param {object} data Company profile form state.
 * @returns {object} Nested error object. `ewasteDocuments` and `documents`
 *   are kept as separate top-level keys — one per wizard step (Waste
 *   Categories vs. KYC Documents) — so that pickFields() for one step never
 *   drags in unfilled-because-not-reached-yet errors from the other.
 */
export function validateCompanyProfile(data) {
  const errors = {};
  const docs = data.documents || {};
  const docErrors = {};
  const ewasteDocErrors = {};
  const person = data.authorizedPerson || {};
  const personErrors = {};

  if (isBlank(data.registrationNumber)) { errors.registrationNumber = 'Registration number is required.'; }
  if (isBlank(data.officeAddress)) { errors.officeAddress = 'Office address is required.'; }

  const hasCategories = Array.isArray(data.supportedCategories)
    && data.supportedCategories.length > 0;
  if (!hasCategories) {
    errors.supportedCategories = 'Select at least one supported waste category.';
  } else if (data.supportedCategories.includes('E-waste')) {
    if (isBlank(data.ewasteLicenceNumber)) {
      errors.ewasteLicenceNumber = 'E-waste handling licence number is required when E-waste is selected.';
    }
    if (isBlank(docs.ewasteLicence)) {
      ewasteDocErrors.ewasteLicence = 'E-waste licence document is required when E-waste is selected.';
    }
  }
  if (Object.keys(ewasteDocErrors).length) { errors.ewasteDocuments = ewasteDocErrors; }

  if (isBlank(docs.tradeLicence)) { docErrors.tradeLicence = 'Trade licence document is required.'; }
  if (isBlank(docs.companyRegistration)) { docErrors.companyRegistration = 'Company registration document is required.'; }
  if (isBlank(docs.tin)) { docErrors.tin = 'TIN / tax certificate is required.'; }
  if (isBlank(docs.vat)) { docErrors.vat = 'VAT certificate is required.'; }
  if (isBlank(docs.directorNid)) { docErrors.directorNid = 'Director NID document is required.'; }
  if (Object.keys(docErrors).length) { errors.documents = docErrors; }

  if (isBlank(person.name)) { personErrors.name = 'Authorized person name is required.'; }
  if (isBlank(person.role)) { personErrors.role = 'Authorized person role/designation is required.'; }
  if (isBlank(person.phone)) { personErrors.phone = 'Authorized person phone is required.'; }
  if (!EMAIL_POLICY.test((person.email || '').trim())) {
    personErrors.email = 'Enter a valid email address for the authorized person.';
  }
  if (isBlank(person.nid)) { personErrors.nid = 'Authorized person NID number is required.'; }
  if (Object.keys(personErrors).length) { errors.authorizedPerson = personErrors; }

  return errors;
}

/**
 * Picks a subset of top-level keys out of an error object, so a multi-step
 * wizard can show only the errors relevant to the step the user is on
 * (e.g. don't flag missing payout details while they're still on the
 * address step).
 * @param {object} errors Full nested error object.
 * @param {string[]} keys Top-level keys to keep.
 * @returns {object} Errors restricted to the given keys.
 */
export function pickFields(errors, keys) {
  return keys.reduce((picked, key) => {
    if (errors[key] !== undefined) {
      return { ...picked, [key]: errors[key] };
    }
    return picked;
  }, {});
}

export default {
  validateHouseholdProfile,
  validateCollectorProfile,
  validateGlobalCollectorProfile,
  validateCompanyProfile,
  pickFields,
};
