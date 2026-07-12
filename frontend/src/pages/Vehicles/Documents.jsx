import React, { useEffect, useState } from 'react';
import { FileText, Upload, Trash2 } from 'lucide-react';
import {
  getVehicles,
  getVehicleDocuments,
  uploadVehicleDocument,
  deleteVehicleDocument,
} from '../../api/vehicles.api';

const DOC_TYPES = ['Registration Certificate', 'Insurance', 'Permit', 'PUC (Emissions)', 'Fitness Certificate'];

const emptyForm = { vehicleId: '', type: DOC_TYPES[0], documentNumber: '', expiryDate: '', file: null };

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const diffMs = new Date(dateStr).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

// Bonus feature: Vehicle document management (registration, insurance,
// permit, PUC, fitness certs) with expiry tracking.
const VehicleDocuments = () => {
  const [vehicles, setVehicles] = useState([]);
  const [docs, setDocs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const [vRes, dRes] = await Promise.all([getVehicles(), getVehicleDocuments()]);
      setVehicles(vRes.data || []);
      setDocs(dRes.data || []);
    } catch (err) {
      console.error('Failed to load vehicle documents', err);
    }
  };

  const regNo = (id) => vehicles.find((v) => v.id === id)?.registrationNumber || id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vehicleId) {
      setError('Select a vehicle first.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await uploadVehicleDocument(form.vehicleId, form);
      setForm(emptyForm);
      load();
    } catch (err) {
      console.error('Failed to upload document', err);
      setError(err?.response?.data?.message || 'Failed to save document.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm('Remove this document record?')) return;
    try {
      await deleteVehicleDocument(doc.vehicleId, doc.id);
      load();
    } catch (err) {
      console.error('Failed to delete document', err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-bold text-ink flex items-center gap-2">
          <FileText size={18} /> Vehicle Document Management
        </h1>
        <span className="text-xs text-ink-faint">{docs.length} documents on file</span>
      </div>

      <form onSubmit={handleSubmit} className="card p-4 mb-6">
        <p className="panel-header mb-3">Upload / register document</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 items-start">
          <select required value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} className="field">
            <option value="">Select Vehicle</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.registrationNumber}</option>
            ))}
          </select>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="field">
            {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="text" placeholder="Document Number" value={form.documentNumber}
            onChange={(e) => setForm({ ...form, documentNumber: e.target.value })} className="field" />
          <input type="date" required title="Expiry Date" value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="field" />
          <label className="field flex items-center gap-2 cursor-pointer text-ink-faint">
            <Upload size={14} />
            <span className="text-sm truncate">{form.file ? form.file.name : 'Attach file (optional)'}</span>
            <input type="file" className="hidden" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} />
          </label>
        </div>
        <button type="submit" disabled={submitting} className="btn-primary mt-3">
          {submitting ? 'Saving…' : 'Save Document'}
        </button>
        {error && <p className="text-danger text-xs mt-3">{error}</p>}
      </form>

      <div className="table-shell">
        <table className="table-base">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Document Type</th>
              <th>Document No.</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-ink-faint">No documents registered yet.</td></tr>
            )}
            {docs.map((doc) => {
              const daysLeft = daysUntil(doc.expiryDate);
              const expired = daysLeft !== null && daysLeft < 0;
              const expiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 30;
              return (
                <tr key={doc.id}>
                  <td className="font-mono text-ink">{regNo(doc.vehicleId)}</td>
                  <td>{doc.type}</td>
                  <td>{doc.documentNumber || '—'}</td>
                  <td>{doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : '—'}</td>
                  <td>
                    <span className={`badge ${expired ? 'badge-danger' : expiringSoon ? 'badge-warn' : 'badge-success'}`}>
                      {expired ? 'Expired' : expiringSoon ? 'Expiring soon' : 'Valid'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(doc)} className="link-action !text-danger inline-flex items-center gap-1">
                      <Trash2 size={12} /> Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VehicleDocuments;
