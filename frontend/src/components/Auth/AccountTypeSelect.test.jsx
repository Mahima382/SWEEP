import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AccountTypeSelect from './AccountTypeSelect';

describe('AccountTypeSelect', () => {
  it('renders all four self-registrable account types', () => {
    render(<AccountTypeSelect onSelect={vi.fn()} onBack={vi.fn()} />);

    expect(screen.getByRole('button', { name: /register as household/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register as local collector/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register as global collector/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register as company/i })).toBeInTheDocument();
  });

  it('does not offer admin as a self-registrable account type', () => {
    render(<AccountTypeSelect onSelect={vi.fn()} onBack={vi.fn()} />);

    expect(screen.getByText(/admin accounts are platform-managed/i)).toBeInTheDocument();
  });

  it('calls onSelect with the chosen account type id', () => {
    const onSelect = vi.fn();
    render(<AccountTypeSelect onSelect={onSelect} onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /register as global collector/i }));

    expect(onSelect).toHaveBeenCalledWith('global');
  });

  it('calls onBack when "Sign in" is clicked', () => {
    const onBack = vi.fn();
    render(<AccountTypeSelect onSelect={vi.fn()} onBack={onBack} />);

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
