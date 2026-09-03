/**
 * Shared input validators for auth flows (FR-01, FR-02).
 * Mirrors the client-side rules in frontend/src/components/Auth/RegisterFlow.jsx
 * so the server enforces the same policy at the trust boundary.
 */

const EMAIL_POLICY = /^\S+@\S+\.\S+$/;
const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const MOBILE_POLICY = /^01[0-9]{9}$/;
const ACCOUNT_TYPES = ['household', 'collector', 'global', 'company'];

/**
 * @param {string} email - Candidate email address.
 * @returns {boolean} True when the email looks valid.
 */
function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_POLICY.test(email.trim());
}

/**
 * @param {string} password - Candidate password.
 * @returns {boolean} True when the password meets the NFR password policy
 *   (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character).
 */
function isValidPassword(password) {
  return typeof password === 'string' && PASSWORD_POLICY.test(password);
}

/**
 * @param {string} mobile - Candidate mobile number.
 * @returns {boolean} True when it is an 11-digit Bangladeshi mobile number.
 */
function isValidMobile(mobile) {
  return typeof mobile === 'string' && MOBILE_POLICY.test(mobile.trim());
}

/**
 * @param {string} accountType - Candidate self-service account type.
 * @returns {boolean} True when it is one of the four self-registrable roles.
 */
function isValidRole(accountType) {
  return ACCOUNT_TYPES.includes(accountType);
}

/**
 * Builds a single-entry error object for a required field when its value is
 * missing (undefined/null) or, for strings, blank after trimming. Returns an
 * empty object when the value is present, so call sites can always spread
 * the result into their error map.
 * @param {string} field - Dotted field path used as the error key.
 * @param {*} value - Candidate value.
 * @param {string} message - Message to record when the value is missing.
 * @returns {object} `{ [field]: message }`, or `{}` when the value is present.
 */
function requireField(field, value, message) {
  const isBlank = value === undefined || value === null
    || (typeof value === 'string' && !value.trim());
  return isBlank ? { [field]: message } : {};
}

/**
 * Validates the address sub-object shared by household and local-collector
 * profiles (division, district, city, area, detailed address). No map pin —
 * there is no Google Maps integration in this project.
 * @param {object} address - Candidate address object.
 * @param {string} prefix - Dotted prefix for error keys, e.g. 'address'.
 * @returns {object} Map of dotted field path to error message.
 */
function validateAddress(address, prefix) {
  const a = address || {};
  return {
    ...requireField(`${prefix}.division`, a.division, 'Division is required.'),
    ...requireField(`${prefix}.district`, a.district, 'District is required.'),
    ...requireField(`${prefix}.city`, a.city, 'City / Municipality is required.'),
    ...requireField(`${prefix}.area`, a.area, 'Area is required.'),
    ...requireField(`${prefix}.detailedAddress`, a.detailedAddress, 'Detailed address is required.'),
  };
}

/**
 * Validates the optional payout sub-object (bKash / Nagad / bank). Payout is
 * never required at profile-completion time (only before first withdrawal),
 * but when a method is chosen its account details must be present.
 * @param {object} payout - Candidate payout object, may be absent entirely.
 * @returns {object} Map of dotted field path to error message.
 */
function validatePayout(payout) {
  if (!payout || !payout.method) {
    return {};
  }
  if (!['bkash', 'nagad', 'bank'].includes(payout.method)) {
    return { 'payout.method': 'Unknown payout method.' };
  }
  return {
    ...requireField('payout.accountNumber', payout.accountNumber, 'Account number is required for the selected payout method.'),
    ...(payout.method === 'bank' ? requireField('payout.bankName', payout.bankName, 'Bank name is required.') : {}),
  };
}

/**
 * Validates household profile-completion fields (FR-01, FR-03/FR-04):
 * NID and pickup address; payout is optional at this stage.
 * @param {object} data - Submitted profile data.
 * @returns {object} Map of dotted field path to error message.
 */
function validateHouseholdProfile(data) {
  return {
    ...requireField('nid', data.nid, 'NID number is required.'),
    ...validateAddress(data.address, 'address'),
    ...validatePayout(data.payout),
  };
}

/**
 * Validates local-collector profile-completion fields (FR-01, FR-05): NID +
 * KYC documents, personal details, service address, capacity, and at least
 * one service zone; payout is optional at this stage.
 * @param {object} data - Submitted profile data.
 * @returns {object} Map of dotted field path to error message.
 */
function validateCollectorProfile(data) {
  const docs = data.documents || {};
  return {
    ...requireField('nid', data.nid, 'NID number is required.'),
    ...requireField('documents.nidFront', docs.nidFront, 'NID front image is required.'),
    ...requireField('documents.nidBack', docs.nidBack, 'NID back image is required.'),
    ...requireField('documents.profilePhoto', docs.profilePhoto, 'Profile photo is required.'),
    ...requireField('dob', data.dob, 'Date of birth is required.'),
    ...validateAddress(data.address, 'address'),
    ...requireField('dailyCapacity', data.dailyCapacity, 'Daily pickup capacity is required.'),
    ...(!Array.isArray(data.serviceZones) || data.serviceZones.length === 0
      ? { serviceZones: 'Select at least one service zone.' } : {}),
    ...validatePayout(data.payout),
  };
}

/**
 * Validates global-collector profile-completion fields (FR-01, FR-05): NID +
 * KYC documents, driving licence, and vehicle registration/capacity; payout
 * is optional at this stage.
 * @param {object} data - Submitted profile data.
 * @returns {object} Map of dotted field path to error message.
 */
function validateGlobalCollectorProfile(data) {
  const docs = data.documents || {};
  return {
    ...requireField('nid', data.nid, 'NID number is required.'),
    ...requireField('documents.nidFront', docs.nidFront, 'NID front image is required.'),
    ...requireField('documents.nidBack', docs.nidBack, 'NID back image is required.'),
    ...requireField('documents.profilePhoto', docs.profilePhoto, 'Profile photo is required.'),
    ...requireField('drivingLicenceNumber', data.drivingLicenceNumber, 'Driving licence number is required.'),
    ...requireField('documents.drivingLicence', docs.drivingLicence, 'Driving licence document is required.'),
    ...requireField('vehicleRegistrationNumber', data.vehicleRegistrationNumber, 'Vehicle registration number is required.'),
    ...requireField('documents.vehicleRegistration', docs.vehicleRegistration, 'Vehicle registration document is required.'),
    ...requireField('vehicleCapacity', data.vehicleCapacity, 'Vehicle capacity is required.'),
    ...validatePayout(data.payout),
  };
}

/**
 * Validates recycling-company profile-completion fields (FR-01, FR-07,
 * FR-08): company info, supported waste categories (E-waste requires a
 * licence), KYC documents, and the authorized person. Subscription plan
 * selection happens after KYC approval (FR-07) and is out of scope here.
 * @param {object} data - Submitted profile data.
 * @returns {object} Map of dotted field path to error message.
 */
function validateCompanyProfile(data) {
  const docs = data.documents || {};
  const person = data.authorizedPerson || {};
  const hasCategories = Array.isArray(data.supportedCategories)
    && data.supportedCategories.length > 0;
  const needsEwasteLicence = hasCategories && data.supportedCategories.includes('E-waste');

  return {
    ...requireField('registrationNumber', data.registrationNumber, 'Registration number is required.'),
    ...requireField('officeAddress', data.officeAddress, 'Office address is required.'),
    ...(!hasCategories ? { supportedCategories: 'Select at least one supported waste category.' } : {}),
    ...(needsEwasteLicence ? requireField('ewasteLicenceNumber', data.ewasteLicenceNumber, 'E-waste handling licence number is required when E-waste is selected.') : {}),
    ...(needsEwasteLicence ? requireField('documents.ewasteLicence', docs.ewasteLicence, 'E-waste licence document is required when E-waste is selected.') : {}),
    ...requireField('documents.tradeLicence', docs.tradeLicence, 'Trade licence document is required.'),
    ...requireField('documents.companyRegistration', docs.companyRegistration, 'Company registration document is required.'),
    ...requireField('documents.tin', docs.tin, 'TIN / tax certificate is required.'),
    ...requireField('documents.vat', docs.vat, 'VAT certificate is required.'),
    ...requireField('documents.directorNid', docs.directorNid, 'Director NID document is required.'),
    ...requireField('authorizedPerson.name', person.name, 'Authorized person name is required.'),
    ...requireField('authorizedPerson.role', person.role, 'Authorized person role/designation is required.'),
    ...requireField('authorizedPerson.phone', person.phone, 'Authorized person phone is required.'),
    ...(!isValidEmail(person.email) ? { 'authorizedPerson.email': 'Enter a valid email address for the authorized person.' } : {}),
    ...requireField('authorizedPerson.nid', person.nid, 'Authorized person NID number is required.'),
  };
}

const PROFILE_VALIDATORS = {
  household: validateHouseholdProfile,
  collector: validateCollectorProfile,
  global: validateGlobalCollectorProfile,
  company: validateCompanyProfile,
};

/**
 * Validates a post-login profile-completion payload for the given role
 * (see PROFILE_COMPLETION_SPEC.md for the field checklist this mirrors).
 * @param {string} role - One of household | collector | global | company.
 * @param {object} data - Submitted profile data.
 * @returns {object} Map of dotted field path to error message, empty when valid.
 */
function validateProfileData(role, data) {
  const validator = PROFILE_VALIDATORS[role];
  if (!validator) {
    return { role: 'Unknown role.' };
  }
  return validator(data || {});
}

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidMobile,
  isValidRole,
  validateProfileData,
  ACCOUNT_TYPES,
};
