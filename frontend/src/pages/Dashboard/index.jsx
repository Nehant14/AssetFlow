import React, { useEffect, useState } from 'react';
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

const KpiCard = ({ label, value, suffix = '' }) => (
  <div className="bg-white p-4 shadow rounded">
    <h3 className="text-sm text-gray-500">{label}</h3>
    <p className="text-2xl font-bold text-slate-800">{value}{suffix}</p>
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-slate-800">TransitOps Dashboard</h1>

      <div className="bg-white p-4 shadow rounded mb-6 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Vehicle Type</label>
          <select value={filters.vehicleType} onChange={e => setFilters({ ...filters, vehicleType: e.target.value })} className="border p-2 rounded">
            <option value="">All Types</option>
            <option value="Truck">Truck</option>
            <option value="Van">Van</option>
            <option value="Trailer">Trailer</option>
            <option value="Bike">Bike</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="border p-2 rounded">
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Region</label>
          <input type="text" placeholder="e.g. North Zone" value={filters.region}
            onChange={e => setFilters({ ...filters, region: e.target.value })} className="border p-2 rounded" />
        </div>
        {(filters.vehicleType || filters.status || filters.region) && (
          <button onClick={() => setFilters({ vehicleType: '', status: '', region: '' })} className="text-sm text-blue-600 hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading KPIs...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="Active Vehicles" value={kpis.activeVehicles} />
          <KpiCard label="Available Vehicles" value={kpis.availableVehicles} />
          <KpiCard label="Vehicles In Maintenance" value={kpis.vehiclesInMaintenance} />
          <KpiCard label="Active Trips" value={kpis.activeTrips} />
          <KpiCard label="Pending Trips" value={kpis.pendingTrips} />
          <KpiCard label="Drivers On Duty" value={kpis.driversOnDuty} />
          <KpiCard label="Fleet Utilization" value={kpis.fleetUtilization} suffix="%" />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
