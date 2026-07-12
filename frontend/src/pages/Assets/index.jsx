import React, { useEffect, useState } from 'react';
import { getAssets, createAsset } from '../../api/assets.api';
import { getCategories } from '../../api/organization.api';
import { SearchBox, SortableTh } from '../../components/common';
import useTableControls from '../../hooks/useTableControls';
import { exportTableToPDF } from '../../utils/pdfExport';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../auth/roles';

const statusBadge = {
  Available: 'badge-success',
  Allocated: 'badge-info',
  Reserved: 'badge-violet',
  UnderMaintenance: 'badge-warn',
  Lost: 'badge-danger',
  Retired: 'badge-neutral',
  Disposed: 'badge-neutral',
};

const STATUS_OPTIONS = ['Available', 'Allocated', 'Reserved', 'UnderMaintenance', 'Lost', 'Retired', 'Disposed'];

const emptyAsset = {
  name: '',
  categoryId: '',
  serialNumber: '',
  qrCode: '',
  acquisitionDate: '',
  acquisitionCost: '',
  condition: 'Good',
  location: '',
  isBookable: false,
};

const Assets = () => {
  const { user } = useAuth();
  const canManage = can(user?.role, 'manageAssets');

  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newAsset, setNewAsset] = useState(emptyAsset);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const { search, setSearch, sortKey, sortDir, toggleSort, result } = useTableControls(
    assets,
    ['name', 'tag', 'serialNumber', 'location']
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, categoryFilter, search]);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await getAssets(params);
      setAssets(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch assets', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createAsset({
        ...newAsset,
        categoryId: Number(newAsset.categoryId),
        acquisitionCost: newAsset.acquisitionCost ? Number(newAsset.acquisitionCost) : undefined,
        acquisitionDate: newAsset.acquisitionDate || undefined,
      });
      setNewAsset(emptyAsset);
      fetchAssets();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to register asset.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportPDF = () => {
    exportTableToPDF({
      title: 'AssetFlow — Asset Registry',
      filename: `asset-registry-${new Date().toISOString().slice(0, 10)}.pdf`,
      columns: [
        { header: 'Tag', key: 'tag' },
        { header: 'Name', key: 'name' },
        { header: 'Location', key: 'location' },
        { header: 'Condition', key: 'condition' },
        { header: 'Status', key: 'status' },
      ],
      rows: result,
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <div>
          <h1 className="text-lg font-bold text-ink">Asset Registry</h1>
          <p className="text-xs text-ink-faint mt-0.5">All tracked organizational assets</p>
        </div>
        <span className="text-xs text-ink-faint">{assets.length} assets</span>
      </div>

      {canManage && (
        <form onSubmit={handleSubmit} className="card p-4 mb-6">
          <p className="panel-header mb-3">Register asset</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <input type="text" placeholder="Asset Name" required value={newAsset.name}
              onChange={e => setNewAsset({ ...newAsset, name: e.target.value })} className="field" />
            <select required value={newAsset.categoryId}
              onChange={e => setNewAsset({ ...newAsset, categoryId: e.target.value })} className="field">
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="text" placeholder="Serial Number" value={newAsset.serialNumber}
              onChange={e => setNewAsset({ ...newAsset, serialNumber: e.target.value })} className="field" />
            <input type="text" placeholder="QR Code" value={newAsset.qrCode}
              onChange={e => setNewAsset({ ...newAsset, qrCode: e.target.value })} className="field" />
            <input type="date" placeholder="Acquisition Date" value={newAsset.acquisitionDate}
              onChange={e => setNewAsset({ ...newAsset, acquisitionDate: e.target.value })} className="field" />
            <input type="number" placeholder="Acquisition Cost" value={newAsset.acquisitionCost}
              onChange={e => setNewAsset({ ...newAsset, acquisitionCost: e.target.value })} className="field" />
            <input type="text" placeholder="Condition" value={newAsset.condition}
              onChange={e => setNewAsset({ ...newAsset, condition: e.target.value })} className="field" />
            <input type="text" placeholder="Location" required value={newAsset.location}
              onChange={e => setNewAsset({ ...newAsset, location: e.target.value })} className="field" />
            <label className="flex items-center gap-2 text-sm text-ink-dim px-1">
              <input type="checkbox" checked={newAsset.isBookable}
                onChange={e => setNewAsset({ ...newAsset, isBookable: e.target.checked })} />
              Bookable shared resource
            </label>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary mt-3">
            {submitting ? 'Registering…' : 'Register Asset'}
          </button>
          {error && <p className="text-danger text-xs mt-3">{error}</p>}
        </form>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <SearchBox value={search} onChange={setSearch} placeholder="Search tag, name, serial…" />
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="field">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="field">
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={handleExportPDF} disabled={!result.length} className="btn-secondary">Export PDF</button>
      </div>

      <div className="table-shell">
        <table className="table-base">
          <thead>
            <tr>
              <SortableTh label="Tag" sortKeyName="tag" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Name" sortKeyName="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th>Category</th>
              <SortableTh label="Location" sortKeyName="location" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th>Condition</th>
              <SortableTh label="Status" sortKeyName="status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th>Bookable</th>
            </tr>
          </thead>
          <tbody>
            {!loading && result.length === 0 && (
              <tr><td colSpan={7} className="p-4 text-center text-ink-faint">No assets match your search.</td></tr>
            )}
            {loading && (
              <tr><td colSpan={7} className="p-4 text-center text-ink-faint">Loading assets…</td></tr>
            )}
            {result.map(a => (
              <tr key={a.id}>
                <td className="font-mono text-ink">{a.tag}</td>
                <td>{a.name}</td>
                <td>{a.category?.name || '—'}</td>
                <td>{a.location}</td>
                <td>{a.condition}</td>
                <td>
                  <span className={`badge ${statusBadge[a.status] || 'badge-neutral'}`}>
                    {a.status}
                  </span>
                </td>
                <td>{a.isBookable ? <span className="badge badge-info">Yes</span> : <span className="text-ink-faint">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Assets;
