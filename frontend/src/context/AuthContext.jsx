import React, { createContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Authentication context: holds the logged-in user for the whole app.
 * Consume it via the useAuth() hook in src/hooks/useAuth.js.
 * @type {React.Context<{user: (object|null), setUser: Function, logout: Function}>}
 */
export const AuthContext = createContext({
  user: null,
  setUser: () => {},
  logout: () => {},
});

/**
 * Provider wrapping the app (see App.jsx) that owns the user state.
 * @param {object} props Component props.
 * @param {React.ReactNode} props.children Subtree that can read the context.
 * @returns {JSX.Element} The context provider.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const value = useMemo(() => ({
    user,
    setUser,
    logout: () => setUser(null),
  }), [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;
