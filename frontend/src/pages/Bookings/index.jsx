import React, { useEffect, useState } from 'react';
import { getBookings, createBooking } from '../../api/bookings.api';
import { getAssets } from '../../api/assets.api';
import { SearchBox, SortableTh } from '../../components/common';
import useTableControls from '../../hooks/useTableControls';

const statusBadge = {
  Upcoming: 'badge-info',
  Ongoing: 'badge-success',
  Completed: 'badge-neutral',
  Cancelled: 'badge-danger',
};

const emptyForm = { assetId: '', startTime: '', endTime: '' };

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const { search, setSearch, sortKey, sortDir, toggleSort, result } = useTableControls(
    bookings.map(b => ({ ...b, assetLabel: `${b.asset?.tag || ''} ${b.asset?.name || ''}`, userLabel: b.bookedBy?.name || b.user?.name || '' })),
    ['assetLabel', 'userLabel']
  );

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bookingsRes, assetsRes] = await Promise.all([getBookings(), getAssets()]);
      setBookings(bookingsRes.data?.data || bookingsRes.data || []);
      setAssets(assetsRes.data?.data || assetsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setLoading(false);
    }
  };

  // Only bookable, currently-available/reserved shared resources make sense to book.
  const bookableAssets = assets.filter(a => a.isBookable);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createBooking({
        assetId: Number(form.assetId),
        startTime: form.startTime,
        endTime: form.endTime,
      });
      setForm(emptyForm);
      fetchAll();
    } catch (err) {
      // Backend runs an overlap check and rejects conflicting time windows.
      setError(err?.response?.data?.message || 'Failed to create booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <div>
          <h1 className="text-lg font-bold text-ink">Bookings</h1>
          <p className="text-xs text-ink-faint mt-0.5">Reserve time on shared, bookable assets</p>
        </div>
        <span className="text-xs text-ink-faint">{bookings.length} bookings</span>
      </div>

      <form onSubmit={handleSubmit} className="card p-4 mb-6">
        <p className="panel-header mb-3">New booking</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select required value={form.assetId}
            onChange={e => setForm({ ...form, assetId: e.target.value })} className="field">
            <option value="">Select Bookable Asset</option>
            {bookableAssets.map(a => <option key={a.id} value={a.id}>{a.tag} — {a.name}</option>)}
          </select>
          <input type="datetime-local" required value={form.startTime}
            onChange={e => setForm({ ...form, startTime: e.target.value })} className="field" />
          <input type="datetime-local" required value={form.endTime}
            onChange={e => setForm({ ...form, endTime: e.target.value })} className="field" />
        </div>
        <button type="submit" disabled={submitting} className="btn-primary mt-3">
          {submitting ? 'Booking…' : 'Create Booking'}
        </button>
        {error && <p className="text-danger text-xs mt-3">{error}</p>}
      </form>

      <div className="flex items-center justify-between gap-3 mb-3">
        <SearchBox value={search} onChange={setSearch} placeholder="Search asset or booked by…" />
      </div>

      <div className="table-shell">
        <table className="table-base">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Booked By</th>
              <SortableTh label="Start" sortKeyName="startTime" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="End" sortKeyName="endTime" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {!loading && result.length === 0 && (
              <tr><td colSpan={5} className="p-4 text-center text-ink-faint">No bookings yet.</td></tr>
            )}
            {loading && (
              <tr><td colSpan={5} className="p-4 text-center text-ink-faint">Loading…</td></tr>
            )}
            {result.map(b => (
              <tr key={b.id}>
                <td className="font-mono text-ink">{b.asset?.tag} <span className="text-ink-dim font-sans">— {b.asset?.name}</span></td>
                <td>{b.bookedBy?.name || b.user?.name || '—'}</td>
                <td>{new Date(b.startTime).toLocaleString()}</td>
                <td>{new Date(b.endTime).toLocaleString()}</td>
                <td><span className={`badge ${statusBadge[b.status] || 'badge-neutral'}`}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Bookings;
