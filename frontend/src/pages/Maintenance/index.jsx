import React, { useState, useEffect } from 'react';
import { getVehicles } from '../../api/vehicles.api';
import { getMaintenanceLogs, createMaintenanceLog, closeMaintenanceLog } from '../../api/maintenance.api';

const Maintenance = () => {
  const [vehicles, setVehicles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [maintenanceType, setMaintenanceType] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const regNo = (vehicleId) => vehicles.find(v => v.id === vehicleId)?.registrationNumber || vehicleId;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-lg font-bold text-ink mb-5">Maintenance</h1>

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

      <p className="panel-header mb-2">Maintenance logs</p>
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
            {logs.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-ink-faint">No maintenance logs yet.</td></tr>
            )}
            {logs.map(log => (
              <tr key={log.id}>
                <td className="font-mono">{regNo(log.vehicleId)}</td>
                <td>{log.type}</td>
                <td>
                  <span className={`badge ${log.status === 'Closed' ? 'badge-success' : 'badge-warn'}`}>
                    {log.status || 'Open'}
                  </span>
                </td>
                <td>
                  {log.status !== 'Closed' ? (
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
