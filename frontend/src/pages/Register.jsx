import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountTypeSelect from '../components/Auth/AccountTypeSelect';
import RegisterFlow from '../components/Auth/RegisterFlow';
import RegistrationComplete from '../components/Auth/RegistrationComplete';

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

  if (screen === SCREENS.FORM) {
    return (
      <RegisterFlow
        accountType={accountType}
        onBack={() => setScreen(SCREENS.SELECT)}
        onComplete={() => setScreen(SCREENS.COMPLETE)}
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
