import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import CollectorDashboard from './CollectorDashboard';

describe('CollectorDashboard (FR-06)', () => {
  it('displays waste currently held, broken down by category and total weight', () => {
    const mockHeldWaste = [
      { id: 1, category: 'Plastic', weight: 25 },
      { id: 2, category: 'Paper', weight: 15 },
    ];

    render(<CollectorDashboard heldWaste={mockHeldWaste} />);

    expect(screen.getByText(/Plastic/i)).toBeInTheDocument();
    expect(screen.getByText(/25\s*kg/i)).toBeInTheDocument();
    expect(screen.getByText(/Paper/i)).toBeInTheDocument();
    expect(screen.getByText(/15\s*kg/i)).toBeInTheDocument();
    expect(screen.getByText(/Total held waste:\s*40\s*kg/i)).toBeInTheDocument();
  });

  it('displays held waste lot details including category, weight, date collected, and status', () => {
    const mockLots = [
      {
        id: 1,
        category: 'Plastic',
        weight: 25,
        dateCollected: '2026-09-01',
        status: 'Held',
      },
    ];

    render(<CollectorDashboard heldWaste={mockLots} />);

    expect(screen.getByText(/Plastic/i)).toBeInTheDocument();
    expect(screen.getAllByText(/25\s*kg/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/2026-09-01/i)).toBeInTheDocument();
    expect(screen.getByText(/^Held$/i)).toBeInTheDocument();
  });

  it('displays collector earnings including total revenue, platform commission, and net payout', () => {
    const mockEarnings = {
      totalRevenue: 1000,
      platformCommission: 100,
      netPayout: 900,
    };

    render(<CollectorDashboard earnings={mockEarnings} />);

    expect(screen.getByText(/1000\s*BDT/i)).toBeInTheDocument();
    expect(screen.getByText(/100\s*BDT/i)).toBeInTheDocument();
    expect(screen.getByText(/900\s*BDT/i)).toBeInTheDocument();
  });

  describe('Earnings Filtering', () => {
    const mockEarnings = {
      totalRevenue: 1500,
      platformCommission: 150,
      netPayout: 1350,
      periodEarnings: {
        day: 1000,
        week: 1500,
        month: 3000,
      },
      records: [
        { id: 1, category: 'Plastic', amount: 1000, period: 'day' },
        { id: 2, category: 'Paper', amount: 500, period: 'week' },
        { id: 3, category: 'Plastic', amount: 1500, period: 'month' },
      ],
    };

    it('shows the correct daily earnings when day filter is selected', () => {
      render(
        <CollectorDashboard
          earnings={mockEarnings}
          earningsRecords={mockEarnings.records}
        />,
      );

      const periodFilter = screen.getByLabelText(/period/i);
      fireEvent.change(periodFilter, { target: { value: 'day' } });
      expect(screen.getByText(/1000\s*BDT/i)).toBeInTheDocument();
    });

    it('shows the correct weekly earnings when week filter is selected', () => {
      render(
        <CollectorDashboard
          earnings={mockEarnings}
          earningsRecords={mockEarnings.records}
        />,
      );

      const periodFilter = screen.getByLabelText(/period/i);
      fireEvent.change(periodFilter, { target: { value: 'week' } });
      expect(screen.getByText(/1500\s*BDT/i)).toBeInTheDocument();
    });

    it('shows the correct monthly earnings when month filter is selected', () => {
      render(
        <CollectorDashboard
          earnings={mockEarnings}
          earningsRecords={mockEarnings.records}
        />,
      );

      const periodFilter = screen.getByLabelText(/period/i);
      fireEvent.change(periodFilter, { target: { value: 'month' } });
      expect(screen.getByText(/3000\s*BDT/i)).toBeInTheDocument();
    });

    it('filters earnings by waste category showing Plastic separately from Paper', () => {
      render(
        <CollectorDashboard
          earnings={mockEarnings}
          earningsRecords={mockEarnings.records}
        />,
      );

      const categoryFilter = screen.getByLabelText(/category/i);

      fireEvent.change(categoryFilter, { target: { value: 'Plastic' } });
      expect(screen.getByText(/1000\s*BDT/i)).toBeInTheDocument();
      expect(screen.queryByText(/500\s*BDT/i)).not.toBeInTheDocument();

      fireEvent.change(categoryFilter, { target: { value: 'Paper' } });
      expect(screen.getByText(/500\s*BDT/i)).toBeInTheDocument();
      expect(screen.queryByText(/1000\s*BDT/i)).not.toBeInTheDocument();
    });
  });

  describe('Payment Status', () => {
    it('displays a pending payment as Pending', () => {
      render(<CollectorDashboard payments={{ pending: 500, available: 0 }} />);

      expect(screen.getByText(/Pending payment/i)).toBeInTheDocument();
      expect(screen.getByText(/500\s*BDT/i)).toBeInTheDocument();
    });

    it('displays an available payment as Available', () => {
      render(<CollectorDashboard payments={{ pending: 0, available: 1200 }} />);

      expect(screen.getByText(/Available payment/i)).toBeInTheDocument();
      expect(screen.getByText(/1200\s*BDT/i)).toBeInTheDocument();
    });

    it('displays an Available payment for a Handed Over lot', () => {
      const mockLots = [
        {
          id: 1,
          category: 'Plastic',
          weight: 25,
          status: 'Handed Over',
          handoverConfirmed: true,
          paymentStatus: 'Available',
        },
      ];

      render(<CollectorDashboard heldWaste={mockLots} />);

      expect(screen.getByText(/Handed Over/i)).toBeInTheDocument();
      expect(screen.getByText(/Payment.*Available/i)).toBeInTheDocument();
    });

    it('displays a Pending payment for a lot where handover is not confirmed', () => {
      const mockLots = [
        {
          id: 2,
          category: 'Paper',
          weight: 15,
          status: 'Ready for Global Collector',
          handoverConfirmed: false,
          paymentStatus: 'Pending',
        },
      ];

      render(<CollectorDashboard heldWaste={mockLots} />);

      expect(screen.getByText(/Ready for Global Collector/i)).toBeInTheDocument();
      expect(screen.getByText(/Payment.*Pending/i)).toBeInTheDocument();
    });
  });

  describe('Withdrawal', () => {
    it('allows a collector to initiate a withdrawal using an allowed destination', () => {
      const handleWithdraw = vi.fn();
      render(
        <CollectorDashboard
          availableBalance={1000}
          payments={{ available: 1000 }}
          onWithdraw={handleWithdraw}
        />,
      );

      fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '500' } });
      fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'bKash' } });
      fireEvent.click(screen.getByRole('button', { name: /withdraw/i }));

      expect(handleWithdraw).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 500, destination: 'bKash' }),
      );
    });

    it('provides bKash as an available withdrawal destination', () => {
      render(<CollectorDashboard availableBalance={1000} payments={{ available: 1000 }} />);
      expect(screen.getByRole('option', { name: /bKash/i })).toBeInTheDocument();
    });

    it('provides Nagad as an available withdrawal destination', () => {
      render(<CollectorDashboard availableBalance={1000} payments={{ available: 1000 }} />);
      expect(screen.getByRole('option', { name: /Nagad/i })).toBeInTheDocument();
    });

    it('provides Bank account as an available withdrawal destination', () => {
      render(<CollectorDashboard availableBalance={1000} payments={{ available: 1000 }} />);
      expect(screen.getByRole('option', { name: /bank account/i })).toBeInTheDocument();
    });

    it('blocks withdrawal and displays guidance when requested amount exceeds available balance', () => {
      const handleWithdraw = vi.fn();
      render(
        <CollectorDashboard
          availableBalance={500}
          payments={{ available: 500 }}
          onWithdraw={handleWithdraw}
        />,
      );

      fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '1000' } });
      fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'bKash' } });
      fireEvent.click(screen.getByRole('button', { name: /withdraw/i }));

      expect(handleWithdraw).not.toHaveBeenCalled();
      expect(screen.getByText(/insufficient (available )?balance/i)).toBeInTheDocument();
    });
  });
});


