import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ArrowLeftRight, CalendarClock, Wrench, ClipboardCheck, Building2, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../auth/roles';

const navItems = [
  { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={17} />, capability: null },
  { name: 'Asset Registry', path: '/assets', icon: <Package size={17} />, capability: null },
  { name: 'Allocations', path: '/allocations', icon: <ArrowLeftRight size={17} />, capability: null },
  { name: 'Bookings', path: '/bookings', icon: <CalendarClock size={17} />, capability: null },
  { name: 'Maintenance', path: '/maintenance', icon: <Wrench size={17} />, capability: null },
  { name: 'Audits', path: '/audits', icon: <ClipboardCheck size={17} />, capability: null },
  { name: 'Organization', path: '/organization', icon: <Building2 size={17} />, capability: null },
  { name: 'Notifications', path: '/notifications', icon: <Bell size={17} />, capability: null },
];

const Sidebar = () => {
  const { user } = useAuth();
  const items = navItems.filter((item) => !item.capability || can(user?.role, item.capability));

  return (
    <div className="w-64 bg-base-800 border-r border-line text-ink h-full flex flex-col">
      <div className="h-16 px-5 flex items-center gap-2.5 border-b border-line shrink-0">
        <div className="w-8 h-8 rounded-md bg-accent-soft border border-accent/30 flex items-center justify-center text-accent font-bold text-sm font-mono">
          AF
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold tracking-tight">AssetFlow</div>
          <div className="text-[10px] text-ink-faint uppercase tracking-wider">Asset Console</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
          Operations
        </div>
        {items.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors border ${
                isActive
                  ? 'bg-accent-soft text-accent border-accent/30 font-medium'
                  : 'text-ink-dim border-transparent hover:bg-panel2 hover:text-ink'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-line text-[11px] text-ink-faint flex items-center justify-between">
        <span>v1.0 · Ops build</span>
        <span className="badge badge-neutral !py-0.5">{user?.role}</span>
      </div>
    </div>
  );
};

export default Sidebar;
