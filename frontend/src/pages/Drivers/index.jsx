import React, { useState, useEffect } from 'react';
import { getDrivers, createDriver, updateDriverStatus } from '../../api/drivers.api';

const STATUS_OPTIONS = ['Available', 'On Trip', 'Off Duty', 'Suspended'];

const statusColor = {
  Available: 'bg-green-100 text-green-800',
  'On Trip': 'bg-blue-100 text-blue-800',
  'Off Duty': 'bg-gray-200 text-gray-700',
  Suspended: 'bg-red-100 text-red-800',
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-slate-800">Driver Management</h1>

      {/* Maintain driver profiles: Name, License Number, License Category,
          License Expiry Date, Contact Number, Safety Score, and Status. */}
      <form onSubmit={handleRegisterDriver} className="bg-white p-4 shadow rounded mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        <input type="text" placeholder="Name" required value={newDriver.name}
          onChange={e => setNewDriver({ ...newDriver, name: e.target.value })} className="border p-2 rounded" />
        <input type="text" placeholder="License Number" required value={newDriver.licenseNumber}
          onChange={e => setNewDriver({ ...newDriver, licenseNumber: e.target.value })} className="border p-2 rounded" />
        <input type="text" placeholder="License Category (e.g. LMV, HMV)" required value={newDriver.licenseCategory}
          onChange={e => setNewDriver({ ...newDriver, licenseCategory: e.target.value })} className="border p-2 rounded" />
        <input type="date" required value={newDriver.licenseExpiryDate}
          onChange={e => setNewDriver({ ...newDriver, licenseExpiryDate: e.target.value })} className="border p-2 rounded" title="License Expiry Date" />
        <input type="tel" placeholder="Contact Number" required value={newDriver.contactNumber}
          onChange={e => setNewDriver({ ...newDriver, contactNumber: e.target.value })} className="border p-2 rounded" />
        <input type="number" min="0" max="100" placeholder="Safety Score" value={newDriver.safetyScore}
          onChange={e => setNewDriver({ ...newDriver, safetyScore: e.target.value })} className="border p-2 rounded" />
        <button type="submit" disabled={loading} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50 md:col-span-3">
          {loading ? 'Adding...' : 'Add Driver'}
        </button>
        {error && <p className="text-red-600 text-sm md:col-span-3">{error}</p>}
      </form>

      {/* Driver List View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {drivers.length === 0 && (
          <p className="text-gray-500 col-span-full">No drivers registered yet.</p>
        )}
        {drivers.map(d => {
          const expired = isExpired(d.licenseExpiryDate);
          return (
            <div key={d.id} className={`bg-white p-4 rounded shadow border-l-4 ${expired ? 'border-red-500' : 'border-blue-500'}`}>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg">{d.name}</h3>
                <span className={`badge ${statusColor[d.status] || 'bg-gray-100 text-gray-700'}`}>{d.status}</span>
              </div>
              <p className="text-sm text-gray-600">License: {d.licenseNumber} ({d.licenseCategory})</p>
              <p className={`text-sm ${expired ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                Expiry: {d.licenseExpiryDate ? new Date(d.licenseExpiryDate).toLocaleDateString() : '—'}
                {expired && ' (EXPIRED — cannot be dispatched)'}
              </p>
              <p className="text-sm text-gray-600">Safety Score: {d.safetyScore ?? '—'}</p>
              <select
                value={d.status}
                onChange={(e) => handleStatusChange(d.id, e.target.value)}
                className="mt-2 border rounded p-1 text-sm w-full"
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
