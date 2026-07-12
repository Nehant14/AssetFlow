import React, { useEffect, useState } from 'react';
import { getAssets } from '../../api/assets.api';
import { getEmployees, getDepartments } from '../../api/organization.api';
import { createAllocation, returnAllocation } from '../../api/allocations.api';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../auth/roles';

const emptyForm = {
  assetId: '',
  targetType: 'employee', // 'employee' | 'department'
  userId: '',
  departmentId: '',
  expectedReturnDate: '',
};

// Note: the backend has no GET /api/allocations list endpoint. Active
// allocations shown below are derived from each asset's nested
// `allocations` array returned by GET /api/assets.
const Allocations = () => {
  const { user } = useAuth();
  const canManage = can(user?.role, 'manageAllocations');

  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [returnNotes, setReturnNotes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [assetsRes, empRes, deptRes] = await Promise.all([
        getAssets(),
        getEmployees(),
        getDepartments(),
      ]);
      setAssets(assetsRes.data?.data || assetsRes.data || []);
      setEmployees(empRes.data?.data || empRes.data || []);
      setDepartments(deptRes.data?.data || deptRes.data || []);
    } catch (err) {
      console.error('Failed to fetch allocation data', err);
    } finally {
      setLoading(false);
    }
  };

  const availableAssets = assets.filter(a => a.status === 'Available');
  const activeAllocations = assets.flatMap(a =>
    (a.allocations || []).filter(al => al.status === 'Active').map(al => ({ ...al, asset: a }))
  );

  const employeeName = (id) => employees.find(e => e.id === id)?.name || `#${id}`;
  const departmentName = (id) => departments.find(d => d.id === id)?.name || `#${id}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createAllocation({
        assetId: Number(form.assetId),
        userId: form.targetType === 'employee' ? Number(form.userId) : undefined,
        departmentId: form.targetType === 'department' ? Number(form.departmentId) : undefined,
        expectedReturnDate: form.expectedReturnDate,
      });
      setForm(emptyForm);
      fetchAll();
    } catch (err) {
      // Backend rejects double-allocation with a descriptive error naming the current holder.
      setError(err?.response?.data?.message || 'Failed to create allocation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async (allocationId) => {
    try {
      await returnAllocation(allocationId, returnNotes[allocationId] || '');
      setReturnNotes(prev => ({ ...prev, [allocationId]: '' }));
      fetchAll();
    } catch (err) {
      console.error('Failed to return asset', err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold text-ink">Allocations</h1>
          <p className="text-xs text-ink-faint mt-0.5">Assign assets to employees or departments, and process returns</p>
        </div>
        <span className="text-xs text-ink-faint">{activeAllocations.length} active</span>
      </div>

      {canManage && (
        <form onSubmit={handleSubmit} className="card p-4 mb-6">
          <p className="panel-header mb-3">New allocation</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select required value={form.assetId}
              onChange={e => setForm({ ...form, assetId: e.target.value })} className="field">
              <option value="">Select Available Asset</option>
              {availableAssets.map(a => <option key={a.id} value={a.id}>{a.tag} — {a.name}</option>)}
            </select>
            <select value={form.targetType}
              onChange={e => setForm({ ...form, targetType: e.target.value })} className="field">
              <option value="employee">Allocate to Employee</option>
              <option value="department">Allocate to Department</option>
            </select>
            {form.targetType === 'employee' ? (
              <select required value={form.userId}
                onChange={e => setForm({ ...form, userId: e.target.value })} className="field">
                <option value="">Select Employee</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            ) : (
              <select required value={form.departmentId}
                onChange={e => setForm({ ...form, departmentId: e.target.value })} className="field">
                <option value="">Select Department</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            )}
            <input type="date" required placeholder="Expected Return Date" value={form.expectedReturnDate}
              onChange={e => setForm({ ...form, expectedReturnDate: e.target.value })} className="field" />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary mt-3">
            {submitting ? 'Allocating…' : 'Create Allocation'}
          </button>
          {error && <p className="text-danger text-xs mt-3">{error}</p>}
        </form>
      )}

      <div className="table-shell">
        <table className="table-base">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Held By</th>
              <th>Allocated At</th>
              <th>Expected Return</th>
              <th>Status</th>
              {canManage && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {!loading && activeAllocations.length === 0 && (
              <tr><td colSpan={canManage ? 6 : 5} className="p-4 text-center text-ink-faint">No active allocations.</td></tr>
            )}
            {loading && (
              <tr><td colSpan={canManage ? 6 : 5} className="p-4 text-center text-ink-faint">Loading…</td></tr>
            )}
            {activeAllocations.map(al => (
              <tr key={al.id}>
                <td className="font-mono text-ink">{al.asset.tag} <span className="text-ink-dim font-sans">— {al.asset.name}</span></td>
                <td>{al.employeeId ? employeeName(al.employeeId) : al.departmentId ? `Dept: ${departmentName(al.departmentId)}` : '—'}</td>
                <td>{al.allocatedAt ? new Date(al.allocatedAt).toLocaleDateString() : '—'}</td>
                <td>{al.expectedReturnDate ? new Date(al.expectedReturnDate).toLocaleDateString() : '—'}</td>
                <td><span className="badge badge-info">{al.status}</span></td>
                {canManage && (
                  <td>
                    <div className="flex items-center gap-2">
                      <input
                        type="text" placeholder="Return notes (optional)"
                        value={returnNotes[al.id] || ''}
                        onChange={e => setReturnNotes(prev => ({ ...prev, [al.id]: e.target.value }))}
                        className="field !py-1 text-xs w-32"
                      />
                      <button onClick={() => handleReturn(al.id)} className="link-action">Return</button>
                    </div>
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

export default Allocations;
