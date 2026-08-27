import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Register from './Register';

/**
 * Renders the Register page inside a router with a stub /login route,
 * so navigation triggered by the flow can be observed.
 * @returns {void}
 */
function renderRegisterPage() {
  render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<h1>Login</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

/**
 * Fills in the minimal account-creation form fields.
 * @param {object} values Field values keyed by their accessible label text.
 * @returns {void}
 */
function fillForm(values) {
  fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: values.fullName } });
  fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: values.email } });
  fireEvent.change(screen.getByLabelText(/mobile number/i), { target: { value: values.mobile } });
  fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: values.password } });
  fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: values.confirmPassword } });
}

describe('Register page', () => {
  it('walks through account type selection, the minimal form, and completion', () => {
    renderRegisterPage();

    fireEvent.click(screen.getByRole('button', { name: /register as household/i }));
    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();

    fillForm({
      fullName: 'Farhan Rahman',
      email: 'farhan@example.com',
      mobile: '01712345678',
      password: 'Str0ng!Pass',
      confirmPassword: 'Str0ng!Pass',
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(screen.getByRole('heading', { name: /account created/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /go to login/i }));
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  });

  it('blocks submission when the password is too weak or does not match', () => {
    renderRegisterPage();

    fireEvent.click(screen.getByRole('button', { name: /register as household/i }));

    fillForm({
      fullName: 'Farhan Rahman',
      email: 'farhan@example.com',
      mobile: '01712345678',
      password: 'weak',
      confirmPassword: 'different',
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(screen.getByText(/min 8 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /account created/i })).not.toBeInTheDocument();
  });

  it('labels the name field "Company Name" for the company account type', () => {
    renderRegisterPage();

    fireEvent.click(screen.getByRole('button', { name: /register as company/i }));

    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^full name/i)).not.toBeInTheDocument();
  });
});
