import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GlobalCollectorProfileForm from './GlobalCollectorProfileForm';

/**
 * Selects a file for an UploadBox by firing a change event on its hidden
 * file input. Looked up by id rather than accessible label text, since an
 * UploadBox's label wraps both its title and a hint sentence — its
 * accessible name is their concatenation, not just the title — using the
 * same `upload-<slug>` id UploadBox itself derives from the label prop.
 * @param {string} boxLabel The UploadBox's `label` prop, e.g. 'NID Front'.
 * @param {string} fileName Name to report back via onChange.
 * @returns {void}
 */
function chooseFile(boxLabel, fileName) {
  const id = `upload-${boxLabel.replace(/\s+/g, '-').toLowerCase()}`;
  const input = document.getElementById(id);
  const file = new File(['content'], fileName, { type: 'image/png' });
  fireEvent.change(input, { target: { files: [file] } });
}

describe('GlobalCollectorProfileForm', () => {
  it('advances from NID & Documents to Licence & Vehicle once NID and its three documents are provided', () => {
    render(<GlobalCollectorProfileForm onComplete={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/nid number/i), { target: { value: '1234567890' } });
    chooseFile('NID Front', 'front.jpg');
    chooseFile('NID Back', 'back.jpg');
    chooseFile('Profile Photo', 'photo.jpg');
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    expect(screen.getByText(/step 2 of 3/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /licence & vehicle/i })).toBeInTheDocument();
  });

  it('blocks advancing past NID & Documents when a document is missing', () => {
    render(<GlobalCollectorProfileForm onComplete={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/nid number/i), { target: { value: '1234567890' } });
    chooseFile('NID Front', 'front.jpg');
    chooseFile('NID Back', 'back.jpg');
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    expect(screen.getByText(/profile photo is required/i)).toBeInTheDocument();
    expect(screen.getByText(/step 1 of 3/i)).toBeInTheDocument();
  });

  it('walks all the way through and calls onComplete', () => {
    const onComplete = vi.fn();
    render(<GlobalCollectorProfileForm onComplete={onComplete} />);

    fireEvent.change(screen.getByLabelText(/nid number/i), { target: { value: '1234567890' } });
    chooseFile('NID Front', 'front.jpg');
    chooseFile('NID Back', 'back.jpg');
    chooseFile('Profile Photo', 'photo.jpg');
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    fireEvent.change(screen.getByLabelText(/driving licence number/i), { target: { value: 'DL-1' } });
    fireEvent.change(screen.getByLabelText(/vehicle registration number/i), { target: { value: 'Dhaka Metro Ga-1234' } });
    fireEvent.change(screen.getByLabelText(/vehicle capacity/i), { target: { value: '5 tons' } });
    chooseFile('Driving Licence', 'dl.jpg');
    chooseFile('Vehicle Registration', 'reg.jpg');
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    expect(screen.getByText(/step 3 of 3/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /submit kyc/i }));

    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({
      nid: '1234567890',
      drivingLicenceNumber: 'DL-1',
      vehicleRegistrationNumber: 'Dhaka Metro Ga-1234',
      vehicleCapacity: '5 tons',
    }));
  });
});
