import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HouseholdLayout from './HouseholdLayout';
import HouseholdOverview from './HouseholdOverview';
import HouseholdWallet from './HouseholdWallet';
import WasteListings from './WasteListings';

/**
 * Household area: dashboard shell with nested overview, listings, and wallet.
 * @returns {JSX.Element} Household routes inside the sidebar layout.
 */
function HouseholdDashboard() {
  return (
    <HouseholdLayout>
      <Routes>
        <Route index element={<HouseholdOverview />} />
        <Route path="listings" element={<WasteListings />} />
        <Route path="wallet" element={<HouseholdWallet />} />
      </Routes>
    </HouseholdLayout>
  );
}

export default HouseholdDashboard;
