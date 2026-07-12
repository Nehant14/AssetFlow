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
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-lg font-bold text-ink mb-5">Fuel &amp; Expense Management</h1>

      <div className="card p-4 max-w-xl mb-6">
        <p className="panel-header mb-3">Log entry</p>
        <form onSubmit={submitLog} className="flex flex-col gap-3">
          <select required value={log.vehicleId} onChange={e => setLog({ ...log, vehicleId: e.target.value })} className="field">
            <option value="">Select Vehicle</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.registrationNumber}</option>
            ))}
          </select>
          <select value={log.type} onChange={e => setLog({ ...log, type: e.target.value })} className="field">
            <option value="Fuel">Fuel</option>
            <option value="Toll">Toll</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Other">Other</option>
          </select>
          {log.type === 'Fuel' && (
            <input type="number" step="0.01" placeholder="Liters" required value={log.liters}
              onChange={e => setLog({ ...log, liters: e.target.value })} className="field" />
          )}
          <input type="number" step="0.01" placeholder="Total Cost" required value={log.cost}
            onChange={e => setLog({ ...log, cost: e.target.value })} className="field" />
          <input type="date" required value={log.date}
            onChange={e => setLog({ ...log, date: e.target.value })} className="field" />
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Saving…' : 'Submit Entry'}
          </button>
        </form>
      </div>

      <div className="card p-4 mb-6">
        <p className="panel-header mb-3">Operational cost by vehicle</p>
        {Object.keys(totalsByVehicle).length === 0 && <p className="text-ink-faint text-sm">No entries logged yet.</p>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(totalsByVehicle).map(([vehicleId, total]) => (
            <div key={vehicleId} className="border border-line rounded-md p-3 bg-panel2">
              <p className="text-xs text-ink-faint">{regNo(vehicleId)}</p>
              <p className="text-lg font-bold font-mono text-ink">₹{total.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="table-shell">
        <table className="table-base">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Type</th>
              <th>Liters</th>
              <th>Cost</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {[...fuelLogs.map(f => ({ ...f, type: 'Fuel' })), ...expenses].map((entry, idx) => (
              <tr key={idx}>
                <td className="font-mono">{regNo(entry.vehicleId)}</td>
                <td>{entry.type}</td>
                <td>{entry.liters ?? '—'}</td>
                <td>₹{Number(entry.cost || 0).toFixed(2)}</td>
                <td>{entry.date ? new Date(entry.date).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FuelExpenses;
