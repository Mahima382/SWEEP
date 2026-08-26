import React from 'react';

/**
 * Household wallet placeholder (FR-04).
 * @returns {JSX.Element} Wallet stub page.
 */
function HouseholdWallet() {
  return (
    <section>
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-leaf">
        Household
      </p>
      <h1 className="mt-2 font-display text-[1.85rem] leading-tight text-ink sm:text-4xl">
        Wallet
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/65">
        Earnings, pending balance, and withdrawals will appear here.
      </p>
    </section>
  );
}

export default HouseholdWallet;
