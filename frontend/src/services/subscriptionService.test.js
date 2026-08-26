import * as api from './api';
import {
  getPlans, getMySubscription, subscribe, renewSubscription,
} from './subscriptionService';

vi.mock('./api', () => ({
  get: vi.fn().mockResolvedValue({}),
  post: vi.fn().mockResolvedValue({}),
}));

beforeEach(() => {
  window.localStorage.clear();
  api.get.mockClear();
  api.post.mockClear();
});

describe('subscriptionService', () => {
  it('getPlans calls GET /subscriptions/plans', async () => {
    await getPlans();
    expect(api.get).toHaveBeenCalledWith('/subscriptions/plans', {});
  });

  it('attaches an Authorization header when a token is stored', async () => {
    window.localStorage.setItem('sweep_token', 'abc123');

    await getMySubscription();

    expect(api.get).toHaveBeenCalledWith('/subscriptions/me', {
      headers: { Authorization: 'Bearer abc123' },
    });
  });

  it('subscribe posts the plan/billing payload', async () => {
    await subscribe({ planId: 2, billingCycle: 'monthly' });
    expect(api.post).toHaveBeenCalledWith(
      '/subscriptions/subscribe',
      { planId: 2, billingCycle: 'monthly' },
      {},
    );
  });

  it('renewSubscription posts to /subscriptions/renew', async () => {
    await renewSubscription({ paymentMethod: 'bkash' });
    expect(api.post).toHaveBeenCalledWith(
      '/subscriptions/renew',
      { paymentMethod: 'bkash' },
      {},
    );
  });
});
