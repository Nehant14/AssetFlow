import React, { useEffect, useState } from 'react';
import { getDepartments, createDepartment, getCategories, createCategory, getEmployees, updateEmployeeRole } from '../../api/organization.api';
import { useAuth } from '../../context/AuthContext';
import { can, ALL_ROLES } from '../../auth/roles';

const TABS = ['Departments', 'Categories', 'Employees'];

const Organization = () => {
  const { user } = useAuth();
  const canManage = can(user?.role, 'manageOrganization');

  const [tab, setTab] = useState('Departments');
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');

  const [deptForm, setDeptForm] = useState({ name: '', headId: '', parentId: '' });
  const [catForm, setCatForm] = useState({ name: '', customFields: '{}' });
  const [roleEdits, setRoleEdits] = useState({});

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [deptRes, catRes, empRes] = await Promise.all([getDepartments(), getCategories(), getEmployees()]);
      setDepartments(deptRes.data?.data || deptRes.data || []);
      setCategories(catRes.data?.data || catRes.data || []);
      setEmployees(empRes.data?.data || empRes.data || []);
    } catch (err) {
      console.error('Failed to fetch organization data', err);
    }
  };

  const handleCreateDept = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createDepartment({
        name: deptForm.name,
        headId: deptForm.headId ? Number(deptForm.headId) : undefined,
        parentId: deptForm.parentId ? Number(deptForm.parentId) : undefined,
      });
      setDeptForm({ name: '', headId: '', parentId: '' });
      fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create department.');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let customFields = {};
      try { customFields = catForm.customFields ? JSON.parse(catForm.customFields) : {}; }
      catch { throw new Error('Custom fields must be valid JSON, e.g. {"warrantyMonths": 24}'); }
      await createCategory({ name: catForm.name, customFields });
      setCatForm({ name: '', customFields: '{}' });
      fetchAll();
    } catch (err) {
      setError(err.message || err?.response?.data?.message || 'Failed to create category.');
    }
  };

  const handleRoleFieldChange = (empId, field, value) => {
    setRoleEdits(prev => ({ ...prev, [empId]: { ...prev[empId], [field]: value } }));
  };

  const handleSaveEmployee = async (emp) => {
    const edit = roleEdits[emp.id] || {};
    try {
      await updateEmployeeRole(emp.id, {
        role: edit.role ?? emp.role,
        departmentId: edit.departmentId !== undefined ? (edit.departmentId ? Number(edit.departmentId) : null) : emp.departmentId,
        status: edit.status ?? emp.status,
      });
      fetchAll();
    } catch (err) {
      console.error('Failed to update employee', err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-lg font-bold text-ink">Organization</h1>
        <p className="text-xs text-ink-faint mt-0.5">Departments, asset categories, and employee roles</p>
      </div>

      <div className="flex gap-2 mb-5 border-b border-line">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? 'border-accent text-accent' : 'border-transparent text-ink-faint hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-danger text-xs bg-danger-soft border border-danger/30 rounded-md px-3 py-2 mb-5">{error}</p>
      )}

      {tab === 'Departments' && (
        <>
          {canManage && (
            <form onSubmit={handleCreateDept} className="card p-4 mb-6">
              <p className="panel-header mb-3">Create department</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input type="text" placeholder="Department Name" required value={deptForm.name}
                  onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} className="field" />
                <select value={deptForm.headId}
                  onChange={e => setDeptForm({ ...deptForm, headId: e.target.value })} className="field">
                  <option value="">No Head (optional)</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <select value={deptForm.parentId}
                  onChange={e => setDeptForm({ ...deptForm, parentId: e.target.value })} className="field">
                  <option value="">No Parent (top-level)</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <button type="submit" className="btn-primary mt-3">Create Department</button>
            </form>
          )}
          <div className="table-shell">
            <table className="table-base">
              <thead><tr><th>Name</th><th>Head</th><th>Sub-departments</th></tr></thead>
              <tbody>
                {departments.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-ink-faint">No departments yet.</td></tr>}
                {departments.map(d => (
                  <tr key={d.id}>
                    <td className="text-ink font-medium">{d.name}</td>
                    <td>{d.head?.name || '—'}</td>
                    <td>{(d.children || []).map(c => c.name).join(', ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'Categories' && (
        <>
          {canManage && (
            <form onSubmit={handleCreateCategory} className="card p-4 mb-6">
              <p className="panel-header mb-3">Create asset category</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" placeholder="Category Name" required value={catForm.name}
                  onChange={e => setCatForm({ ...catForm, name: e.target.value })} className="field" />
                <input type="text" placeholder='Custom Fields JSON, e.g. {"warrantyMonths":24}' value={catForm.customFields}
                  onChange={e => setCatForm({ ...catForm, customFields: e.target.value })} className="field" />
              </div>
              <button type="submit" className="btn-primary mt-3">Create Category</button>
            </form>
          )}
          <div className="table-shell">
            <table className="table-base">
              <thead><tr><th>Name</th><th>Custom Fields</th></tr></thead>
              <tbody>
                {categories.length === 0 && <tr><td colSpan={2} className="p-4 text-center text-ink-faint">No categories yet.</td></tr>}
                {categories.map(c => (
                  <tr key={c.id}>
                    <td className="text-ink font-medium">{c.name}</td>
                    <td className="font-mono text-xs">{c.customFields ? JSON.stringify(c.customFields) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'Employees' && (
        <div className="table-shell">
          <table className="table-base">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 && <tr><td colSpan={canManage ? 6 : 5} className="p-4 text-center text-ink-faint">No employees yet.</td></tr>}
              {employees.map(emp => (
                <tr key={emp.id}>
                  <td className="text-ink font-medium">{emp.name}</td>
                  <td>{emp.email}</td>
                  <td>
                    {canManage ? (
                      <select
                        defaultValue={emp.role}
                        onChange={e => handleRoleFieldChange(emp.id, 'role', e.target.value)}
                        className="field !py-1 text-xs"
                      >
                        {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    ) : (
                      <span className="badge badge-info">{emp.role}</span>
                    )}
                  </td>
                  <td>{emp.department?.name || '—'}</td>
                  <td>
                    {canManage ? (
                      <select
                        defaultValue={emp.status}
                        onChange={e => handleRoleFieldChange(emp.id, 'status', e.target.value)}
                        className="field !py-1 text-xs"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    ) : (
                      <span className={`badge ${emp.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>{emp.status}</span>
                    )}
                  </td>
                  {canManage && (
                    <td><button onClick={() => handleSaveEmployee(emp)} className="link-action">Save</button></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Organization;
