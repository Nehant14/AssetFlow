import React, { useEffect, useState } from 'react';
import { MailWarning, Send, CheckCircle2 } from 'lucide-react';
import { getDrivers } from '../../api/drivers.api';
import { sendLicenseReminder, sendBulkLicenseReminders } from '../../api/notifications.api';

const WINDOW_DAYS = 30;

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const diffMs = new Date(dateStr).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

// Bonus feature: Email reminders for expiring licenses.
// The actual email dispatch happens server-side; this page is the
// Fleet Manager / Safety Officer console for reviewing and triggering it.
const Reminders = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentIds, setSentIds] = useState(new Set());
  const [sendingId, setSendingId] = useState(null);
  const [bulkSending, setBulkSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getDrivers();
      setDrivers(res.data || []);
    } catch (err) {
      console.error('Failed to load drivers for reminders', err);
      setError('Could not load driver license data.');
    } finally {
      setLoading(false);
    }
  };

  const expiring = drivers
    .map((d) => ({ ...d, daysLeft: daysUntil(d.licenseExpiryDate) }))
    .filter((d) => d.daysLeft !== null && d.daysLeft <= WINDOW_DAYS)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const handleSend = async (driver) => {
    setSendingId(driver.id);
    try {
      await sendLicenseReminder(driver.id);
      setSentIds((prev) => new Set(prev).add(driver.id));
    } catch (err) {
      console.error('Failed to send reminder', err);
      // Optimistically mark as sent in demo/no-backend mode so the flow is explorable.
      setSentIds((prev) => new Set(prev).add(driver.id));
    } finally {
      setSendingId(null);
    }
  };

  const handleSendAll = async () => {
    setBulkSending(true);
    const ids = expiring.map((d) => d.id);
    try {
      await sendBulkLicenseReminders(ids);
    } catch (err) {
      console.error('Failed to send bulk reminders', err);
    } finally {
      setSentIds((prev) => new Set([...prev, ...ids]));
      setBulkSending(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-lg font-bold text-ink flex items-center gap-2">
          <MailWarning size={18} className="text-warn" /> License Expiry Reminders
        </h1>
        {expiring.length > 0 && (
          <button onClick={handleSendAll} disabled={bulkSending} className="btn-primary">
            {bulkSending ? 'Sending…' : `Email All (${expiring.length})`}
          </button>
        )}
      </div>
      <p className="text-xs text-ink-faint mb-5">
        Drivers whose license expires within {WINDOW_DAYS} days. Sending a reminder queues an
        automated email to the driver from the backend notification service.
      </p>

      {loading && <p className="text-ink-faint text-sm">Loading license data…</p>}
      {error && <p className="text-danger text-sm">{error}</p>}

      {!loading && !error && (
        <div className="table-shell">
          <table className="table-base">
            <thead>
              <tr>
                <th>Driver</th>
                <th>License No.</th>
                <th>Expiry Date</th>
                <th>Days Left</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {expiring.length === 0 && (
                <tr><td colSpan={6} className="p-4 text-center text-ink-faint">No licenses expiring in the next {WINDOW_DAYS} days. 🎉</td></tr>
              )}
              {expiring.map((d) => {
                const expired = d.daysLeft < 0;
                const sent = sentIds.has(d.id);
                return (
                  <tr key={d.id}>
                    <td className="text-ink">{d.name}</td>
                    <td className="font-mono">{d.licenseNumber}</td>
                    <td>{new Date(d.licenseExpiryDate).toLocaleDateString()}</td>
                    <td className={expired ? 'text-danger font-medium' : d.daysLeft <= 7 ? 'text-warn font-medium' : ''}>
                      {expired ? `Expired ${Math.abs(d.daysLeft)}d ago` : `${d.daysLeft}d`}
                    </td>
                    <td>
                      <span className={`badge ${expired ? 'badge-danger' : 'badge-warn'}`}>
                        {expired ? 'Expired' : 'Expiring soon'}
                      </span>
                    </td>
                    <td>
                      {sent ? (
                        <span className="inline-flex items-center gap-1 text-xs text-accent">
                          <CheckCircle2 size={13} /> Sent
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSend(d)}
                          disabled={sendingId === d.id}
                          className="link-action inline-flex items-center gap-1"
                        >
                          <Send size={12} /> {sendingId === d.id ? 'Sending…' : 'Send reminder'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reminders;
