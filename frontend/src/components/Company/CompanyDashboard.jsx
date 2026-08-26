import React from 'react';
import SubscriptionPlans from './SubscriptionPlans';

/**
 * Recycling company dashboard (FR-07, FR-08).
 * Owner: Company team member — subscription management (FR-07) is wired
 * up below; region-filtered lot newsfeed and procurement tracking (FR-08)
 * still need to be added.
 * @returns {JSX.Element} The company dashboard.
 */
function CompanyDashboard() {
  return (
    <section>
      <h1>Company Dashboard</h1>
      <SubscriptionPlans />
      <p>Lot newsfeed, orders, and procurement analytics will appear here.</p>
    </section>
  );
}

export default CompanyDashboard;
