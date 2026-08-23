import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';

/**
 * Root application component. Wires the auth context and the router
 * around the shared route table in src/routes/AppRoutes.jsx.
 * @returns {JSX.Element} The SWEEP application tree.
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
