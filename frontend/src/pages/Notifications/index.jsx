import React, { useEffect, useState } from 'react';
import { PackageCheck, ArrowLeftRight, CalendarClock, Wrench } from 'lucide-react';
import { getDashboardKPIs } from '../../api/notifications.api';

const emptyKpis = { totalAvailable: 0, totalAllocated: 0, activeBookings: 0, pendingMaint: 0, maintenanceToday: 0, pendingTransfers: 0, upcomingReturns: 0, overdueReturns: 0 };

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

const Notifications = () => {
  const [kpis, setKpis] = useState(emptyKpis);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardKPIs()
      .then((kpiRes) => {
        setKpis({ ...emptyKpis, ...(kpiRes.data?.data || kpiRes.data) });
      })
      .catch(err => console.error('Failed to fetch notifications', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-lg font-bold text-ink">Notifications</h1>
        <p className="text-xs text-ink-faint mt-0.5">System-wide alerts derived from live asset status</p>
      </div>

      {loading ? (
        <p className="text-ink-faint text-sm">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Tile label="Available Assets" value={kpis.totalAvailable} icon={<PackageCheck size={16} />} />
            <Tile label="Allocated Assets" value={kpis.totalAllocated} icon={<ArrowLeftRight size={16} />} />
            <Tile label="Active Bookings" value={kpis.activeBookings} icon={<CalendarClock size={16} />} />
            <Tile label="Pending Maintenance" value={kpis.pendingMaint} icon={<Wrench size={16} />} />
          </div>

          <div className="card p-4">
            <p className="panel-header mb-3">Inbox</p>
            {/* The backend has a Notification model but doesn't expose a list
                or mark-as-read route (only GET /dashboard-kpis), so there's
                nothing to fetch here yet — this is a placeholder rather than
                a broken/empty-looking inbox. */}
            <p className="text-ink-faint text-sm">
              A personal notification inbox isn't available from the API yet — only the
              KPI summary above. Once the backend adds a list endpoint for the
              <code className="mx-1 px-1 py-0.5 rounded bg-panel2 border border-line text-xs">Notification</code>
              model, per-user alerts will appear here.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Notifications;
