import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-base-900 text-ink-faint text-sm">Loading…</div>;

  // Only authenticated users should access the application[cite: 2]
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;