import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import AppRoutes from '../routes/AppRoutes';

/**
 * Helper to render a route inside the full app shell.
 */
function renderRoute(path) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('FR-12 Login Page', () => {
  it('renders the login page with Welcome back heading', () => {
    renderRoute('/login');
    expect(
      screen.getByRole('heading', { name: /welcome back/i }),
    ).toBeInTheDocument();
  });

  it('has a Forgot password link', () => {
    renderRoute('/login');
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  it('has a Remember me checkbox', () => {
    renderRoute('/login');
    expect(
      screen.getByLabelText(/remember me for 30 days/i),
    ).toBeInTheDocument();
  });

  it('has email and password inputs', () => {
    renderRoute('/login');
    expect(
      screen.getByPlaceholderText(/you@example.com/i),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter your password/i),
    ).toBeInTheDocument();
  });

  it('has a Create account link', () => {
    renderRoute('/login');
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
  });

  it('disables Sign In button when fields are empty', () => {
    renderRoute('/login');
    const btn = screen.getByRole('button', { name: /sign in/i });
    expect(btn).toBeDisabled();
  });
});

describe('FR-12 Forgot Password Page', () => {
  it('renders the forgot password page', () => {
    renderRoute('/forgot-password');
    expect(
      screen.getByRole('heading', { name: /forgot password/i }),
    ).toBeInTheDocument();
  });

  it('has an email input and Send Reset Link button', () => {
    renderRoute('/forgot-password');
    expect(
      screen.getByPlaceholderText(/you@example.com/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /send reset link/i }),
    ).toBeInTheDocument();
  });

  it('has a Back to Sign In link', () => {
    renderRoute('/forgot-password');
    expect(screen.getByText(/back to sign in/i)).toBeInTheDocument();
  });
});

describe('FR-12 Reset Password Page', () => {
  it('renders the reset password page', () => {
    renderRoute('/reset-password?token=abc&email=test@test.com');
    expect(
      screen.getByRole('heading', { name: /set new password/i }),
    ).toBeInTheDocument();
  });

  it('has password and confirm password inputs', () => {
    renderRoute('/reset-password?token=abc&email=test@test.com');
    expect(
      screen.getByLabelText(/new password/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/confirm password/i),
    ).toBeInTheDocument();
  });

  it('shows password strength indicators when typing', () => {
    renderRoute('/reset-password?token=abc&email=test@test.com');
    const input = screen.getByLabelText(/^new password$/i);
    fireEvent.change(input, { target: { value: 'A' } });
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/one uppercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/one lowercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/one number/i)).toBeInTheDocument();
    expect(screen.getByText(/one special character/i)).toBeInTheDocument();
  });

  it('shows mismatch warning when passwords differ', () => {
    renderRoute('/reset-password?token=abc&email=test@test.com');
    const pw = screen.getByLabelText(/^new password$/i);
    const confirm = screen.getByLabelText(/confirm password/i);
    fireEvent.change(pw, { target: { value: 'Password1!' } });
    fireEvent.change(confirm, { target: { value: 'Different1!' } });
    expect(
      screen.getByText(/passwords do not match/i),
    ).toBeInTheDocument();
  });

  it('has a Back to Sign In link', () => {
    renderRoute('/reset-password?token=abc&email=test@test.com');
    expect(screen.getByText(/back to sign in/i)).toBeInTheDocument();
  });
});
