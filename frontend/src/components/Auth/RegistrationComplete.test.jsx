import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RegistrationComplete from './RegistrationComplete';

describe('RegistrationComplete', () => {
  it('shows the account-created confirmation message', () => {
    render(<RegistrationComplete onGoToLogin={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /account created/i })).toBeInTheDocument();
    expect(screen.getByText(/log in to complete your profile/i)).toBeInTheDocument();
  });

  it('calls onGoToLogin when the CTA is clicked', () => {
    const onGoToLogin = vi.fn();
    render(<RegistrationComplete onGoToLogin={onGoToLogin} />);

    fireEvent.click(screen.getByRole('button', { name: /go to login/i }));

    expect(onGoToLogin).toHaveBeenCalledTimes(1);
  });
});
