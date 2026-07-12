import React, { useEffect, useState } from 'react';
import { getAssets } from '../../api/assets.api';
import { getEmployees } from '../../api/organization.api';
import { createAuditCycle, recordVerification, closeAuditCycle } from '../../api/audits.api';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../auth/roles';

const emptyCycleForm = { name: '', startDate: '', endDate: '', auditorIds: [] };
const emptyVerifyForm = { auditCycleId: '', assetId: '', status: 'Verified', notes: '' };

// Note: the backend exposes no GET endpoint to list audit cycles or past
// verifications — only create-cycle, verify, and close-cycle. This page is
// therefore action-driven; a running log of actions taken in this session
// is shown below so the results of each call are visible.
const Audits = () => {
  const { user } = useAuth();
  const canManageAudits = can(user?.role, 'manageAudits');
  const canVerify = can(user?.role, 'recordAuditVerification');

  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [cycleForm, setCycleForm] = useState(emptyCycleForm);
  const [verifyForm, setVerifyForm] = useState(emptyVerifyForm);
  const [closeCycleId, setCloseCycleId] = useState('');
  const [log, setLog] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [assetsRes, empRes] = await Promise.all([getAssets(), getEmployees()]);
      setAssets(assetsRes.data?.data || assetsRes.data || []);
      setEmployees(empRes.data?.data || empRes.data || []);
    } catch (err) {
      console.error('Failed to fetch audit reference data', err);
    }
  };

  const pushLog = (action, detail) => {
    setLog(prev => [{ action, detail, at: new Date().toLocaleTimeString() }, ...prev]);
  };

  const handleCreateCycle = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await createAuditCycle(cycleForm);
      pushLog('Cycle created', JSON.stringify(res.data?.data || res.data));
      setCycleForm(emptyCycleForm);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create audit cycle.');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await recordVerification({
        auditCycleId: Number(verifyForm.auditCycleId),
        assetId: Number(verifyForm.assetId),
        status: verifyForm.status,
        notes: verifyForm.notes,
      });
      pushLog('Verification recorded', JSON.stringify(res.data?.data || res.data));
      setVerifyForm(emptyVerifyForm);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to record verification.');
    }
  };

  const handleCloseCycle = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await closeAuditCycle(closeCycleId);
      pushLog('Cycle closed & reconciled', `Cycle #${closeCycleId}`);
      setCloseCycleId('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to close audit cycle.');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-lg font-bold text-ink">Audits</h1>
        <p className="text-xs text-ink-faint mt-0.5">Run physical verification cycles against the asset registry</p>
      </div>

      {error && (
        <p className="text-danger text-xs bg-danger-soft border border-danger/30 rounded-md px-3 py-2 mb-5">{error}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {canManageAudits && (
          <form onSubmit={handleCreateCycle} className="card p-4">
            <p className="panel-header mb-3">Create audit cycle</p>
            <div className="space-y-3">
              <input type="text" placeholder="Cycle Name" required value={cycleForm.name}
                onChange={e => setCycleForm({ ...cycleForm, name: e.target.value })} className="field w-full" />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" required value={cycleForm.startDate}
                  onChange={e => setCycleForm({ ...cycleForm, startDate: e.target.value })} className="field" />
                <input type="date" required value={cycleForm.endDate}
                  onChange={e => setCycleForm({ ...cycleForm, endDate: e.target.value })} className="field" />
              </div>
              <select multiple value={cycleForm.auditorIds}
                onChange={e => setCycleForm({ ...cycleForm, auditorIds: Array.from(e.target.selectedOptions, o => Number(o.value)) })}
                className="field w-full h-24">
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
              </select>
              <p className="text-[11px] text-ink-faint">Ctrl/Cmd-click to select multiple auditors</p>
            </div>
            <button type="submit" className="btn-primary mt-3">Create Cycle</button>
          </form>
        )}

        {canVerify && (
          <form onSubmit={handleVerify} className="card p-4">
            <p className="panel-header mb-3">Record verification</p>
            <div className="space-y-3">
              <input type="number" placeholder="Audit Cycle ID" required value={verifyForm.auditCycleId}
                onChange={e => setVerifyForm({ ...verifyForm, auditCycleId: e.target.value })} className="field w-full" />
              <select required value={verifyForm.assetId}
                onChange={e => setVerifyForm({ ...verifyForm, assetId: e.target.value })} className="field w-full">
                <option value="">Select Asset</option>
                {assets.map(a => <option key={a.id} value={a.id}>{a.tag} — {a.name}</option>)}
              </select>
              <select value={verifyForm.status}
                onChange={e => setVerifyForm({ ...verifyForm, status: e.target.value })} className="field w-full">
                <option value="Verified">Verified</option>
                <option value="Missing">Missing</option>
                <option value="Damaged">Damaged</option>
              </select>
              <input type="text" placeholder="Notes (optional)" value={verifyForm.notes}
                onChange={e => setVerifyForm({ ...verifyForm, notes: e.target.value })} className="field w-full" />
            </div>
            <button type="submit" className="btn-primary mt-3">Submit Verification</button>
          </form>
        )}
      </div>

      {canManageAudits && (
        <form onSubmit={handleCloseCycle} className="card p-4 mb-6 flex items-end gap-3">
          <div className="flex-1">
            <label className="field-label">Close & reconcile cycle</label>
            <input type="number" placeholder="Audit Cycle ID" required value={closeCycleId}
              onChange={e => setCloseCycleId(e.target.value)} className="field w-full" />
          </div>
          <button type="submit" className="btn-danger">Close Cycle</button>
        </form>
      )}

      <div className="card p-4">
        <p className="panel-header mb-3">Session activity log</p>
        {log.length === 0 ? (
          <p className="text-ink-faint text-sm">No audit actions taken yet this session.</p>
        ) : (
          <ul className="space-y-2 text-xs text-ink-dim">
            {log.map((entry, i) => (
              <li key={i} className="border-b border-line pb-2 last:border-b-0">
                <span className="text-ink font-medium">{entry.action}</span>{' '}
                <span className="text-ink-faint">· {entry.at}</span>
                <div className="font-mono text-[11px] text-ink-faint truncate">{entry.detail}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Audits;
