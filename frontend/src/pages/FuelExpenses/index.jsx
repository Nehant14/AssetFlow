import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getFuelLogs, createFuelLog, getExpenses, createExpense } from '../../api/fuel.api';
import { getVehicles } from '../../api/vehicles.api';
import { SearchBox } from '../../components/common';
import useTableControls from '../../hooks/useTableControls';
import { exportTableToPDF } from '../../utils/pdfExport';

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

  // Bonus feature: charts and visual analytics
  const chartData = useMemo(
    () => Object.entries(totalsByVehicle).map(([vehicleId, total]) => ({
      name: regNo(vehicleId),
      total: Number(total.toFixed(2)),
    })),
    [totalsByVehicle, vehicles]
  );

  const allEntries = [...fuelLogs.map(f => ({ ...f, type: 'Fuel' })), ...expenses]
    .map(e => ({ ...e, vehicleRegistrationNumber: regNo(e.vehicleId) }));

  // Bonus feature: search, filters, sorting
  const { search, setSearch, sortKey, sortDir, toggleSort, result } = useTableControls(
    allEntries, ['vehicleRegistrationNumber', 'type']
  );

  const handleExportPDF = () => {
    exportTableToPDF({
      title: 'TransitOps — Fuel & Expense Log',
      filename: `fuel-expenses-${new Date().toISOString().slice(0, 10)}.pdf`,
      columns: [
        { header: 'Vehicle', key: 'vehicleRegistrationNumber' },
        { header: 'Type', key: 'type' },
        { header: 'Liters', key: 'liters', format: (r) => r.liters ?? '—' },
        { header: 'Cost', key: 'cost', format: (r) => `Rs. ${Number(r.cost || 0).toFixed(2)}` },
        { header: 'Date', key: 'date', format: (r) => r.date ? new Date(r.date).toLocaleDateString() : '—' },
      ],
      rows: result,
    });
  };

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {Object.entries(totalsByVehicle).map(([vehicleId, total]) => (
            <div key={vehicleId} className="border border-line rounded-md p-3 bg-panel2">
              <p className="text-xs text-ink-faint">{regNo(vehicleId)}</p>
              <p className="text-lg font-bold font-mono text-ink">₹{total.toFixed(2)}</p>
            </div>
          ))}
        </div>
        {/* Bonus feature: charts and visual analytics */}
        {chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262d2f" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#66787c' }} />
              <YAxis tick={{ fontSize: 10, fill: '#66787c' }} />
              <Tooltip contentStyle={{ background: '#191f21', border: '1px solid #262d2f', fontSize: 12 }} />
              <Bar dataKey="total" fill="#e8b64f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <SearchBox value={search} onChange={setSearch} placeholder="Search vehicle, type…" />
        <button onClick={handleExportPDF} disabled={!result.length} className="btn-secondary">Export PDF</button>
      </div>
      <div className="table-shell">
        <table className="table-base">
          <thead>
            <tr>
              <th onClick={() => toggleSort('vehicleRegistrationNumber')} className="cursor-pointer">Vehicle</th>
              <th onClick={() => toggleSort('type')} className="cursor-pointer">Type</th>
              <th>Liters</th>
              <th onClick={() => toggleSort('cost')} className="cursor-pointer">Cost</th>
              <th onClick={() => toggleSort('date')} className="cursor-pointer">Date</th>
            </tr>
          </thead>
          <tbody>
            {result.length === 0 && (
              <tr><td colSpan={5} className="p-4 text-center text-ink-faint">No entries match your search.</td></tr>
            )}
            {result.map((entry, idx) => (
              <tr key={idx}>
                <td className="font-mono">{entry.vehicleRegistrationNumber}</td>
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
