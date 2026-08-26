import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AUTH_PATHS = new Set(['/login', '/register']);

/**
 * Whether the route uses the household app shell (sidebar, no marketing footer).
 * @param {string} pathname Current location pathname.
 * @returns {boolean} True on household dashboard routes.
 */
function isHouseholdApp(pathname) {
  return pathname === '/household' || pathname.startsWith('/household/');
}

/**
 * Shared page chrome: homepage navbar, routed content, homepage footer.
 * Home keeps its own full-page layout; login and register omit the footer.
 * @returns {JSX.Element} The main layout shell.
 */
function MainLayout() {
  const { pathname } = useLocation();
  const showFooter = !AUTH_PATHS.has(pathname) && !isHouseholdApp(pathname);
  const householdApp = isHouseholdApp(pathname);

  return (
    <div className="flex min-h-screen flex-col bg-cream font-sans text-ink antialiased">
      <Navbar />
      <main
        id="main"
        className={householdApp
          ? 'w-full flex-1 pt-20'
          : 'mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-28 sm:px-6 lg:px-8'}
      >
        <Outlet />
      </main>
      {showFooter ? <Footer /> : null}
    </div>
  );
}

export default MainLayout;
