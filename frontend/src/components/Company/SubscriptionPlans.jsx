import React, { useCallback, useEffect, useState } from 'react';
import {
  getPlans, getMySubscription, subscribe as subscribeToPlan,
} from '../../services/subscriptionService';
import './SubscriptionPlans.css';

const STATUS_LABELS = {
  active: 'Active',
  grace: 'Grace period',
  expired: 'Expired',
  cancelled: 'Cancelled',
  none: 'No subscription yet',
};

/**
 * Formats a plan's price for a given billing cycle as BDT.
 * @param {object} plan Plan row with priceMonthly/priceAnnual.
 * @param {string} billingCycle 'monthly' or 'annual'.
 * @returns {string} A formatted price string, e.g. "৳1,000".
 */
function formatPrice(plan, billingCycle) {
  const amount = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
  return `৳${Number(amount).toLocaleString('en-BD')}`;
}

/**
 * Subscription management for a recycling company (FR-07): shows the
 * company's current plan/status and lets it subscribe, switch plans, or
 * renew. Marketplace access (FR-08 newsfeed) is gated on this state.
 * @returns {JSX.Element} The subscription management panel.
 */
function SubscriptionPlans() {
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [pendingPlanId, setPendingPlanId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [plansRes, subscriptionRes] = await Promise.all([
        getPlans(),
        getMySubscription(),
      ]);
      setPlans(plansRes.plans || []);
      setSubscription(subscriptionRes.subscription || null);
    } catch (err) {
      setError(err.message || 'Could not load subscription plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Subscribes to (or schedules a switch to) the given plan.
   * @param {number} planId The chosen plan's id.
   * @returns {Promise<void>} Resolves once the action completes.
   */
  async function handleSubscribe(planId) {
    setPendingPlanId(planId);
    setActionMessage(null);
    setError(null);
    try {
      const res = await subscribeToPlan({ planId, billingCycle });
      setActionMessage(res.message);
      await loadData();
    } catch (err) {
      setError(err.message || 'Could not update your subscription');
    } finally {
      setPendingPlanId(null);
    }
  }

  const status = subscription ? subscription.status : 'none';
  const currentPlanId = subscription ? subscription.planId : null;

  return (
    <section className="subscription-plans">
      <h2>Subscription</h2>

      {subscription && (
        <div className={`subscription-status subscription-status--${status}`}>
          <span className="subscription-status__label">{STATUS_LABELS[status] || status}</span>
          {status === 'grace' && subscription.gracePeriodEndsAt && (
            <span className="subscription-status__detail">
              Renew before
              {' '}
              {new Date(subscription.gracePeriodEndsAt).toLocaleDateString()}
              {' '}
              to keep marketplace access.
            </span>
          )}
          {status === 'expired' && (
            <span className="subscription-status__detail">
              Renew a plan below to regain marketplace access.
            </span>
          )}
        </div>
      )}

      {actionMessage && <p className="subscription-plans__message">{actionMessage}</p>}
      {error && <p className="subscription-plans__error" role="alert">{error}</p>}

      {loading ? (
        <p>Loading subscription plans…</p>
      ) : (
        <>
          <div className="subscription-plans__cycle" role="radiogroup" aria-label="Billing cycle">
            <label htmlFor="billing-cycle-monthly">
              <input
                id="billing-cycle-monthly"
                type="radio"
                name="billingCycle"
                value="monthly"
                checked={billingCycle === 'monthly'}
                onChange={() => setBillingCycle('monthly')}
              />
              Monthly
            </label>
            <label htmlFor="billing-cycle-annual">
              <input
                id="billing-cycle-annual"
                type="radio"
                name="billingCycle"
                value="annual"
                checked={billingCycle === 'annual'}
                onChange={() => setBillingCycle('annual')}
              />
              Annual
            </label>
          </div>

          {plans.length === 0 ? (
            <p>No subscription plans are available right now.</p>
          ) : (
            <div className="subscription-plans__grid">
              {plans.map((plan) => {
                const isCurrent = plan.id === currentPlanId && (status === 'active' || status === 'grace');
                return (
                  <article key={plan.id} className="plan-card">
                    <h3>{plan.name}</h3>
                    <p className="plan-card__price">
                      {formatPrice(plan, billingCycle)}
                      <span className="plan-card__cycle">
                        {billingCycle === 'annual' ? ' / year' : ' / month'}
                      </span>
                    </p>
                    <button
                      type="button"
                      disabled={isCurrent || pendingPlanId === plan.id}
                      onClick={() => handleSubscribe(plan.id)}
                    >
                      {isCurrent && 'Current plan'}
                      {!isCurrent && pendingPlanId === plan.id && 'Processing…'}
                      {!isCurrent && pendingPlanId !== plan.id && (currentPlanId ? 'Switch to this plan' : 'Subscribe')}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default SubscriptionPlans;
