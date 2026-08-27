import React, { createContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Authentication context: holds the logged-in user and JWT for the whole app.
 * Consume it via the useAuth() hook in src/hooks/useAuth.js. The token and user
 * are persisted to localStorage so a refresh keeps the admin session alive.
 * @type {React.Context<{user: (object|null), token: (string|null), setUser: Function, setToken: Function, setAuth: Function, logout: Function}>}
 */
export const AuthContext = createContext({
  user: null,
  token: null,
  setUser: () => {},
  setToken: () => {},
  setAuth: () => {},
  logout: () => {},
});

function readStored(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) { return null; }
    if (key === 'sweep_token') { return raw; }
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

/**
 * Provider wrapping the app (see App.jsx) that owns the user + token state.
 * @param {object} props Component props.
 * @param {React.ReactNode} props.children Subtree that can read the context.
 * @returns {JSX.Element} The context provider.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStored('sweep_user'));
  const [token, setToken] = useState(() => readStored('sweep_token'));

  const value = useMemo(() => ({
    user,
    token,
    setUser,
    setToken,
    setAuth: (newToken, newUser) => {
      try {
        if (newToken) { localStorage.setItem('sweep_token', newToken); } else { localStorage.removeItem('sweep_token'); }
        if (newUser) { localStorage.setItem('sweep_user', JSON.stringify(newUser)); } else { localStorage.removeItem('sweep_user'); }
      } catch (err) {
        /* ignore storage failures */
      }
      setToken(newToken || null);
      setUser(newUser || null);
    },
    logout: () => {
      try {
        localStorage.removeItem('sweep_token');
        localStorage.removeItem('sweep_user');
      } catch (err) {
        /* ignore storage failures */
      }
      setToken(null);
      setUser(null);
    },
  }), [user, token]);

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
