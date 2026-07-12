import React, { useState, useEffect } from 'react';
import { getVehicles } from '../../api/vehicles.api';
import { getMaintenanceLogs, createMaintenanceLog, closeMaintenanceLog } from '../../api/maintenance.api';
import { SearchBox } from '../../components/common';
import useTableControls from '../../hooks/useTableControls';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../auth/roles';

const Maintenance = () => {
  const { user } = useAuth();
  const canManage = can(user?.role, 'manageMaintenance');

  const [vehicles, setVehicles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [maintenanceType, setMaintenanceType] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const regNo = (vehicleId) => vehicles.find(v => v.id === vehicleId)?.registrationNumber || vehicleId;

  // Bonus feature: search & sort — enrich logs with the reg no so search can match it
  const enrichedLogs = logs.map(l => ({ ...l, vehicleRegistrationNumber: regNo(l.vehicleId) }));
  const { search, setSearch, result } = useTableControls(enrichedLogs, ['vehicleRegistrationNumber', 'type', 'status']);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [vRes, lRes] = await Promise.all([getVehicles(), getMaintenanceLogs()]);
      setVehicles(vRes.data);
      setLogs(lRes.data);
    } catch (err) {
      console.error('Failed to load maintenance data', err);
    }
  };

  const handleCreateMaintenance = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Creating an active maintenance record automatically changes vehicle
      // status to In Shop (handled server-side), removing it from dispatch.
      await createMaintenanceLog({ vehicleId: selectedVehicle, type: maintenanceType });
      setMaintenanceType('');
      setSelectedVehicle('');
      loadAll();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (id) => {
    try {
      // Closing maintenance restores the vehicle to Available (unless retired).
      await closeMaintenanceLog(id);
      loadAll();
    } catch (err) {
      console.error('Failed to close maintenance log', err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-lg font-bold text-ink mb-5">Maintenance</h1>

      {canManage ? (
        <div className="card p-4 max-w-md mb-8">
          <p className="panel-header mb-3">Log vehicle maintenance</p>
          <form onSubmit={handleCreateMaintenance} className="flex flex-col gap-3">
            <select required value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} className="field">
              <option value="">Select Vehicle</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.registrationNumber} - {v.status}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Maintenance Type (e.g., Oil Change)"
              required
              value={maintenanceType}
              onChange={(e) => setMaintenanceType(e.target.value)}
              className="field"
            />
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Logging…' : 'Log Maintenance'}
            </button>
          </form>
        </div>
      ) : (
        <div className="card px-4 py-2.5 mb-6 border-info/30 bg-info-soft">
          <p className="text-xs text-info">Your role ({user?.role}) can view maintenance logs but can't create or close them.</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <p className="panel-header">Maintenance logs</p>
        <SearchBox value={search} onChange={setSearch} placeholder="Search vehicle, type…" />
      </div>
      <div className="table-shell">
        <table className="table-base">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {result.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-ink-faint">No maintenance logs match your search.</td></tr>
            )}
            {result.map(log => (
              <tr key={log.id}>
                <td className="font-mono">{regNo(log.vehicleId)}</td>
                <td>{log.type}</td>
                <td>
                  <span className={`badge ${log.status === 'Closed' ? 'badge-success' : 'badge-warn'}`}>
                    {log.status || 'Open'}
                  </span>
                </td>
                <td>
                  {canManage && log.status !== 'Closed' ? (
                    <button onClick={() => handleClose(log.id)} className="link-action">
                      Close (mark Available)
                    </button>
                  ) : (
                    <span className="text-ink-faint text-sm">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Maintenance;
