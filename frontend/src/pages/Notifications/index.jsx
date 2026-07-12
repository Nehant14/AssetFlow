import React, { useEffect, useState } from 'react';
import { PackageCheck, ArrowLeftRight, CalendarClock, Wrench } from 'lucide-react';
import { getDashboardKPIs } from '../../api/notifications.api';

const emptyKpis = { totalAvailable: 0, totalAllocated: 0, activeBookings: 0, pendingMaint: 0 };

const Tile = ({ label, value, icon }) => (
  <div className="stat-tile flex items-start justify-between">
    <div>
      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
    </div>
    <div className="w-8 h-8 rounded-md bg-panel2 border border-line flex items-center justify-center text-ink-faint">
      {icon}
    </div>
  </div>
);

// Note: the backend does not currently expose a per-user notification feed
// (no GET /api/notifications), even though a Notification model exists in
// the schema — only the dashboard KPI aggregate below is wired up. This page
// surfaces that snapshot as system alerts until an inbox endpoint exists.
const Notifications = () => {
  const [kpis, setKpis] = useState(emptyKpis);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardKPIs()
      .then(res => setKpis({ ...emptyKpis, ...(res.data?.data || res.data) }))
      .catch(err => console.error('Failed to fetch KPIs', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-lg font-bold text-ink">Notifications</h1>
        <p className="text-xs text-ink-faint mt-0.5">System-wide alerts derived from live asset status</p>
      </div>

      {loading ? (
        <p className="text-ink-faint text-sm">Loading…</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Tile label="Available Assets" value={kpis.totalAvailable} icon={<PackageCheck size={16} />} />
          <Tile label="Allocated Assets" value={kpis.totalAllocated} icon={<ArrowLeftRight size={16} />} />
          <Tile label="Active Bookings" value={kpis.activeBookings} icon={<CalendarClock size={16} />} />
          <Tile label="Pending Maintenance" value={kpis.pendingMaint} icon={<Wrench size={16} />} />
        </div>
      )}

      <div className="card p-4 border-warn/30 bg-warn-soft">
        <p className="text-sm text-warn">
          A personal notification inbox isn't available yet — the backend only exposes this
          dashboard KPI snapshot (GET /api/notifications/dashboard-kpis). Once a list endpoint
          for individual notifications is added, this page can show a real per-user feed.
        </p>
      </div>
    </div>
  );
};

export default Notifications;
