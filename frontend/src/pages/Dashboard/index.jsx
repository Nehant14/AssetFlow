import React, { useEffect, useMemo, useState } from 'react';
import { PackageCheck, ArrowLeftRight, CalendarClock, Wrench } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getDashboardKPIs } from '../../api/notifications.api';
import { getAssets } from '../../api/assets.api';

const emptyKpis = { totalAvailable: 0, totalAllocated: 0, activeBookings: 0, pendingMaint: 0 };

const STATUS_COLORS = {
  Available: '#3ecf8e',
  Allocated: '#4fb2e8',
  Reserved: '#9b8cf2',
  UnderMaintenance: '#e8b64f',
  Lost: '#e05d5d',
  Retired: '#66787c',
  Disposed: '#66787c',
};

const StatTile = ({ label, value, suffix = '', icon }) => (
  <div className="stat-tile flex items-start justify-between">
    <div>
      <p className="stat-value">{value}{suffix}</p>
      <p className="stat-label">{label}</p>
    </div>
    <div className="w-8 h-8 rounded-md bg-panel2 border border-line flex items-center justify-center text-ink-faint">
      {icon}
    </div>
  </div>
);

const Dashboard = () => {
  const [kpis, setKpis] = useState(emptyKpis);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [kpiRes, assetsRes] = await Promise.all([getDashboardKPIs(), getAssets()]);
      setKpis({ ...emptyKpis, ...(kpiRes.data?.data || kpiRes.data) });
      setAssets(assetsRes.data?.data || assetsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const kpiChartData = useMemo(() => ([
    { name: 'Available', value: kpis.totalAvailable },
    { name: 'Allocated', value: kpis.totalAllocated },
    { name: 'Active Bookings', value: kpis.activeBookings },
    { name: 'Pending Maintenance', value: kpis.pendingMaint },
  ]), [kpis]);

  const statusPieData = useMemo(() => {
    const counts = assets.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [assets]);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <div>
          <h1 className="text-lg font-bold text-ink">Today's Overview</h1>
          <p className="text-xs text-ink-faint mt-0.5">Live asset status across your organization</p>
        </div>
      </div>

      {loading ? (
        <p className="text-ink-faint text-sm">Loading KPIs…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatTile label="Available Assets" value={kpis.totalAvailable} icon={<PackageCheck size={16} />} />
            <StatTile label="Allocated Assets" value={kpis.totalAllocated} icon={<ArrowLeftRight size={16} />} />
            <StatTile label="Active Bookings" value={kpis.activeBookings} icon={<CalendarClock size={16} />} />
            <StatTile label="Pending Maintenance" value={kpis.pendingMaint} icon={<Wrench size={16} />} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="card p-4 md:col-span-2">
              <p className="panel-header mb-3">Operational KPI breakdown</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={kpiChartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262d2f" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#66787c' }} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 10, fill: '#66787c' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#191f21', border: '1px solid #262d2f', fontSize: 12 }} />
                  <Bar dataKey="value" fill="#3ecf8e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-4">
              <p className="panel-header mb-3">Asset status split</p>
              {statusPieData.length === 0 ? (
                <p className="text-ink-faint text-sm">No asset data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusPieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                      {statusPieData.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#9b8cf2'} />
                      ))}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#191f21', border: '1px solid #262d2f', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {kpis.pendingMaint > 0 && (
            <div className="card border-warn/30 bg-warn-soft px-4 py-3 mb-6 flex items-center justify-between">
              <p className="text-sm text-warn">
                {kpis.pendingMaint} maintenance request{kpis.pendingMaint === 1 ? '' : 's'} pending review.
              </p>
              <a href="/maintenance" className="link-action">Review maintenance →</a>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/assets" className="card p-4 hover:border-accent/40 transition-colors">
              <p className="text-sm font-semibold text-ink">+ Register asset</p>
              <p className="text-xs text-ink-faint mt-1">Add a new asset to the registry</p>
            </a>
            <a href="/bookings" className="card p-4 hover:border-accent/40 transition-colors">
              <p className="text-sm font-semibold text-ink">Book a resource</p>
              <p className="text-xs text-ink-faint mt-1">Reserve time on a shared, bookable asset</p>
            </a>
            <a href="/maintenance" className="card p-4 hover:border-accent/40 transition-colors">
              <p className="text-sm font-semibold text-ink">Raise request</p>
              <p className="text-xs text-ink-faint mt-1">Log a new maintenance request</p>
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
