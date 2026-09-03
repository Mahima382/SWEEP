import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import CompleteProfile from '../pages/CompleteProfile';
import NotFound from '../pages/NotFound';
import HouseholdDashboard from '../components/Household/HouseholdDashboard';
import CollectorDashboard from '../components/Collector/CollectorDashboard';
import CompanyDashboard from '../components/Company/CompanyDashboard';
import AdminDashboard from '../components/Admin/AdminDashboard';

/*
 * SHARED FILE — route table for the whole app.
 * Teammates: add new <Route /> entries ONE PER LINE inside the layout block
 * below (keep alphabetical-ish grouping by role) so git merges stay clean.
 * Do not reformat existing lines when adding yours.
 */

/**
 * Central route table for SWEEP. Mounted inside BrowserRouter by App.jsx.
 * @returns {JSX.Element} The application routes.
 */
function AppRoutes() {
  return (
    <Routes>
      {/* Full-bleed landing page — own chrome, no MainLayout header/footer */}
      <Route path="/" element={<Home />} />
      <Route element={<MainLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/household" element={<HouseholdDashboard />} />
        <Route path="/collector" element={<CollectorDashboard />} />
        <Route path="/company" element={<CompanyDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
