import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
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
      screen.getByRole('heading', { name: /Waste has value/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('SWEEP').length).toBeGreaterThan(0);
  });

  it('uses the homepage navbar on login and register', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <AppRoutes />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByRole('navigation', { name: /Primary/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Sign in/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Join SWEEP/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();

    cleanup();

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/register']}>
          <AppRoutes />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByRole('navigation', { name: /Primary/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Register/i })).toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });
});
