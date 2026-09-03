import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';
import { forgotPassword } from '../services/authService';

vi.mock('../services/authService', () => ({
  forgotPassword: vi.fn(),
}));

/**
 * Renders the ForgotPassword page inside a router with stub destination
 * routes.
 * @returns {void}
 */
function renderForgotPasswordPage() {
  render(
    <MemoryRouter initialEntries={['/forgot-password']}>
      <Routes>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/login" element={<h1>Login</h1>} />
        <Route path="/reset-password" element={<h1>Reset Password</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ForgotPassword page', () => {
  beforeEach(() => {
    forgotPassword.mockReset();
  });

  it('blocks submission when the email is empty', () => {
    renderForgotPasswordPage();

    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(forgotPassword).not.toHaveBeenCalled();
  });

  it('shows the generic confirmation message after submitting', async () => {
    forgotPassword.mockResolvedValue({
      message: 'If an account exists for that email, a password reset link has been sent.',
    });
    renderForgotPasswordPage();

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'farhan@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/password reset link has been sent/i)).toBeInTheDocument();
    });
    expect(forgotPassword).toHaveBeenCalledWith('farhan@example.com');
  });

  it('shows a dev-mode reset link when the backend returns a token', async () => {
    forgotPassword.mockResolvedValue({
      message: 'If an account exists for that email, a password reset link has been sent.',
      resetToken: 'abc123',
    });
    renderForgotPasswordPage();

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'farhan@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /reset your password/i })).toHaveAttribute(
        'href',
        '/reset-password?token=abc123',
      );
    });
  });

  it('does not show a reset link when the backend omits the token', async () => {
    forgotPassword.mockResolvedValue({ message: 'Generic message.' });
    renderForgotPasswordPage();

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'farhan@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/generic message/i)).toBeInTheDocument();
    });
    expect(screen.queryByRole('link', { name: /reset your password/i })).not.toBeInTheDocument();
  });

  it('shows the server error message when the request fails', async () => {
    forgotPassword.mockRejectedValue(new Error('Something went wrong.'));
    renderForgotPasswordPage();

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'farhan@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });
});
