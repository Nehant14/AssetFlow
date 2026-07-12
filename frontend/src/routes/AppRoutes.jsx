import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import RoleRoute from '../components/layout/RoleRoute';
import Dashboard from '../pages/Dashboard';
import Vehicles from '../pages/Vehicles';
import VehicleDocuments from '../pages/Vehicles/Documents';
import Drivers from '../pages/Drivers';
import Trips from '../pages/Trips';
import Maintenance from '../pages/Maintenance';
import FuelExpenses from '../pages/FuelExpenses';
import Reports from '../pages/Reports';
import Reminders from '../pages/Reminders';
import Notifications from '../pages/Notifications';
import LoginPage from '../auth/LoginPage';
import SignupPage from '../auth/SignupPage';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />
      <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/" replace />} />

      {/* Protected Routes - only authenticated users may access the application */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />

        <Route element={<RoleRoute capability="manageVehicles" />}>
          <Route path="/vehicles" element={<Vehicles />} />
        </Route>

        <Route element={<RoleRoute capability="manageDocuments" />}>
          <Route path="/vehicles/documents" element={<VehicleDocuments />} />
        </Route>

        <Route path="/drivers" element={<Drivers />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/maintenance" element={<Maintenance />} />

        <Route element={<RoleRoute capability="manageExpenses" />}>
          <Route path="/fuel-expenses" element={<FuelExpenses />} />
        </Route>

        <Route element={<RoleRoute capability="viewReports" />}>
          <Route path="/reports" element={<Reports />} />
        </Route>

        <Route element={<RoleRoute capability="manageReminders" />}>
          <Route path="/reminders" element={<Reminders />} />
        </Route>

        <Route path="/notifications" element={<Notifications />} />
      </Route>

      {/* Unknown paths fall back to the dashboard (or login, if unauthenticated) */}
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  );
};

export default AppRoutes;
