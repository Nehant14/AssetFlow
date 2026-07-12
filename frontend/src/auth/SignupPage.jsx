import React, { useState } from 'react';
import { signup } from '../api/auth.api';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(formData);
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
          <h2 className="text-sm font-bold tracking-wide text-ink">AssetFlow — Create Account</h2>
          <div className="mx-auto mt-4 w-12 h-12 rounded-full border border-line2 flex items-center justify-center text-sm font-bold font-mono text-accent">
            AF
          </div>
        </div>

        <div className="mb-4">
          <label className="field-label">Full Name</label>
          <input
            type="text" placeholder="Jane Doe" required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="field w-full"
          />
        </div>
        <div className="mb-4">
          <label className="field-label">Email</label>
          <input
            type="email" placeholder="name@company.com" required
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="field w-full"
          />
        </div>
        <div className="mb-5">
          <label className="field-label">Password</label>
          <input
            type="password" placeholder="••••••••••" required
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            className="field w-full"
          />
        </div>

        {/* The backend always creates new signups with role "Employee" —
            an Admin elevates roles afterwards from Organization → Employees. */}
        <p className="text-[11px] text-ink-faint bg-panel2 border border-line rounded-md px-3 py-2 mb-4">
          New accounts start as <span className="text-ink-dim font-medium">Employee</span>. An Admin can
          promote your role later from the Organization page.
        </p>

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
