import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import { AuthProvider } from '../context/AuthContext';
import { login } from '../services/authService';

vi.mock('../services/authService', () => ({
  login: vi.fn(),
}));

/**
 * Renders the Login page inside a router with a stub destination route,
 * so the post-login redirect can be observed.
 * @returns {void}
 */
function renderLoginPage() {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/household" element={<h1>Household Dashboard</h1>} />
          <Route path="/collector" element={<h1>Collector Dashboard</h1>} />
          <Route path="/complete-profile" element={<h1>Complete Profile</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('Login page', () => {
  beforeEach(() => {
    login.mockReset();
    localStorage.clear();
  });

  it('logs in and redirects to the role-specific dashboard when the profile is already complete', async () => {
    login.mockResolvedValue({
      token: 'fake-jwt',
      user: {
        id: 1, role: 'household', fullName: 'Farhan Rahman', email: 'farhan@example.com', profileCompleted: true,
      },
    });
    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'farhan@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Str0ng!Pass' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /household dashboard/i })).toBeInTheDocument();
    });
    expect(login).toHaveBeenCalledWith('farhan@example.com', 'Str0ng!Pass');
    expect(localStorage.getItem('sweep_token')).toBe('fake-jwt');
  });

  it('routes a global collector to the shared collector dashboard when the profile is already complete', async () => {
    login.mockResolvedValue({
      token: 'fake-jwt',
      user: {
        id: 2, role: 'global', fullName: 'Truck Driver', email: 'driver@example.com', profileCompleted: true,
      },
    });
    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'driver@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Str0ng!Pass' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /collector dashboard/i })).toBeInTheDocument();
    });
  });

  it('sends a user with an incomplete profile to the profile-completion flow instead of the dashboard', async () => {
    login.mockResolvedValue({
      token: 'fake-jwt',
      user: {
        id: 3, role: 'household', fullName: 'Farhan Rahman', email: 'farhan@example.com', profileCompleted: false,
      },
    });
    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'farhan@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Str0ng!Pass' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /complete profile/i })).toBeInTheDocument();
    });
  });

  it('shows the server error message when login fails', async () => {
    login.mockRejectedValue(new Error('Invalid email or password.'));
    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'farhan@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'WrongPass1!' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
    expect(localStorage.getItem('sweep_token')).toBeNull();
  });

  it('blocks submission when a field is empty', () => {
    renderLoginPage();

    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('links to the forgot-password flow', () => {
    renderLoginPage();

    expect(screen.getByRole('link', { name: /forgot password/i })).toHaveAttribute('href', '/forgot-password');
  });
});
