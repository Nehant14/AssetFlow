import React from 'react';
import { Search, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

// Export common UI components like buttons, modals, or cards used across the app
export const Card = ({ children, className = '' }) => (
  <div className={`card p-4 ${className}`}>
    {children}
  </div>
);

// Bonus feature: search box used across list pages (Assets, Bookings, etc.)
export const SearchBox = ({ value, onChange, placeholder = 'Search…', className = '' }) => (
  <div className={`relative ${className}`}>
    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="field pl-8 w-full sm:w-64"
    />
  </div>
);

// Bonus feature: clickable, sortable table header cell.
export const SortableTh = ({ label, sortKeyName, sortKey, sortDir, onSort }) => {
  const active = sortKey === sortKeyName;
  const Icon = active ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th
      onClick={() => onSort(sortKeyName)}
      className={`cursor-pointer select-none hover:text-ink transition-colors ${active ? 'text-accent' : ''}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <Icon size={11} className={active ? 'text-accent' : 'text-ink-faint'} />
      </span>
    </th>
  );
};