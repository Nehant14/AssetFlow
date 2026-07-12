import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import Dashboard from '../pages/Dashboard';
import Assets from '../pages/Assets';
import Allocations from '../pages/Allocations';
import Bookings from '../pages/Bookings';
import Maintenance from '../pages/Maintenance';
import Audits from '../pages/Audits';
import Organization from '../pages/Organization';
import Notifications from '../pages/Notifications';
import LoginPage from '../auth/LoginPage';
import SignupPage from '../auth/SignupPage';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />
      <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/" replace />} />

      {/* Protected Routes - only authenticated users may access the application.
          Most GET endpoints on the backend are open to any authenticated role,
          so pages are readable by everyone; individual forms/buttons inside
          each page are gated by capability via auth/roles.js. */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/allocations" element={<Allocations />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/audits" element={<Audits />} />
        <Route path="/organization" element={<Organization />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>

      {/* Unknown paths fall back to the dashboard (or login, if unauthenticated) */}
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  );
};

export default AppRoutes;
