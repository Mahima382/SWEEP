import React from 'react';
import { Link, Outlet } from 'react-router-dom';

/**
 * Shared page chrome: header with the SWEEP brand, routed content, footer.
 * Used by every route except the landing page (Home), which controls its
 * own full-bleed hero instead — see AppRoutes.jsx. No nav links here: with
 * login now reachable straight from the landing page, a persistent
 * Login/Register nav was redundant on every other page too.
 * @returns {JSX.Element} The main layout shell.
 */
function MainLayout() {
  return (
    <div className="layout">
      <header className="layout-header">
        <Link to="/" className="brand">SWEEP</Link>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
      <footer className="layout-footer">
        <p>SWEEP — Smart Waste Exchange &amp; Eco Platform · CSE-404, Jahangirnagar University</p>
      </footer>
    </div>
  );
}

export default MainLayout;
