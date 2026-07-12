import React, { useState } from 'react';
import { register } from '../api/auth.api';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'Fleet Manager' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Signup failed', error);
      setError(error?.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-900 px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm p-6">
        <div className="text-center border-b border-line pb-5 mb-5">
          <h2 className="text-sm font-bold tracking-wide text-ink">TransitOps — Create Account</h2>
          <div className="mx-auto mt-4 w-12 h-12 rounded-full border border-line2 flex items-center justify-center text-sm font-bold font-mono text-accent">
            TO
          </div>
        </div>

        <div className="mb-4">
          <label className="field-label">Email</label>
          <input
            type="email" placeholder="name@company.com" required
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="field w-full"
          />
        </div>
        <div className="mb-4">
          <label className="field-label">Password</label>
          <input
            type="password" placeholder="••••••••••" required
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            className="field w-full"
          />
        </div>
        {/* Support Role-Based Access Control (RBAC) */}
        <div className="mb-5">
          <label className="field-label">Role</label>
          <select
            onChange={e => setFormData({ ...formData, role: e.target.value })}
            className="field w-full"
            defaultValue="Fleet Manager"
          >
            <option value="Fleet Manager">Fleet Manager</option>
            <option value="Driver">Driver</option>
            <option value="Safety Officer">Safety Officer</option>
            <option value="Financial Analyst">Financial Analyst</option>
          </select>
        </div>

        {error && (
          <p className="text-danger text-xs bg-danger-soft border border-danger/30 rounded-md px-3 py-2 mb-4 text-center">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating account…' : 'Sign Up'}
        </button>

        <p className="text-xs text-center text-ink-faint mt-5 pt-4 border-t border-line">
          Already have an account?{' '}
          <a href="/login" className="text-accent hover:text-accent-hover hover:underline">Sign in</a>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;
