import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CompleteProfile from './CompleteProfile';
import { AuthProvider } from '../context/AuthContext';
import { completeProfile } from '../services/userService';

vi.mock('../services/userService', () => ({
  completeProfile: vi.fn(),
}));

/**
 * Renders the CompleteProfile page inside a router with stub destination
 * routes, with the given user pre-seeded into localStorage the way
 * AuthContext reads it back on mount.
 * @param {object|null} user The logged-in user, or null for a guest.
 * @returns {void}
 */
function renderCompleteProfilePage(user) {
  if (user) {
    localStorage.setItem('sweep_user', JSON.stringify(user));
    localStorage.setItem('sweep_token', 'fake-jwt');
  }
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/complete-profile']}>
        <Routes>
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/login" element={<h1>Login</h1>} />
          <Route path="/household" element={<h1>Household Dashboard</h1>} />
          <Route path="/collector" element={<h1>Collector Dashboard</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

const householdUser = {
  id: 1, role: 'household', fullName: 'Farhan Rahman', email: 'farhan@example.com', profileCompleted: false,
};

describe('CompleteProfile page', () => {
  beforeEach(() => {
    completeProfile.mockReset();
    localStorage.clear();
  });

  it('redirects a guest (no logged-in user) to login', () => {
    renderCompleteProfilePage(null);
    expect(screen.getByRole('heading', { name: /^login$/i })).toBeInTheDocument();
  });

  it('redirects straight to the dashboard when the profile is already complete', () => {
    renderCompleteProfilePage({ ...householdUser, profileCompleted: true });
    expect(screen.getByRole('heading', { name: /household dashboard/i })).toBeInTheDocument();
  });

  it('blocks advancing past step one when required household fields are missing', () => {
    renderCompleteProfilePage(householdUser);

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    expect(screen.getByText(/nid number is required/i)).toBeInTheDocument();
    expect(screen.getByText(/step 1 of 2/i)).toBeInTheDocument();
  });

  it('walks through the household wizard, saves the profile, and reaches the dashboard', async () => {
    completeProfile.mockResolvedValue({
      user: { ...householdUser, profileCompleted: true },
    });
    renderCompleteProfilePage(householdUser);

    fireEvent.change(screen.getByLabelText(/nid number/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/division/i), { target: { value: 'Dhaka' } });
    fireEvent.change(screen.getByLabelText(/^district/i), { target: { value: 'Dhaka' } });
    fireEvent.change(screen.getByLabelText(/city \/ municipality/i), { target: { value: 'Dhaka City Corporation' } });
    fireEvent.change(screen.getByLabelText(/^area/i), { target: { value: 'Mirpur-10' } });
    fireEvent.change(screen.getByLabelText(/detailed address/i), { target: { value: 'House 12, Road 3' } });

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    await waitFor(() => {
      expect(screen.getByText(/step 2 of 2/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /profile complete/i })).toBeInTheDocument();
    });
    expect(completeProfile).toHaveBeenCalledWith(expect.objectContaining({
      nid: '1234567890',
      address: expect.objectContaining({
        division: 'Dhaka', district: 'Dhaka', city: 'Dhaka City Corporation', area: 'Mirpur-10', detailedAddress: 'House 12, Road 3',
      }),
    }));

    fireEvent.click(screen.getByRole('button', { name: /go to dashboard/i }));
    expect(screen.getByRole('heading', { name: /household dashboard/i })).toBeInTheDocument();
  });

  it('shows the server error message when saving the profile fails', async () => {
    completeProfile.mockRejectedValue(new Error('Please correct the highlighted fields.'));
    renderCompleteProfilePage(householdUser);

    fireEvent.change(screen.getByLabelText(/nid number/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/division/i), { target: { value: 'Dhaka' } });
    fireEvent.change(screen.getByLabelText(/^district/i), { target: { value: 'Dhaka' } });
    fireEvent.change(screen.getByLabelText(/city \/ municipality/i), { target: { value: 'Dhaka City Corporation' } });
    fireEvent.change(screen.getByLabelText(/^area/i), { target: { value: 'Mirpur-10' } });
    fireEvent.change(screen.getByLabelText(/detailed address/i), { target: { value: 'House 12, Road 3' } });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => screen.getByText(/step 2 of 2/i));
    fireEvent.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => {
      expect(screen.getByText(/please correct the highlighted fields/i)).toBeInTheDocument();
    });
  });

  it('shows a KYC-pending confirmation for a local collector instead of the household message', async () => {
    completeProfile.mockResolvedValue({
      user: {
        id: 2, role: 'collector', fullName: 'Rahim Uddin', email: 'rahim@example.com', profileCompleted: true,
      },
    });
    renderCompleteProfilePage({
      id: 2, role: 'collector', fullName: 'Rahim Uddin', email: 'rahim@example.com', profileCompleted: false,
    });

    expect(screen.getByText(/complete your local collector profile/i)).toBeInTheDocument();
  });
});
