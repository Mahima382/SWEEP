/**
 * @fileoverview FR-01 — post-login profile completion: picks the right
 * multi-step wizard for the logged-in user's role. See
 * PROFILE_COMPLETION_SPEC.md for what each role collects and why this is
 * split out of the minimal registration form.
 * @module ProfileCompletion
 */

import React from 'react';
import PropTypes from 'prop-types';
import HouseholdProfileForm from './HouseholdProfileForm';
import CollectorProfileForm from './CollectorProfileForm';
import GlobalCollectorProfileForm from './GlobalCollectorProfileForm';
import CompanyProfileForm from './CompanyProfileForm';

const FORMS_BY_ROLE = {
  household: HouseholdProfileForm,
  collector: CollectorProfileForm,
  global: GlobalCollectorProfileForm,
  company: CompanyProfileForm,
};

/**
 * Renders the profile-completion wizard matching the given role.
 * @param {object} props Component props.
 * @param {string} props.role One of household | collector | global | company.
 * @param {Function} props.onComplete Called with the assembled profile data.
 * @param {boolean} props.submitting Whether the profile is currently being saved.
 * @param {string} props.submitError Server-side error message, if any.
 * @returns {JSX.Element|null} The role's profile wizard, or null for an
 *   unrecognized role (should not happen for a logged-in user).
 */
export default function ProfileCompletion({
  role, onComplete, submitting, submitError,
}) {
  const RoleForm = FORMS_BY_ROLE[role];
  if (!RoleForm) {
    return null;
  }
  return <RoleForm onComplete={onComplete} submitting={submitting} submitError={submitError} />;
}

ProfileCompletion.propTypes = {
  role: PropTypes.oneOf(['household', 'collector', 'global', 'company']).isRequired,
  onComplete: PropTypes.func.isRequired,
  // eslint-disable-next-line react/require-default-props
  submitting: PropTypes.bool,
  // eslint-disable-next-line react/require-default-props
  submitError: PropTypes.string,
};
