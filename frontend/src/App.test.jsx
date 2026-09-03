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
      screen.getByRole('heading', { name: /turning waste into value/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('SWEEP')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /log in to sweep/i })).toBeInTheDocument();
  });
});
