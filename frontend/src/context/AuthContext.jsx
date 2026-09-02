import React, {
  createContext, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';

const USER_STORAGE_KEY = 'sweep_user';
const TOKEN_STORAGE_KEY = 'sweep_token';

/**
 * Reads the previously logged-in user back out of localStorage, if any,
 * so a page refresh doesn't drop the session (FR-02).
 * @returns {object|null} The stored user, or null when absent/unreadable.
 */
function loadStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

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
  const [user, setUser] = useState(loadStoredUser);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch (err) {
      // localStorage unavailable (e.g. private mode) — session just won't persist.
    }
  }, [user]);

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
