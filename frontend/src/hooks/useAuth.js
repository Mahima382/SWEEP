import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook giving components access to the authenticated user and auth actions.
 * @returns {{user: (object|null), setUser: Function, logout: Function}}
 *   The current auth context value.
 */
export function useAuth() {
  return useContext(AuthContext);
}

export default useAuth;
