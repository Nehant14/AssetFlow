import React, { useState, useEffect } from 'react';
import { getDrivers, createDriver, updateDriverStatus } from '../../api/drivers.api';
import { SearchBox } from '../../components/common';
import useTableControls from '../../hooks/useTableControls';
import { exportTableToPDF } from '../../utils/pdfExport';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../auth/roles';

const STATUS_OPTIONS = ['Available', 'On Trip', 'Off Duty', 'Suspended'];

const statusBadge = {
  Available: 'badge-success',
  'On Trip': 'badge-info',
  'Off Duty': 'badge-neutral',
  Suspended: 'badge-danger',
};

const emptyDriver = {
  name: '',
  licenseNumber: '',
  licenseCategory: '',
  licenseExpiryDate: '',
  contactNumber: '',
  safetyScore: 100,
  status: 'Available',
};

const Drivers = () => {
  const { user } = useAuth();
  const canManage = can(user?.role, 'manageDrivers');

  const [drivers, setDrivers] = useState([]);
  const [newDriver, setNewDriver] = useState(emptyDriver);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Bonus feature: search, filters, and sorting
  const { search, setSearch, result } = useTableControls(
    drivers.filter(d => !statusFilter || d.status === statusFilter),
    ['name', 'licenseNumber', 'licenseCategory']
  );

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await getDrivers();
      setDrivers(res.data);
    } catch (err) {
      console.error('Failed to fetch drivers', err);
    }
  };

  const isExpired = (licenseExpiryDate) => {
    if (!licenseExpiryDate) return false;
    return new Date(licenseExpiryDate) < new Date();
  };

  const handleRegisterDriver = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createDriver(newDriver);
      setNewDriver(emptyDriver);
      fetchDrivers();
    } catch (err) {
      // e.g. duplicate license number, validation errors from backend
      setError(err?.response?.data?.message || 'Failed to register driver.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateDriverStatus(id, status);
      fetchDrivers();
    } catch (err) {
      console.error('Failed to update driver status', err);
    }
  };

  const handleExportPDF = () => {
    exportTableToPDF({
      title: 'TransitOps — Driver Roster',
      filename: `driver-roster-${new Date().toISOString().slice(0, 10)}.pdf`,
      columns: [
        { header: 'Name', key: 'name' },
        { header: 'License No.', key: 'licenseNumber' },
        { header: 'Category', key: 'licenseCategory' },
        { header: 'Expiry', key: 'licenseExpiryDate', format: (d) => d.licenseExpiryDate ? new Date(d.licenseExpiryDate).toLocaleDateString() : '—' },
        { header: 'Status', key: 'status' },
      ],
      rows: result,
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-bold text-ink">Driver Management</h1>
        <span className="text-xs text-ink-faint">{drivers.length} registered</span>
      </div>

      {!canManage && (
        <div className="card px-4 py-2.5 mb-5 border-info/30 bg-info-soft">
          <p className="text-xs text-info">Viewing in read-only mode. Your role ({user?.role}) can't edit driver records.</p>
        </div>
      )}

      {/* Maintain driver profiles: Name, License Number, License Category,
          License Expiry Date, Contact Number, Safety Score, and Status. */}
      {canManage && (
        <form onSubmit={handleRegisterDriver} className="card p-4 mb-6">
          <p className="panel-header mb-3">Register driver</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <input type="text" placeholder="Name" required value={newDriver.name}
              onChange={e => setNewDriver({ ...newDriver, name: e.target.value })} className="field" />
            <input type="text" placeholder="License Number" required value={newDriver.licenseNumber}
              onChange={e => setNewDriver({ ...newDriver, licenseNumber: e.target.value })} className="field" />
            <input type="text" placeholder="License Category (e.g. LMV, HMV)" required value={newDriver.licenseCategory}
              onChange={e => setNewDriver({ ...newDriver, licenseCategory: e.target.value })} className="field" />
            <input type="date" required value={newDriver.licenseExpiryDate}
              onChange={e => setNewDriver({ ...newDriver, licenseExpiryDate: e.target.value })} className="field" title="License Expiry Date" />
            <input type="tel" placeholder="Contact Number" required value={newDriver.contactNumber}
              onChange={e => setNewDriver({ ...newDriver, contactNumber: e.target.value })} className="field" />
            <input type="number" min="0" max="100" placeholder="Safety Score" value={newDriver.safetyScore}
              onChange={e => setNewDriver({ ...newDriver, safetyScore: e.target.value })} className="field" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary mt-3">
            {loading ? 'Adding…' : 'Add Driver'}
          </button>
          {error && <p className="text-danger text-xs mt-3">{error}</p>}
        </form>
      )}

      {/* Bonus feature: search, filter, sort, and PDF export toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <SearchBox value={search} onChange={setSearch} placeholder="Search name, license…" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="field">
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={handleExportPDF} disabled={!result.length} className="btn-secondary">Export PDF</button>
      </div>

      {/* Driver List View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {result.length === 0 && (
          <p className="text-ink-faint text-sm col-span-full">No drivers match your search.</p>
        )}
        {result.map(d => {
          const expired = isExpired(d.licenseExpiryDate);
          return (
            <div key={d.id} className={`card p-4 border-l-2 ${expired ? '!border-l-danger' : '!border-l-accent'}`}>
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-ink">{d.name}</h3>
                <span className={`badge ${statusBadge[d.status] || 'badge-neutral'}`}>{d.status}</span>
              </div>
              <p className="text-sm text-ink-dim">License: {d.licenseNumber} ({d.licenseCategory})</p>
              <p className={`text-sm ${expired ? 'text-danger font-medium' : 'text-ink-dim'}`}>
                Expiry: {d.licenseExpiryDate ? new Date(d.licenseExpiryDate).toLocaleDateString() : '—'}
                {expired && ' (EXPIRED — cannot be dispatched)'}
              </p>
              <p className="text-sm text-ink-dim">Safety Score: {d.safetyScore ?? '—'}</p>
              {canManage ? (
                <select
                  value={d.status}
                  onChange={(e) => handleStatusChange(d.id, e.target.value)}
                  className="field w-full mt-3 text-sm"
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <p className="text-xs text-ink-faint mt-3">Status changes require Fleet Manager or Safety Officer access.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Drivers;
