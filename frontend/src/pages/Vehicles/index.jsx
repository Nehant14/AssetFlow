import React, { useState, useEffect } from 'react';
import { getVehicles, createVehicle, updateVehicleStatus } from '../../api/vehicles.api';

const statusColor = {
  Available: 'bg-green-100 text-green-800',
  'On Trip': 'bg-blue-100 text-blue-800',
  'In Shop': 'bg-yellow-100 text-yellow-800',
  Retired: 'bg-gray-200 text-gray-600',
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-slate-800">Vehicle Registry</h1>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="bg-white p-4 shadow rounded mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        <input type="text" placeholder="Registration Number (Unique)" required value={newVehicle.registrationNumber}
          onChange={e => setNewVehicle({ ...newVehicle, registrationNumber: e.target.value })} className="border p-2 rounded" />
        <input type="text" placeholder="Vehicle Name/Model" required value={newVehicle.name}
          onChange={e => setNewVehicle({ ...newVehicle, name: e.target.value })} className="border p-2 rounded" />
        <input type="text" placeholder="Vehicle Type" required value={newVehicle.type}
          onChange={e => setNewVehicle({ ...newVehicle, type: e.target.value })} className="border p-2 rounded" />
        <input type="number" placeholder="Max Load Capacity (kg)" required value={newVehicle.maxLoadCapacity}
          onChange={e => setNewVehicle({ ...newVehicle, maxLoadCapacity: e.target.value })} className="border p-2 rounded" />
        <input type="number" placeholder="Odometer" required value={newVehicle.odometer}
          onChange={e => setNewVehicle({ ...newVehicle, odometer: e.target.value })} className="border p-2 rounded" />
        <input type="number" placeholder="Acquisition Cost" required value={newVehicle.acquisitionCost}
          onChange={e => setNewVehicle({ ...newVehicle, acquisitionCost: e.target.value })} className="border p-2 rounded" />
        <button type="submit" disabled={submitting} className="bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50 md:col-span-3">
          {submitting ? 'Registering...' : 'Register Vehicle'}
        </button>
        {error && <p className="text-red-600 text-sm md:col-span-3">{error}</p>}
      </form>

      {/* Master List of Vehicles */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3">Reg No</th>
              <th className="p-3">Model</th>
              <th className="p-3">Type</th>
              <th className="p-3">Capacity</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">No vehicles registered yet.</td></tr>
            )}
            {vehicles.map(v => (
              <tr key={v.id} className="border-b">
                <td className="p-3">{v.registrationNumber}</td>
                <td className="p-3">{v.name}</td>
                <td className="p-3">{v.type}</td>
                <td className="p-3">{v.maxLoadCapacity} kg</td>
                <td className="p-3">
                  <span className={`badge ${statusColor[v.status] || 'bg-gray-100 text-gray-700'}`}>
                    {v.status}
                  </span>
                </td>
                <td className="p-3">
                  {v.status !== 'Retired' && v.status !== 'On Trip' && (
                    <button onClick={() => handleRetire(v.id)} className="text-red-600 text-sm hover:underline">
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
