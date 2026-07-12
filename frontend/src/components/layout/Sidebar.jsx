import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, Users, Calendar, Wrench, Fuel, BarChart3, Bell } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={17} /> },
  { name: 'Vehicle Registry', path: '/vehicles', icon: <Truck size={17} /> },
  { name: 'Drivers', path: '/drivers', icon: <Users size={17} /> },
  { name: 'Trip Management', path: '/trips', icon: <Calendar size={17} /> },
  { name: 'Maintenance', path: '/maintenance', icon: <Wrench size={17} /> },
  { name: 'Fuel & Expenses', path: '/fuel-expenses', icon: <Fuel size={17} /> },
  { name: 'Reports & Analytics', path: '/reports', icon: <BarChart3 size={17} /> },
  { name: 'Notifications', path: '/notifications', icon: <Bell size={17} /> },
];

const Sidebar = () => {
  return (
    <div className="w-64 bg-base-800 border-r border-line text-ink h-full flex flex-col">
      <div className="h-16 px-5 flex items-center gap-2.5 border-b border-line shrink-0">
        <div className="w-8 h-8 rounded-md bg-accent-soft border border-accent/30 flex items-center justify-center text-accent font-bold text-sm font-mono">
          TO
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold tracking-tight">TransitOps</div>
          <div className="text-[10px] text-ink-faint uppercase tracking-wider">Fleet Console</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
          Operations
        </div>
        {navItems.map((item) => (
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
      <div className="p-4 border-t border-line text-[11px] text-ink-faint">
        v1.0 · Ops build
      </div>
    </div>
  );
};

export default Sidebar;
