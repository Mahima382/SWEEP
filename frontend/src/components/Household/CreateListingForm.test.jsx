import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import CreateListingForm from './CreateListingForm';

describe('CreateListingForm', () => {
  it('shows validation when saved empty', () => {
    const onCreate = vi.fn();
    render(<CreateListingForm onCreate={onCreate} />);

    fireEvent.click(screen.getByRole('button', { name: /Save listing/i }));

    expect(screen.getByText(/Choose a waste category/i)).toBeInTheDocument();
    expect(screen.getByText(/weight greater than 0/i)).toBeInTheDocument();
    expect(screen.getByText(/suggested price of 0 BDT or more/i)).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('lets the household pick a category chip', () => {
    render(<CreateListingForm onCreate={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Plastic' }));
    expect(screen.getByRole('button', { name: 'Plastic' })).toHaveAttribute('aria-pressed', 'true');
  });
});
