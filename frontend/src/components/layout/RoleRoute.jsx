import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../auth/roles';

// Gates a route (and everything nested under it) behind an RBAC capability.
// Usage: <Route element={<RoleRoute capability="manageAssets" />}> ... </Route>
// If `capability` is null/undefined, any authenticated role may pass.
const RoleRoute = ({ capability }) => {
  const { user } = useAuth();

  if (!capability) return <Outlet />;

  const allowed = can(user?.role, capability);

  if (!allowed) {
    return (
      <div className="p-10 max-w-lg mx-auto text-center">
        <div className="card p-8">
          <h2 className="text-base font-bold text-ink mb-2">Access restricted</h2>
          <p className="text-sm text-ink-dim">
            Your role (<span className="text-ink font-medium">{user?.role || 'Unknown'}</span>) doesn't have
            permission to view this section. Contact an Admin if you believe this is a mistake.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default RoleRoute;
