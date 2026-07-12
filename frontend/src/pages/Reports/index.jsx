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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-lg font-bold text-ink">Reports &amp; Analytics</h1>
        <button
          onClick={() => downloadCSV(rows)}
          disabled={!rows.length}
          className="btn-secondary"
        >
          Export CSV
        </button>
      </div>

      {loading && <p className="text-ink-faint text-sm">Loading reports…</p>}
      {error && <p className="text-danger text-sm">{error}</p>}

      {!loading && !error && (
        <div className="table-shell">
          <table className="table-base">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Distance (km)</th>
                <th>Fuel Used (L)</th>
                <th>Fuel Efficiency (km/L)</th>
                <th>Operational Cost</th>
                <th>ROI (%)</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={6} className="p-4 text-center text-ink-faint">No report data available yet.</td></tr>
              )}
              {rows.map((r, i) => (
                <tr key={r.vehicleId || i}>
                  <td className="font-mono text-ink">{r.registrationNumber}</td>
                  <td>{r.distance}</td>
                  <td>{r.fuelUsed}</td>
                  <td>{r.fuelEfficiency}</td>
                  <td>₹{r.operationalCost}</td>
                  <td className={`font-medium ${Number(r.roi) >= 0 ? 'text-accent' : 'text-danger'}`}>{r.roi}%</td>
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
