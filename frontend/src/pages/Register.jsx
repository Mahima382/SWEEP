import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountTypeSelect from '../components/Auth/AccountTypeSelect';
import RegisterFlow from '../components/Auth/RegisterFlow';
import RegistrationComplete from '../components/Auth/RegistrationComplete';
import { register as registerAccount } from '../services/authService';

const SCREENS = { SELECT: 'select', FORM: 'form', COMPLETE: 'complete' };

/**
 * Registration page (FR-01): pick an account type, create the minimal
 * account (full name, email, mobile number, password), then confirm.
 * Role-specific details (NID, KYC docs, address, payout method, etc.) are
 * collected later in the post-login profile completion flow — see
 * PROFILE_COMPLETION_SPEC.md.
 * @returns {JSX.Element} The registration page.
 */
function Register() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState(SCREENS.SELECT);
  const [accountType, setAccountType] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async (formData) => {
    setSubmitError('');
    setSubmitting(true);
    try {
      const { confirmPassword, ...registrationData } = formData;
      await registerAccount(registrationData);
      setScreen(SCREENS.COMPLETE);
    } catch (err) {
      setSubmitError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (screen === SCREENS.FORM) {
    return (
      <RegisterFlow
        accountType={accountType}
        onBack={() => setScreen(SCREENS.SELECT)}
        onComplete={handleRegister}
        submitting={submitting}
        submitError={submitError}
      />
    );
  }

  if (screen === SCREENS.COMPLETE) {
    return <RegistrationComplete onGoToLogin={() => navigate('/login')} />;
  }

  return (
    <AccountTypeSelect
      onSelect={(type) => { setAccountType(type); setScreen(SCREENS.FORM); }}
      onBack={() => navigate('/login')}
    />
  );
}

export default Register;
