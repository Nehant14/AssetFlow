import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { getVehicles, createVehicle, updateVehicleStatus } from '../../api/vehicles.api';
import { SearchBox, SortableTh } from '../../components/common';
import useTableControls from '../../hooks/useTableControls';
import { exportTableToPDF } from '../../utils/pdfExport';

const statusBadge = {
  Available: 'badge-success',
  'On Trip': 'badge-info',
  'In Shop': 'badge-warn',
  Retired: 'badge-neutral',
};

const emptyVehicle = {
  registrationNumber: '',
  name: '',
  type: '',
  maxLoadCapacity: '',
  odometer: '',
  acquisitionCost: '',
  status: 'Available', // Status values: Available, On Trip, In Shop, Retired
};

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [newVehicle, setNewVehicle] = useState(emptyVehicle);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  // Bonus feature: search, filters, and sorting
  const { search, setSearch, sortKey, sortDir, toggleSort, result } = useTableControls(
    vehicles.filter(v => !statusFilter || v.status === statusFilter),
    ['registrationNumber', 'name', 'type']
  );

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await getVehicles();
      setVehicles(res.data);
    } catch (err) {
      console.error('Failed to fetch vehicles', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createVehicle(newVehicle);
      setNewVehicle(emptyVehicle);
      fetchVehicles();
    } catch (err) {
      // The vehicle registration number must be unique - surface that error here.
      setError(err?.response?.data?.message || 'Failed to register vehicle. Registration number may already exist.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetire = async (id) => {
    if (!window.confirm('Retire this vehicle? It will no longer be available for dispatch.')) return;
    try {
      await updateVehicleStatus(id, 'Retired');
      fetchVehicles();
    } catch (err) {
      console.error('Failed to retire vehicle', err);
    }
  };

  const handleExportPDF = () => {
    exportTableToPDF({
      title: 'TransitOps — Vehicle Registry',
      filename: `vehicle-registry-${new Date().toISOString().slice(0, 10)}.pdf`,
      columns: [
        { header: 'Reg No', key: 'registrationNumber' },
        { header: 'Model', key: 'name' },
        { header: 'Type', key: 'type' },
        { header: 'Capacity (kg)', key: 'maxLoadCapacity' },
        { header: 'Status', key: 'status' },
      ],
      rows: result,
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-bold text-ink">Vehicle Registry</h1>
        <div className="flex items-center gap-2">
          <Link to="/vehicles/documents" className="btn-secondary inline-flex items-center gap-1.5 text-xs">
            <FileText size={13} /> Manage Documents
          </Link>
          <span className="text-xs text-ink-faint">{vehicles.length} registered</span>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="card p-4 mb-6">
        <p className="panel-header mb-3">Register vehicle</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <input type="text" placeholder="Registration Number (Unique)" required value={newVehicle.registrationNumber}
            onChange={e => setNewVehicle({ ...newVehicle, registrationNumber: e.target.value })} className="field" />
          <input type="text" placeholder="Vehicle Name/Model" required value={newVehicle.name}
            onChange={e => setNewVehicle({ ...newVehicle, name: e.target.value })} className="field" />
          <input type="text" placeholder="Vehicle Type" required value={newVehicle.type}
            onChange={e => setNewVehicle({ ...newVehicle, type: e.target.value })} className="field" />
          <input type="number" placeholder="Max Load Capacity (kg)" required value={newVehicle.maxLoadCapacity}
            onChange={e => setNewVehicle({ ...newVehicle, maxLoadCapacity: e.target.value })} className="field" />
          <input type="number" placeholder="Odometer" required value={newVehicle.odometer}
            onChange={e => setNewVehicle({ ...newVehicle, odometer: e.target.value })} className="field" />
          <input type="number" placeholder="Acquisition Cost" required value={newVehicle.acquisitionCost}
            onChange={e => setNewVehicle({ ...newVehicle, acquisitionCost: e.target.value })} className="field" />
        </div>
        <button type="submit" disabled={submitting} className="btn-primary mt-3">
          {submitting ? 'Registering…' : 'Register Vehicle'}
        </button>
        {error && <p className="text-danger text-xs mt-3">{error}</p>}
      </form>

      {/* Bonus feature: search, filter, sort, and PDF export toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <SearchBox value={search} onChange={setSearch} placeholder="Search reg no, model, type…" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="field">
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
        <button onClick={handleExportPDF} disabled={!result.length} className="btn-secondary">Export PDF</button>
      </div>

      {/* Master List of Vehicles */}
      <div className="table-shell">
        <table className="table-base">
          <thead>
            <tr>
              <SortableTh label="Reg No" sortKeyName="registrationNumber" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Model" sortKeyName="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Type" sortKeyName="type" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Capacity" sortKeyName="maxLoadCapacity" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Status" sortKeyName="status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {result.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-ink-faint">No vehicles match your search.</td></tr>
            )}
            {result.map(v => (
              <tr key={v.id}>
                <td className="font-mono text-ink">{v.registrationNumber}</td>
                <td>{v.name}</td>
                <td>{v.type}</td>
                <td>{v.maxLoadCapacity} kg</td>
                <td>
                  <span className={`badge ${statusBadge[v.status] || 'badge-neutral'}`}>
                    {v.status}
                  </span>
                </td>
                <td>
                  {v.status !== 'Retired' && v.status !== 'On Trip' && (
                    <button onClick={() => handleRetire(v.id)} className="link-action !text-danger">
                      Retire
                    </button>
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

export default Vehicles;
