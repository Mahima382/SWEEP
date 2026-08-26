import React from 'react';
import {
  render, screen, waitFor, fireEvent,
} from '@testing-library/react';
import {
  getPlans, getMySubscription, subscribe,
} from '../../services/subscriptionService';
import SubscriptionPlans from './SubscriptionPlans';

vi.mock('../../services/subscriptionService', () => ({
  getPlans: vi.fn(),
  getMySubscription: vi.fn(),
  subscribe: vi.fn(),
  renewSubscription: vi.fn(),
}));

const basicPlan = {
  id: 1, name: 'Basic', tier: 'basic', priceMonthly: 1000, priceAnnual: 10000,
};
const proPlan = {
  id: 2, name: 'Pro', tier: 'pro', priceMonthly: 3000, priceAnnual: 30000,
};

beforeEach(() => {
  getPlans.mockReset().mockResolvedValue({ plans: [basicPlan, proPlan] });
  getMySubscription.mockReset().mockResolvedValue({ subscription: null });
  subscribe.mockReset().mockResolvedValue({ message: 'Subscription active' });
});

describe('SubscriptionPlans', () => {
  it('shows a loading state, then the plan cards once data arrives', async () => {
    render(<SubscriptionPlans />);

    expect(screen.getByText(/Loading subscription plans/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Basic')).toBeInTheDocument();
    });
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('shows the current plan as unavailable to re-subscribe to', async () => {
    getMySubscription.mockResolvedValue({
      subscription: {
        id: 5, planId: 1, status: 'active', currentPeriodEnd: new Date(Date.now() + 86400000).toISOString(),
      },
    });

    render(<SubscriptionPlans />);

    await waitFor(() => {
      expect(screen.getByText('Basic')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Current plan')).toHaveLength(1);
    expect(screen.getByText('Switch to this plan')).toBeInTheDocument();
  });

  it('shows a grace-period warning when the subscription is in grace', async () => {
    getMySubscription.mockResolvedValue({
      subscription: {
        id: 5,
        planId: 1,
        status: 'grace',
        currentPeriodEnd: new Date(Date.now() - 86400000).toISOString(),
        gracePeriodEndsAt: new Date(Date.now() + 86400000).toISOString(),
      },
    });

    render(<SubscriptionPlans />);

    await waitFor(() => {
      expect(screen.getByText('Grace period')).toBeInTheDocument();
    });
    expect(screen.getByText(/keep marketplace access/i)).toBeInTheDocument();
  });

  it('subscribes to a plan when its button is clicked', async () => {
    render(<SubscriptionPlans />);

    await waitFor(() => {
      expect(screen.getByText('Basic')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole('button', { name: 'Subscribe' })[0]);

    await waitFor(() => {
      expect(subscribe).toHaveBeenCalledWith({ planId: 1, billingCycle: 'monthly' });
    });
    await waitFor(() => {
      expect(screen.getByText('Subscription active')).toBeInTheDocument();
    });
  });

  it('shows an error message when loading plans fails', async () => {
    getPlans.mockRejectedValue(new Error('Network down'));

    render(<SubscriptionPlans />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Network down');
    });
  });
});
