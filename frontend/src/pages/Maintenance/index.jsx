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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-slate-800">Maintenance</h1>

      <h2 className="text-lg font-semibold mb-2">Log Vehicle Maintenance</h2>
      <form onSubmit={handleCreateMaintenance} className="bg-white p-4 shadow rounded max-w-md mb-8">
        <select required value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} className="border p-2 w-full mb-3 rounded">
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
          className="border p-2 w-full mb-3 rounded"
        />
        <button type="submit" disabled={submitting} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50">
          {submitting ? 'Logging...' : 'Log Maintenance'}
        </button>
      </form>

      <h2 className="text-lg font-semibold mb-2">Maintenance Logs</h2>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3">Vehicle</th>
              <th className="p-3">Type</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">No maintenance logs yet.</td></tr>
            )}
            {logs.map(log => (
              <tr key={log.id} className="border-b">
                <td className="p-3">{regNo(log.vehicleId)}</td>
                <td className="p-3">{log.type}</td>
                <td className="p-3">
                  <span className={`badge ${log.status === 'Closed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {log.status || 'Open'}
                  </span>
                </td>
                <td className="p-3">
                  {log.status !== 'Closed' ? (
                    <button onClick={() => handleClose(log.id)} className="text-blue-600 text-sm hover:underline">
                      Close (mark Available)
                    </button>
                  ) : (
                    <span className="text-gray-400 text-sm">—</span>
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
