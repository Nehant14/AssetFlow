import React, { useState, useEffect } from 'react';
import { getDrivers, createDriver, updateDriverStatus } from '../../api/drivers.api';

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
  const [drivers, setDrivers] = useState([]);
  const [newDriver, setNewDriver] = useState(emptyDriver);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-bold text-ink">Driver Management</h1>
        <span className="text-xs text-ink-faint">{drivers.length} registered</span>
      </div>

      {/* Maintain driver profiles: Name, License Number, License Category,
          License Expiry Date, Contact Number, Safety Score, and Status. */}
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

      {/* Driver List View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {drivers.length === 0 && (
          <p className="text-ink-faint text-sm col-span-full">No drivers registered yet.</p>
        )}
        {drivers.map(d => {
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
              <select
                value={d.status}
                onChange={(e) => handleStatusChange(d.id, e.target.value)}
                className="field w-full mt-3 text-sm"
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Drivers;
