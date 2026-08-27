import React from 'react';
import CollectorPickupSchedule
  from '../pages/CollectorPickupSchedule';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
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
 * hahaha sakib hehe
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
        <Route path="/collector/pickups" element={<CollectorPickupSchedule />} />
        <Route path="/company" element={<CompanyDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
