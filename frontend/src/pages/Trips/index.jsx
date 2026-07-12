import React, { useState, useEffect } from 'react';
import { getVehicles } from '../../api/vehicles.api';
import { getDrivers } from '../../api/drivers.api';
import { getBookings, createBooking, cancelBooking, completeBooking } from '../../api/trips.api';

const statusColor = {
  Draft: 'bg-gray-200 text-gray-700',
  Dispatched: 'bg-blue-100 text-blue-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const emptyForm = {
  source: '',
  destination: '',
  vehicleId: '',
  driverId: '',
  cargoWeight: '',
  plannedDistance: '',
};

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');
  const [completingTrip, setCompletingTrip] = useState(null);
  const [completionData, setCompletionData] = useState({ finalOdometer: '', fuelConsumed: '' });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      // Retired or In Shop vehicles must never appear in the dispatch selection.
      const vRes = await getVehicles('Available');
      setVehicles(vRes.data);

      // Drivers with expired licenses or Suspended status cannot be assigned to trips.
      const dRes = await getDrivers('Available');
      setDrivers(dRes.data);

      const tRes = await getBookings();
      setTrips(tRes.data);
    } catch (err) {
      console.error('Failed to load trip data', err);
    }
  };

  const handleDispatch = async (e) => {
    e.preventDefault();
    setError('');

    const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
    const selectedDriver = drivers.find(d => d.id === formData.driverId);

    if (!selectedVehicle || !selectedDriver) {
      setError('Please select a valid vehicle and driver.');
      return;
    }

    // Cargo Weight must not exceed the vehicle's maximum load capacity.
    if (Number(formData.cargoWeight) > Number(selectedVehicle.maxLoadCapacity)) {
      setError(`Cargo weight exceeds vehicle limit of ${selectedVehicle.maxLoadCapacity} kg!`);
      return;
    }

    // Drivers with expired licenses cannot be assigned (double-checked client-side;
    // the backend must be the source of truth for this rule).
    if (selectedDriver.licenseExpiryDate && new Date(selectedDriver.licenseExpiryDate) < new Date()) {
      setError('Selected driver has an expired license and cannot be dispatched.');
      return;
    }

    try {
      // Create trip: Draft -> Dispatched.
      // Dispatching a trip automatically changes both the vehicle and driver
      // status to On Trip (handled server-side).
      await createBooking({ ...formData, status: 'Dispatched' });
      setFormData(emptyForm);
      loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to dispatch trip.');
    }
  };

  const handleCancel = async (id) => {
    try {
      // Cancelling a dispatched trip restores the vehicle and driver to Available.
      await cancelBooking(id);
      loadAll();
    } catch (err) {
      console.error('Failed to cancel trip', err);
    }
  };

  const openCompleteModal = (trip) => {
    setCompletingTrip(trip);
    setCompletionData({ finalOdometer: '', fuelConsumed: '' });
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    try {
      // Completing a trip automatically changes both the vehicle and driver
      // status back to Available (handled server-side).
      await completeBooking(completingTrip.id, completionData);
      setCompletingTrip(null);
      loadAll();
    } catch (err) {
      console.error('Failed to complete trip', err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-slate-800">Trip Management</h1>

      <h2 className="text-lg font-semibold mb-2">Create & Dispatch Trip</h2>
      <form onSubmit={handleDispatch} className="bg-white p-4 rounded shadow-sm max-w-2xl mb-8 grid grid-cols-2 gap-3">
        <input type="text" placeholder="Source" required value={formData.source}
          onChange={(e) => setFormData({ ...formData, source: e.target.value })} className="border p-2 rounded" />
        <input type="text" placeholder="Destination" required value={formData.destination}
          onChange={(e) => setFormData({ ...formData, destination: e.target.value })} className="border p-2 rounded" />
        <input type="number" placeholder="Cargo Weight (kg)" required value={formData.cargoWeight}
          onChange={(e) => setFormData({ ...formData, cargoWeight: e.target.value })} className="border p-2 rounded" />
        <input type="number" placeholder="Planned Distance (km)" required value={formData.plannedDistance}
          onChange={(e) => setFormData({ ...formData, plannedDistance: e.target.value })} className="border p-2 rounded" />

        <select required value={formData.vehicleId} onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })} className="border p-2 rounded">
          <option value="">Select Available Vehicle</option>
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>{v.registrationNumber} (Max: {v.maxLoadCapacity}kg)</option>
          ))}
        </select>

        <select required value={formData.driverId} onChange={(e) => setFormData({ ...formData, driverId: e.target.value })} className="border p-2 rounded">
          <option value="">Select Available Driver</option>
          {drivers.map(d => (
            <option key={d.id} value={d.id}>{d.name} (License: {d.licenseNumber})</option>
          ))}
        </select>

        {error && <p className="text-red-600 text-sm col-span-2">{error}</p>}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 col-span-2">
          Dispatch Trip
        </button>
      </form>

      <h2 className="text-lg font-semibold mb-2">All Trips</h2>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3">Route</th>
              <th className="p-3">Vehicle</th>
              <th className="p-3">Driver</th>
              <th className="p-3">Cargo</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">No trips created yet.</td></tr>
            )}
            {trips.map(t => (
              <tr key={t.id} className="border-b">
                <td className="p-3">{t.source} → {t.destination}</td>
                <td className="p-3">{t.vehicleRegistrationNumber || t.vehicleId}</td>
                <td className="p-3">{t.driverName || t.driverId}</td>
                <td className="p-3">{t.cargoWeight} kg</td>
                <td className="p-3"><span className={`badge ${statusColor[t.status] || 'bg-gray-100'}`}>{t.status}</span></td>
                <td className="p-3 space-x-2">
                  {t.status === 'Dispatched' && (
                    <>
                      <button onClick={() => openCompleteModal(t)} className="text-green-700 text-sm hover:underline">Complete</button>
                      <button onClick={() => handleCancel(t.id)} className="text-red-600 text-sm hover:underline">Cancel</button>
                    </>
                  )}
                  {t.status !== 'Dispatched' && <span className="text-gray-400 text-sm">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {completingTrip && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm">
            <h3 className="font-semibold text-lg mb-4">Complete Trip: {completingTrip.source} → {completingTrip.destination}</h3>
            <form onSubmit={handleComplete} className="flex flex-col gap-3">
              <input type="number" placeholder="Final Odometer Reading" required
                value={completionData.finalOdometer}
                onChange={e => setCompletionData({ ...completionData, finalOdometer: e.target.value })}
                className="border p-2 rounded" />
              <input type="number" placeholder="Fuel Consumed (liters)" required
                value={completionData.fuelConsumed}
                onChange={e => setCompletionData({ ...completionData, fuelConsumed: e.target.value })}
                className="border p-2 rounded" />
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setCompletingTrip(null)} className="px-4 py-2 rounded border">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">Mark Completed</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trips;
