import React, { useEffect, useState } from 'react';
import { PackageCheck, ArrowLeftRight, CalendarClock, Wrench } from 'lucide-react';
import { getDashboardKPIs, getNotifications, markNotificationRead } from '../../api/notifications.api';

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
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardKPIs(), getNotifications()])
      .then(([kpiRes, notifRes]) => {
        setKpis({ ...emptyKpis, ...(kpiRes.data?.data || kpiRes.data) });
        setNotifications(notifRes.data?.data || notifRes.data || []);
      })
      .catch(err => console.error('Failed to fetch notifications', err))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
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
            {notifications.length === 0 ? (
              <p className="text-ink-faint text-sm">No notifications yet.</p>
            ) : (
              <ul className="space-y-2">
                {notifications.map(n => (
                  <li key={n.id} className={`rounded border p-3 text-sm ${n.isRead ? 'border-line bg-panel2' : 'border-accent/40 bg-accent/10'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span>{n.message}</span>
                      {!n.isRead && <button className="text-xs text-accent" onClick={() => handleMarkRead(n.id)}>Mark read</button>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Notifications;
