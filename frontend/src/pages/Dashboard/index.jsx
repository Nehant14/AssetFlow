import React, { useEffect, useState } from 'react';
import { Truck, PackageCheck, Wrench, Route, Clock, Users, Gauge } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const emptyKpis = {
  activeVehicles: 0,
  availableVehicles: 0,
  vehiclesInMaintenance: 0,
  activeTrips: 0,
  pendingTrips: 0,
  driversOnDuty: 0,
  fleetUtilization: 0,
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
  const [filters, setFilters] = useState({ vehicleType: '', status: '', region: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKPIs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchKPIs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.vehicleType) params.vehicleType = filters.vehicleType;
      if (filters.status) params.status = filters.status;
      if (filters.region) params.region = filters.region;

      // Display KPIs such as Active Vehicles, Available Vehicles, Vehicles in
      // Maintenance, Active Trips, Pending Trips, Drivers On Duty, and Fleet
      // Utilization (%), filterable by vehicle type, status, and region.
      const response = await axiosClient.get('/dashboard/kpis', { params });
      setKpis({ ...emptyKpis, ...response.data });
    } catch (err) {
      console.error('Failed to fetch dashboard KPIs', err);
    } finally {
      setLoading(false);
    }
  };

  const hasFilters = filters.vehicleType || filters.status || filters.region;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold text-ink">Today's Overview</h1>
          <p className="text-xs text-ink-faint mt-0.5">Live fleet status across your operation</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-wrap gap-4 items-end">
        <div>
          <label className="field-label">Vehicle Type</label>
          <select value={filters.vehicleType} onChange={e => setFilters({ ...filters, vehicleType: e.target.value })} className="field">
            <option value="">All Types</option>
            <option value="Truck">Truck</option>
            <option value="Van">Van</option>
            <option value="Trailer">Trailer</option>
            <option value="Bike">Bike</option>
          </select>
        </div>
        <div>
          <label className="field-label">Status</label>
          <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="field">
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
        <div>
          <label className="field-label">Region</label>
          <input type="text" placeholder="e.g. North Zone" value={filters.region}
            onChange={e => setFilters({ ...filters, region: e.target.value })} className="field" />
        </div>
        {hasFilters && (
          <button onClick={() => setFilters({ vehicleType: '', status: '', region: '' })} className="link-action">
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-ink-faint text-sm">Loading KPIs…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatTile label="Active Vehicles" value={kpis.activeVehicles} icon={<Truck size={16} />} />
            <StatTile label="Available Vehicles" value={kpis.availableVehicles} icon={<PackageCheck size={16} />} />
            <StatTile label="In Maintenance" value={kpis.vehiclesInMaintenance} icon={<Wrench size={16} />} />
            <StatTile label="Active Trips" value={kpis.activeTrips} icon={<Route size={16} />} />
            <StatTile label="Pending Trips" value={kpis.pendingTrips} icon={<Clock size={16} />} />
            <StatTile label="Drivers On Duty" value={kpis.driversOnDuty} icon={<Users size={16} />} />
            <StatTile label="Fleet Utilization" value={kpis.fleetUtilization} suffix="%" icon={<Gauge size={16} />} />
          </div>

          {kpis.vehiclesInMaintenance > 0 && (
            <div className="card border-warn/30 bg-warn-soft px-4 py-3 mb-6 flex items-center justify-between">
              <p className="text-sm text-warn">
                {kpis.vehiclesInMaintenance} vehicle{kpis.vehiclesInMaintenance === 1 ? '' : 's'} currently in the shop — flagged for follow-up.
              </p>
              <a href="/maintenance" className="link-action">Review maintenance →</a>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/vehicles" className="card p-4 hover:border-accent/40 transition-colors">
              <p className="text-sm font-semibold text-ink">+ Register vehicle</p>
              <p className="text-xs text-ink-faint mt-1">Add a new vehicle to the registry</p>
            </a>
            <a href="/trips" className="card p-4 hover:border-accent/40 transition-colors">
              <p className="text-sm font-semibold text-ink">Book resource</p>
              <p className="text-xs text-ink-faint mt-1">Dispatch a vehicle and driver on a trip</p>
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
