import React, { useContext } from 'react';
import { Sun, Moon } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();

  const initials = (user?.name || user?.email || 'U')
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="h-16 shrink-0 bg-base-800 border-b border-line flex items-center justify-between px-6">
      <h2 className="text-sm font-semibold text-ink">
        Transport Operations Platform
      </h2>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-8 h-8 rounded-md bg-panel2 border border-line flex items-center justify-center text-ink-dim hover:text-accent hover:border-accent/30 transition-colors"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <Link to="/notifications" className="badge badge-info hover:opacity-80 transition-opacity">
          {user?.role || 'Fleet Manager'}
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-panel2 border border-line flex items-center justify-center text-xs font-semibold text-ink-dim">
            {initials}
          </div>
          <span className="text-sm text-ink-dim hidden sm:inline">{user?.name || user?.email}</span>
        </div>
        <button
          onClick={logout}
          className="text-xs font-medium bg-danger-soft text-danger border border-danger/30 px-3 py-1.5 rounded-md hover:bg-danger/20 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
