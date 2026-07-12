import React, { useState, useEffect } from 'react';
import { getVehicles } from '../../api/vehicles.api';
import { getDrivers } from '../../api/drivers.api';
import { getBookings, createBooking, cancelBooking, completeBooking } from '../../api/trips.api';
import { SearchBox, SortableTh } from '../../components/common';
import useTableControls from '../../hooks/useTableControls';
import { exportTableToPDF } from '../../utils/pdfExport';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../auth/roles';

const statusBadge = {
  Draft: 'badge-neutral',
  Dispatched: 'badge-info',
  Completed: 'badge-success',
  Cancelled: 'badge-danger',
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
  const { user } = useAuth();
  const canDispatch = can(user?.role, 'dispatchTrips');

  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');
  const [completingTrip, setCompletingTrip] = useState(null);
  const [completionData, setCompletionData] = useState({ finalOdometer: '', fuelConsumed: '' });
  const [statusFilter, setStatusFilter] = useState('');

  // Bonus feature: search, filters, and sorting
  const { search, setSearch, sortKey, sortDir, toggleSort, result } = useTableControls(
    trips.filter(t => !statusFilter || t.status === statusFilter),
    ['source', 'destination', 'vehicleRegistrationNumber', 'driverName']
  );

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

  const handleExportPDF = () => {
    exportTableToPDF({
      title: 'TransitOps — Trip Log',
      filename: `trip-log-${new Date().toISOString().slice(0, 10)}.pdf`,
      columns: [
        { header: 'Route', key: 'route', format: (t) => `${t.source} -> ${t.destination}` },
        { header: 'Vehicle', key: 'vehicleRegistrationNumber' },
        { header: 'Driver', key: 'driverName' },
        { header: 'Cargo (kg)', key: 'cargoWeight' },
        { header: 'Status', key: 'status' },
      ],
      rows: result,
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-lg font-bold text-ink mb-5">Trip Management</h1>

      {canDispatch ? (
        <div className="card p-4 max-w-2xl mb-8">
          <p className="panel-header mb-3">Create &amp; dispatch trip</p>
          <form onSubmit={handleDispatch} className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Source" required value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })} className="field" />
            <input type="text" placeholder="Destination" required value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })} className="field" />
            <input type="number" placeholder="Cargo Weight (kg)" required value={formData.cargoWeight}
              onChange={(e) => setFormData({ ...formData, cargoWeight: e.target.value })} className="field" />
            <input type="number" placeholder="Planned Distance (km)" required value={formData.plannedDistance}
              onChange={(e) => setFormData({ ...formData, plannedDistance: e.target.value })} className="field" />

            <select required value={formData.vehicleId} onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })} className="field">
              <option value="">Select Available Vehicle</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.registrationNumber} (Max: {v.maxLoadCapacity}kg)</option>
              ))}
            </select>

            <select required value={formData.driverId} onChange={(e) => setFormData({ ...formData, driverId: e.target.value })} className="field">
              <option value="">Select Available Driver</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name} (License: {d.licenseNumber})</option>
              ))}
            </select>

            {error && <p className="text-danger text-xs col-span-2">{error}</p>}
            <button type="submit" className="btn-primary col-span-2">
              Dispatch Trip
            </button>
          </form>
        </div>
      ) : (
        <div className="card px-4 py-2.5 mb-6 border-info/30 bg-info-soft">
          <p className="text-xs text-info">Your role ({user?.role}) can view trips but can't dispatch new ones. Contact a Fleet Manager to request dispatch.</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <p className="panel-header">All trips</p>
        <div className="flex items-center gap-3">
          <SearchBox value={search} onChange={setSearch} placeholder="Search route, vehicle, driver…" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="field">
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button onClick={handleExportPDF} disabled={!result.length} className="btn-secondary">Export PDF</button>
        </div>
      </div>
      <div className="table-shell">
        <table className="table-base">
          <thead>
            <tr>
              <SortableTh label="Route" sortKeyName="source" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Vehicle" sortKeyName="vehicleRegistrationNumber" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Driver" sortKeyName="driverName" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Cargo" sortKeyName="cargoWeight" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Status" sortKeyName="status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {result.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-ink-faint">No trips match your search.</td></tr>
            )}
            {result.map(t => (
              <tr key={t.id}>
                <td className="text-ink">{t.source} → {t.destination}</td>
                <td className="font-mono">{t.vehicleRegistrationNumber || t.vehicleId}</td>
                <td>{t.driverName || t.driverId}</td>
                <td>{t.cargoWeight} kg</td>
                <td><span className={`badge ${statusBadge[t.status] || 'badge-neutral'}`}>{t.status}</span></td>
                <td className="space-x-3">
                  {canDispatch && t.status === 'Dispatched' && (
                    <>
                      <button onClick={() => openCompleteModal(t)} className="link-action">Complete</button>
                      <button onClick={() => handleCancel(t.id)} className="link-action !text-danger">Cancel</button>
                    </>
                  )}
                  {(!canDispatch || t.status !== 'Dispatched') && <span className="text-ink-faint text-sm">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {completingTrip && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-sm">
            <h3 className="font-semibold text-ink mb-4">Complete Trip: {completingTrip.source} → {completingTrip.destination}</h3>
            <form onSubmit={handleComplete} className="flex flex-col gap-3">
              <input type="number" placeholder="Final Odometer Reading" required
                value={completionData.finalOdometer}
                onChange={e => setCompletionData({ ...completionData, finalOdometer: e.target.value })}
                className="field" />
              <input type="number" placeholder="Fuel Consumed (liters)" required
                value={completionData.fuelConsumed}
                onChange={e => setCompletionData({ ...completionData, fuelConsumed: e.target.value })}
                className="field" />
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setCompletingTrip(null)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Mark Completed</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trips;
