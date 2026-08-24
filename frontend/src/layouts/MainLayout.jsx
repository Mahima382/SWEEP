import React from 'react';
import { Link, Outlet } from 'react-router-dom';

/**
 * Shared page chrome: header with the SWEEP brand, routed content, footer.
 * All routes in AppRoutes.jsx render inside the <Outlet />.
 * @returns {JSX.Element} The main layout shell.
 */
function MainLayout() {
  return (
    <div className="layout">
      <header className="layout-header">
        <Link to="/" className="brand">SWEEP</Link>
        <nav className="layout-nav">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
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
