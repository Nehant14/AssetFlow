import React, { useContext } from 'react';
import { Sun, Moon, Menu } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();

  const initials = (user?.name || user?.email || 'U')
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="h-16 shrink-0 bg-base-800 border-b border-line flex items-center justify-between gap-2 px-3 sm:px-6">
      <div className="flex items-center gap-2 min-w-0">
        {/* Hamburger: only shown below md, where the Sidebar becomes a drawer */}
        <button
          onClick={onMenuClick}
          aria-label="Toggle navigation menu"
          className="md:hidden w-8 h-8 shrink-0 rounded-md bg-panel2 border border-line flex items-center justify-center text-ink-dim hover:text-accent hover:border-accent/30 transition-colors"
        >
          <Menu size={16} />
        </button>
        <h2 className="text-sm font-semibold text-ink truncate">
          <span className="hidden sm:inline">AssetFlow — Enterprise Asset Management</span>
          <span className="sm:hidden">AssetFlow</span>
        </h2>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-8 h-8 rounded-md bg-panel2 border border-line flex items-center justify-center text-ink-dim hover:text-accent hover:border-accent/30 transition-colors"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <Link to="/notifications" className="badge badge-info hover:opacity-80 transition-opacity hidden sm:inline-flex">
          {user?.role || 'Employee'}
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-panel2 border border-line flex items-center justify-center text-xs font-semibold text-ink-dim shrink-0">
            {initials}
          </div>
          <span className="text-sm text-ink-dim hidden md:inline">{user?.name || user?.email}</span>
        </div>
        <button
          onClick={logout}
          className="text-xs font-medium bg-danger-soft text-danger border border-danger/30 px-2.5 sm:px-3 py-1.5 rounded-md hover:bg-danger/20 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
