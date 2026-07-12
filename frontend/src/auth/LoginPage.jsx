import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ALL_ROLES } from '../auth/roles';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoRole, setDemoRole] = useState(ALL_ROLES[0]);
  const { login, loginDemo } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password); // Secure login using email and password
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    loginDemo(demoRole);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-900 px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm p-6">
        <div className="text-center border-b border-line pb-5 mb-5">
          <h2 className="text-sm font-bold tracking-wide text-ink">TransitOps — Sign in</h2>
          <div className="mx-auto mt-4 w-12 h-12 rounded-full border border-line2 flex items-center justify-center text-sm font-bold font-mono text-accent">
            TO
          </div>
        </div>

        <div className="mb-4">
          <label className="field-label">Email</label>
          <input
            type="email"
            required
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field w-full"
          />
        </div>
        <div className="mb-2">
          <label className="field-label">Password</label>
          <input
            type="password"
            required
            placeholder="••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field w-full"
          />
        </div>
        <div className="text-right mb-5">
          <a href="#" className="text-xs text-ink-faint hover:text-accent transition-colors">Forgot password</a>
        </div>

        {error && (
          <p className="text-danger text-xs bg-danger-soft border border-danger/30 rounded-md px-3 py-2 mb-4 text-center">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <div className="mt-6 pt-5 border-t border-line">
          <p className="text-xs text-ink-faint mb-1">New here?</p>
          <p className="text-xs text-ink-dim mb-3">
            Sign up creates an employee account — admin roles assigned later.
          </p>
          <a href="/signup" className="btn-secondary w-full block text-center">
            Create Account
          </a>
        </div>

        <div className="mt-5 pt-4 border-t border-line text-center">
          <p className="text-[11px] text-ink-faint mb-2">No backend running yet?</p>
          <select
            value={demoRole}
            onChange={(e) => setDemoRole(e.target.value)}
            className="field w-full mb-2 text-xs"
          >
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full text-xs text-ink-dim bg-panel2 border border-line rounded-md py-2 hover:border-line2 transition-colors"
          >
            Explore in Demo Mode as {demoRole}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
