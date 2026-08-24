import React from 'react';
import { Link } from 'react-router-dom';

/**
 * 404 page for unmatched routes.
 * @returns {JSX.Element} The not-found page.
 */
function NotFound() {
  return (
    <section>
      <h1>404 — Page Not Found</h1>
      <p>
        The page you are looking for does not exist.
        {' '}
        <Link to="/">Back to home</Link>
      </p>
    </section>
  );
}

export default NotFound;
