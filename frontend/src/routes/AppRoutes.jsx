import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import NotFound from '../pages/NotFound';
import HouseholdDashboard from '../components/Household/HouseholdDashboard';
import CollectorDashboard from '../components/Collector/CollectorDashboard';
import CompanyDashboard from '../components/Company/CompanyDashboard';
import AdminLayout from '../components/Admin/AdminLayout';
import AdminDashboard from '../components/Admin/AdminDashboard';
import UserManagement from '../components/Admin/UserManagement';
import KYCReview from '../components/Admin/KYCReview';
import Pricing from '../components/Admin/Pricing';
import Subscriptions from '../components/Admin/Subscriptions';
import FraudDetection from '../components/Admin/FraudDetection';
import AuditLog from '../components/Admin/AuditLog';
import Reports from '../components/Admin/Reports';

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
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/household" element={<HouseholdDashboard />} />
        <Route path="/collector" element={<CollectorDashboard />} />
        <Route path="/company" element={<CompanyDashboard />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="kyc" element={<KYCReview />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="fraud" element={<FraudDetection />} />
          <Route path="audit" element={<AuditLog />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
