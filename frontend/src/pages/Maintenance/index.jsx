import React, { useEffect, useState } from 'react';
import { getAssets } from '../../api/assets.api';
import { raiseMaintenanceRequest, updateMaintenanceStatus } from '../../api/maintenance.api';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../auth/roles';

const priorityBadge = {
  Low: 'badge-neutral',
  Medium: 'badge-info',
  High: 'badge-warn',
  Critical: 'badge-danger',
};

const statusBadge = {
  Pending: 'badge-warn',
  Approved: 'badge-info',
  Rejected: 'badge-danger',
  TechnicianAssigned: 'badge-violet',
  InProgress: 'badge-info',
  Resolved: 'badge-success',
};

const STATUS_OPTIONS = ['Pending', 'Approved', 'Rejected', 'TechnicianAssigned', 'InProgress', 'Resolved'];

const emptyForm = { assetId: '', description: '', priority: 'Medium' };

// Note: the backend has no GET /api/maintenance list endpoint. Requests
// shown below are derived from each asset's nested maintenance requests
// returned by GET /api/assets.
const Maintenance = () => {
  const { user } = useAuth();
  const canManageStatus = can(user?.role, 'manageMaintenanceStatus');

  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await getAssets();
      setAssets(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch assets', err);
    } finally {
      setLoading(false);
    }
  };

  const requests = assets.flatMap(a =>
    (a.maintenanceRequests || a.maintenanceReq || []).map(r => ({ ...r, asset: a }))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await raiseMaintenanceRequest({
        assetId: Number(form.assetId),
        description: form.description,
        priority: form.priority,
      });
      setForm(emptyForm);
      fetchAssets();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to raise maintenance request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateMaintenanceStatus(id, status);
      fetchAssets();
    } catch (err) {
      console.error('Failed to update maintenance status', err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold text-ink">Maintenance</h1>
          <p className="text-xs text-ink-faint mt-0.5">Raise issues and track repair status per asset</p>
        </div>
        <span className="text-xs text-ink-faint">{requests.length} requests</span>
      </div>

      <form onSubmit={handleSubmit} className="card p-4 mb-6">
        <p className="panel-header mb-3">Raise request</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select required value={form.assetId}
            onChange={e => setForm({ ...form, assetId: e.target.value })} className="field">
            <option value="">Select Asset</option>
            {assets.map(a => <option key={a.id} value={a.id}>{a.tag} — {a.name}</option>)}
          </select>
          <input type="text" placeholder="Describe the issue" required value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} className="field md:col-span-1" />
          <select value={form.priority}
            onChange={e => setForm({ ...form, priority: e.target.value })} className="field">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        <button type="submit" disabled={submitting} className="btn-primary mt-3">
          {submitting ? 'Submitting…' : 'Raise Request'}
        </button>
        {error && <p className="text-danger text-xs mt-3">{error}</p>}
      </form>

      <div className="table-shell">
        <table className="table-base">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Issue</th>
              <th>Priority</th>
              <th>Status</th>
              {canManageStatus && <th>Update Status</th>}
            </tr>
          </thead>
          <tbody>
            {!loading && requests.length === 0 && (
              <tr><td colSpan={canManageStatus ? 5 : 4} className="p-4 text-center text-ink-faint">No maintenance requests yet.</td></tr>
            )}
            {loading && (
              <tr><td colSpan={canManageStatus ? 5 : 4} className="p-4 text-center text-ink-faint">Loading…</td></tr>
            )}
            {requests.map(r => (
              <tr key={r.id}>
                <td className="font-mono text-ink">{r.asset.tag} <span className="text-ink-dim font-sans">— {r.asset.name}</span></td>
                <td>{r.issue || r.description}</td>
                <td><span className={`badge ${priorityBadge[r.priority] || 'badge-neutral'}`}>{r.priority}</span></td>
                <td><span className={`badge ${statusBadge[r.status] || 'badge-neutral'}`}>{r.status}</span></td>
                {canManageStatus && (
                  <td>
                    <select
                      defaultValue={r.status}
                      onChange={e => handleStatusChange(r.id, e.target.value)}
                      className="field !py-1 text-xs"
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Maintenance;
