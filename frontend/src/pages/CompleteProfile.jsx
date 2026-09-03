import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import ProfileCompletion from '../components/Auth/ProfileCompletion';
import ProfileCompletionDone from '../components/Auth/ProfileCompletionDone';
import { completeProfile as completeProfileRequest } from '../services/userService';
import useAuth from '../hooks/useAuth';
import { ROLE_DASHBOARD_ROUTES, KYC_PENDING_ROLES } from '../utils/constants';

const SCREENS = { FORM: 'form', DONE: 'done' };

/**
 * Post-login profile-completion page (FR-01): once a user logs in with an
 * incomplete profile, they land here to fill in the role-specific fields
 * deferred out of the minimal registration form (NID, KYC documents,
 * address, payout method, etc.) — see PROFILE_COMPLETION_SPEC.md.
 * @returns {JSX.Element} The profile-completion page.
 */
function CompleteProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [screen, setScreen] = useState(SCREENS.FORM);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Checked only once we know we're not already showing the DONE screen:
  // handleComplete flips user.profileCompleted to true via setUser(), and
  // that update must not bounce the user away before they see the
  // confirmation screen it unlocked.
  if (screen === SCREENS.FORM && user.profileCompleted) {
    return <Navigate to={ROLE_DASHBOARD_ROUTES[user.role] || '/'} replace />;
  }

  const handleComplete = async (profileData) => {
    setSubmitError('');
    setSubmitting(true);
    try {
      const { user: updatedUser } = await completeProfileRequest(profileData);
      setUser(updatedUser);
      setScreen(SCREENS.DONE);
    } catch (err) {
      setSubmitError(err.message || 'Could not save your profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (screen === SCREENS.DONE) {
    return (
      <ProfileCompletionDone
        requiresKyc={KYC_PENDING_ROLES.includes(user.role)}
        onGoToDashboard={() => navigate(ROLE_DASHBOARD_ROUTES[user.role] || '/')}
      />
    );
  }

  return (
    <ProfileCompletion
      role={user.role}
      onComplete={handleComplete}
      submitting={submitting}
      submitError={submitError}
    />
  );
}

export default CompleteProfile;
