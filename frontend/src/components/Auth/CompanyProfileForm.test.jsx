import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CompanyProfileForm from './CompanyProfileForm';

/**
 * Selects a file for an UploadBox by firing a change event on its hidden
 * file input. Looked up by id rather than accessible label text, since an
 * UploadBox's label wraps both its title and a hint sentence — its
 * accessible name is their concatenation, not just the title — using the
 * same `upload-<slug>` id UploadBox itself derives from the label prop.
 * @param {string} boxLabel The UploadBox's `label` prop, e.g. 'Trade Licence'.
 * @param {string} fileName Name to report back via onChange.
 * @returns {void}
 */
function chooseFile(boxLabel, fileName) {
  const id = `upload-${boxLabel.replace(/\s+/g, '-').toLowerCase()}`;
  const input = document.getElementById(id);
  const file = new File(['content'], fileName, { type: 'application/pdf' });
  fireEvent.change(input, { target: { files: [file] } });
}

/**
 * Fills and submits step 0 (Company Info) so every test can start from step 1.
 * @returns {void}
 */
function completeCompanyInfoStep() {
  fireEvent.change(screen.getByLabelText(/registration number/i), { target: { value: 'C-1' } });
  fireEvent.change(screen.getByLabelText(/office address/i), { target: { value: 'Dhaka' } });
  fireEvent.click(screen.getByRole('button', { name: /continue/i }));
}

describe('CompanyProfileForm', () => {
  it('advances from Waste Categories to KYC Documents after picking a non-E-waste category', () => {
    render(<CompanyProfileForm onComplete={vi.fn()} />);
    completeCompanyInfoStep();
    expect(screen.getByText(/step 2 of 4/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Plastic' }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    expect(screen.getByText(/step 3 of 4/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /kyc documents/i })).toBeInTheDocument();
  });

  it('blocks advancing out of Waste Categories until an E-waste licence and document are provided', () => {
    render(<CompanyProfileForm onComplete={vi.fn()} />);
    completeCompanyInfoStep();

    fireEvent.click(screen.getByRole('button', { name: 'E-waste' }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    expect(screen.getByText(/step 2 of 4/i)).toBeInTheDocument();
    expect(screen.getByText(/e-waste handling licence number is required/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/e-waste handling licence number/i), { target: { value: 'EW-1' } });
    chooseFile('E-Waste Licence Document', 'ewaste.pdf');
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    expect(screen.getByText(/step 3 of 4/i)).toBeInTheDocument();
  });

  it('walks all the way to Authorized Person and calls onComplete', () => {
    const onComplete = vi.fn();
    render(<CompanyProfileForm onComplete={onComplete} />);
    completeCompanyInfoStep();

    fireEvent.click(screen.getByRole('button', { name: 'Plastic' }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    chooseFile('Trade Licence', 'trade.pdf');
    chooseFile('Company Registration', 'reg.pdf');
    chooseFile('TIN / Tax Certificate', 'tin.pdf');
    chooseFile('VAT Certificate', 'vat.pdf');
    chooseFile('Director NID', 'nid.pdf');
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText(/step 4 of 4/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/authorized person name/i), { target: { value: 'Rahim Uddin' } });
    fireEvent.change(screen.getByLabelText(/role \/ designation/i), { target: { value: 'Managing Director' } });
    fireEvent.change(screen.getByLabelText(/^phone/i), { target: { value: '01712345678' } });
    fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: 'rahim@example.com' } });
    fireEvent.change(screen.getByLabelText(/nid number/i), { target: { value: '999' } });
    fireEvent.click(screen.getByRole('button', { name: /submit kyc/i }));

    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({
      registrationNumber: 'C-1',
      officeAddress: 'Dhaka',
      supportedCategories: ['Plastic'],
    }));
  });
});
