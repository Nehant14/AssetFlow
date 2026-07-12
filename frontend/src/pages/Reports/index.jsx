import React, { useEffect, useState } from 'react';
import { getVehicleReports } from '../../api/reports.api';

// Turns the report rows into a CSV file and triggers a download.
const downloadCSV = (rows) => {
  if (!rows.length) return;
  const headers = ['Registration Number', 'Distance (km)', 'Fuel Used (L)', 'Fuel Efficiency (km/L)', 'Operational Cost', 'Vehicle ROI'];
  const lines = rows.map(r => [
    r.registrationNumber,
    r.distance,
    r.fuelUsed,
    r.fuelEfficiency,
    r.operationalCost,
    r.roi,
  ].join(','));
  const csvContent = [headers.join(','), ...lines].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `transitops-report-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const Reports = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getVehicleReports();
      // Expected raw fields per vehicle: distance, fuelUsed, fuelCost,
      // maintenanceCost, revenue, acquisitionCost
      const computed = res.data.map(v => {
        const fuelEfficiency = v.fuelUsed > 0 ? (v.distance / v.fuelUsed) : 0;
        const operationalCost = Number(v.fuelCost || 0) + Number(v.maintenanceCost || 0);
        // Vehicle ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
        const roi = v.acquisitionCost > 0
          ? ((Number(v.revenue || 0) - operationalCost) / Number(v.acquisitionCost)) * 100
          : 0;
        return {
          ...v,
          fuelEfficiency: fuelEfficiency.toFixed(2),
          operationalCost: operationalCost.toFixed(2),
          roi: roi.toFixed(1),
        };
      });
      setRows(computed);
    } catch (err) {
      console.error('Failed to load reports', err);
      setError('Could not load report data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
        <button
          onClick={() => downloadCSV(rows)}
          disabled={!rows.length}
          className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-900 disabled:opacity-40"
        >
          Export CSV
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading reports...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-3">Vehicle</th>
                <th className="p-3">Distance (km)</th>
                <th className="p-3">Fuel Used (L)</th>
                <th className="p-3">Fuel Efficiency (km/L)</th>
                <th className="p-3">Operational Cost</th>
                <th className="p-3">ROI (%)</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={6} className="p-4 text-center text-gray-500">No report data available yet.</td></tr>
              )}
              {rows.map((r, i) => (
                <tr key={r.vehicleId || i} className="border-b">
                  <td className="p-3">{r.registrationNumber}</td>
                  <td className="p-3">{r.distance}</td>
                  <td className="p-3">{r.fuelUsed}</td>
                  <td className="p-3">{r.fuelEfficiency}</td>
                  <td className="p-3">₹{r.operationalCost}</td>
                  <td className={`p-3 font-medium ${Number(r.roi) >= 0 ? 'text-green-700' : 'text-red-600'}`}>{r.roi}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reports;
