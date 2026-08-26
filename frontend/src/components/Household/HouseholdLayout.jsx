import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Recycle, Wallet } from 'lucide-react';

const NAV_ITEMS = [
  {
    to: '/household',
    label: 'Overview',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/household/listings',
    label: 'Waste listing',
    icon: Recycle,
    end: false,
  },
  {
    to: '/household/wallet',
    label: 'Wallet',
    icon: Wallet,
    end: false,
  },
];

/**
 * Class names for a sidebar / mobile nav item.
 * @param {boolean} active Whether the link matches the current route.
 * @returns {string} Tailwind class list.
 */
function navClass(active) {
  if (active) {
    return 'bg-lime text-ink shadow-sm';
  }
  return 'text-forest/80 hover:bg-sand hover:text-forest';
}

/**
 * Household app chrome: sidebar on desktop, compact nav on small screens.
 * @param {object} props Component props.
 * @param {React.ReactNode} props.children Routed household page.
 * @returns {JSX.Element} Dashboard shell.
 */
function HouseholdLayout({ children }) {
  return (
    <div className="flex min-h-[calc(100vh-5rem)]">
      <aside className="hidden w-60 shrink-0 border-r border-mist bg-white md:block">
        <div className="sticky top-20 px-4 py-6">
          <p className="px-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-leaf">
            Household
          </p>
          <nav className="mt-4 flex flex-col gap-1" aria-label="Household">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => {
                    const base = 'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition';
                    return `${base} ${navClass(isActive)}`;
                  }}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <nav
          className="flex gap-1 overflow-x-auto border-b border-mist bg-white px-3 py-2 md:hidden"
          aria-label="Household"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => {
                  const base = 'flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium';
                  return `${base} ${navClass(isActive)}`;
                }}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}

HouseholdLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default HouseholdLayout;
