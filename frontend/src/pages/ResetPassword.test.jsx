import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ResetPassword from './ResetPassword';
import { resetPassword } from '../services/authService';

vi.mock('../services/authService', () => ({
  resetPassword: vi.fn(),
}));

/**
 * Renders the ResetPassword page inside a router with the given query
 * string and a stub /login route.
 * @param {string} search Query string, e.g. '?token=abc123'.
 * @returns {void}
 */
function renderResetPasswordPage(search = '?token=abc123') {
  render(
    <MemoryRouter initialEntries={[`/reset-password${search}`]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/login" element={<h1>Login</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ResetPassword page', () => {
  beforeEach(() => {
    resetPassword.mockReset();
  });

  it('disables submission and warns when the link has no token', () => {
    renderResetPasswordPage('');

    expect(screen.getByText(/missing its reset token/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeDisabled();
  });

  it('blocks submission when the password is too weak or does not match', () => {
    renderResetPasswordPage();

    fireEvent.change(screen.getByLabelText(/^new password/i), { target: { value: 'weak' } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'different' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(screen.getByText(/min 8 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it('resets the password and shows the confirmation screen', async () => {
    resetPassword.mockResolvedValue({ message: 'Your password has been reset.' });
    renderResetPasswordPage();

    fireEvent.change(screen.getByLabelText(/^new password/i), { target: { value: 'NewStr0ng!Pass' } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'NewStr0ng!Pass' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /password reset/i })).toBeInTheDocument();
    });
    expect(resetPassword).toHaveBeenCalledWith('abc123', 'NewStr0ng!Pass');

    fireEvent.click(screen.getByRole('link', { name: /go to login/i }));
    expect(screen.getByRole('heading', { name: /^login$/i })).toBeInTheDocument();
  });

  it('shows the server error message for an invalid or expired token', async () => {
    resetPassword.mockRejectedValue(new Error('This reset link is invalid or has expired.'));
    renderResetPasswordPage();

    fireEvent.change(screen.getByLabelText(/^new password/i), { target: { value: 'NewStr0ng!Pass' } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'NewStr0ng!Pass' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid or has expired/i)).toBeInTheDocument();
    });
  });
});
