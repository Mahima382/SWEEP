import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';

describe('SWEEP app shell', () => {
  it('renders the home page with the SWEEP brand', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/']}>
          <AppRoutes />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(
      screen.getByRole('heading', { name: /SWEEP — Smart Waste Exchange & Eco Platform/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('SWEEP')).toBeInTheDocument();
  });
});
