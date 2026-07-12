import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getVehicleReports } from '../../api/reports.api';
import { exportTableToPDF } from '../../utils/pdfExport';
import { SearchBox, SortableTh } from '../../components/common';
import useTableControls from '../../hooks/useTableControls';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../auth/roles';

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

// Bonus feature: PDF export.
const downloadPDF = (rows) => {
  exportTableToPDF({
    title: 'TransitOps — Vehicle Performance Report',
    filename: `transitops-report-${new Date().toISOString().slice(0, 10)}.pdf`,
    columns: [
      { header: 'Reg No', key: 'registrationNumber' },
      { header: 'Distance (km)', key: 'distance' },
      { header: 'Fuel Used (L)', key: 'fuelUsed' },
      { header: 'Fuel Efficiency (km/L)', key: 'fuelEfficiency' },
      { header: 'Operational Cost', key: 'operationalCost', format: (r) => `Rs. ${r.operationalCost}` },
      { header: 'ROI (%)', key: 'roi' },
    ],
    rows,
  });
};

const Reports = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { search, setSearch, sortKey, sortDir, toggleSort, result } = useTableControls(rows, ['registrationNumber']);

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
          fuelEfficiency: Number(fuelEfficiency.toFixed(2)),
          operationalCost: Number(operationalCost.toFixed(2)),
          roi: Number(roi.toFixed(1)),
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

  const canExport = can(user?.role, 'exportReports');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <h1 className="text-lg font-bold text-ink">Reports &amp; Analytics</h1>
        <div className="flex items-center gap-3">
          <SearchBox value={search} onChange={setSearch} placeholder="Search vehicle…" />
          {canExport && (
            <>
              <button onClick={() => downloadCSV(result)} disabled={!result.length} className="btn-secondary">
                Export CSV
              </button>
              <button onClick={() => downloadPDF(result)} disabled={!result.length} className="btn-secondary">
                Export PDF
              </button>
            </>
          )}
        </div>
      </div>

      {loading && <p className="text-ink-faint text-sm">Loading reports…</p>}
      {error && <p className="text-danger text-sm">{error}</p>}

      {!loading && !error && (
        <>
          {/* Bonus feature: charts and visual analytics */}
          {rows.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="card p-4">
                <p className="panel-header mb-3">Fuel efficiency by vehicle (km/L)</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={rows} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262d2f" />
                    <XAxis dataKey="registrationNumber" tick={{ fontSize: 10, fill: '#66787c' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#66787c' }} />
                    <Tooltip contentStyle={{ background: '#191f21', border: '1px solid #262d2f', fontSize: 12 }} />
                    <Bar dataKey="fuelEfficiency" fill="#4fb2e8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card p-4">
                <p className="panel-header mb-3">Vehicle ROI (%)</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={rows} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262d2f" />
                    <XAxis dataKey="registrationNumber" tick={{ fontSize: 10, fill: '#66787c' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#66787c' }} />
                    <Tooltip contentStyle={{ background: '#191f21', border: '1px solid #262d2f', fontSize: 12 }} />
                    <Line type="monotone" dataKey="roi" stroke="#3ecf8e" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="table-shell">
            <table className="table-base">
              <thead>
                <tr>
                  <SortableTh label="Vehicle" sortKeyName="registrationNumber" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Distance (km)" sortKeyName="distance" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Fuel Used (L)" sortKeyName="fuelUsed" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Fuel Efficiency (km/L)" sortKeyName="fuelEfficiency" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Operational Cost" sortKeyName="operationalCost" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="ROI (%)" sortKeyName="roi" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                </tr>
              </thead>
              <tbody>
                {result.length === 0 && (
                  <tr><td colSpan={6} className="p-4 text-center text-ink-faint">No report data available yet.</td></tr>
                )}
                {result.map((r, i) => (
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
        </>
      )}
    </div>
  );
};

export default Reports;
