import React, { useState, useEffect } from 'react';
import { getFuelLogs, createFuelLog, getExpenses, createExpense } from '../../api/fuel.api';
import { getVehicles } from '../../api/vehicles.api';

const emptyLog = { vehicleId: '', type: 'Fuel', liters: '', cost: '', date: '' };

const FuelExpenses = () => {
  const [vehicles, setVehicles] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [log, setLog] = useState(emptyLog);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [vRes, fRes, eRes] = await Promise.all([
        getVehicles(),
        getFuelLogs(),
        getExpenses(),
      ]);
      setVehicles(vRes.data);
      setFuelLogs(fRes.data);
      setExpenses(eRes.data);
    } catch (err) {
      console.error('Failed to load fuel/expense data', err);
    }
  };

  const submitLog = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (log.type === 'Fuel') {
        // Record fuel logs (liters, cost, date)
        await createFuelLog({
          vehicleId: log.vehicleId,
          liters: Number(log.liters),
          cost: Number(log.cost),
          date: log.date,
        });
      } else {
        // Other operational expenses such as tolls or maintenance
        await createExpense({
          vehicleId: log.vehicleId,
          type: log.type,
          cost: Number(log.cost),
          date: log.date,
        });
      }
      setLog(emptyLog);
      loadAll();
    } catch (err) {
      console.error('Failed to submit log', err);
    } finally {
      setSubmitting(false);
    }
  };

  const regNo = (vehicleId) => vehicles.find(v => v.id === vehicleId)?.registrationNumber || vehicleId;

  // Automatically compute total operational cost (Fuel + Maintenance/expenses) per vehicle
  const totalsByVehicle = {};
  fuelLogs.forEach(f => {
    totalsByVehicle[f.vehicleId] = (totalsByVehicle[f.vehicleId] || 0) + Number(f.cost || 0);
  });
  expenses.forEach(e => {
    totalsByVehicle[e.vehicleId] = (totalsByVehicle[e.vehicleId] || 0) + Number(e.cost || 0);
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-slate-800">Fuel & Expense Management</h1>

      <form onSubmit={submitLog} className="bg-white p-4 shadow rounded max-w-xl flex flex-col gap-3 mb-6">
        <select required value={log.vehicleId} onChange={e => setLog({ ...log, vehicleId: e.target.value })} className="border p-2 rounded">
          <option value="">Select Vehicle</option>
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>{v.registrationNumber}</option>
          ))}
        </select>
        <select value={log.type} onChange={e => setLog({ ...log, type: e.target.value })} className="border p-2 rounded">
          <option value="Fuel">Fuel</option>
          <option value="Toll">Toll</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Other">Other</option>
        </select>
        {log.type === 'Fuel' && (
          <input type="number" step="0.01" placeholder="Liters" required value={log.liters}
            onChange={e => setLog({ ...log, liters: e.target.value })} className="border p-2 rounded" />
        )}
        <input type="number" step="0.01" placeholder="Total Cost" required value={log.cost}
          onChange={e => setLog({ ...log, cost: e.target.value })} className="border p-2 rounded" />
        <input type="date" required value={log.date}
          onChange={e => setLog({ ...log, date: e.target.value })} className="border p-2 rounded" />
        <button type="submit" disabled={submitting} className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 disabled:opacity-50">
          {submitting ? 'Saving...' : 'Submit Entry'}
        </button>
      </form>

      <div className="bg-white rounded shadow p-4 mb-6">
        <h2 className="font-semibold mb-3">Operational Cost by Vehicle</h2>
        {Object.keys(totalsByVehicle).length === 0 && <p className="text-gray-500 text-sm">No entries logged yet.</p>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(totalsByVehicle).map(([vehicleId, total]) => (
            <div key={vehicleId} className="border rounded p-3">
              <p className="text-sm text-gray-500">{regNo(vehicleId)}</p>
              <p className="text-lg font-bold">₹{total.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3">Vehicle</th>
              <th className="p-3">Type</th>
              <th className="p-3">Liters</th>
              <th className="p-3">Cost</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {[...fuelLogs.map(f => ({ ...f, type: 'Fuel' })), ...expenses].map((entry, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-3">{regNo(entry.vehicleId)}</td>
                <td className="p-3">{entry.type}</td>
                <td className="p-3">{entry.liters ?? '—'}</td>
                <td className="p-3">₹{Number(entry.cost || 0).toFixed(2)}</td>
                <td className="p-3">{entry.date ? new Date(entry.date).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FuelExpenses;
