import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, Users, Calendar, Wrench, Fuel, BarChart3, Bell } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
  { name: 'Vehicle Registry', path: '/vehicles', icon: <Truck size={20} /> },
  { name: 'Drivers', path: '/drivers', icon: <Users size={20} /> },
  { name: 'Trip Management', path: '/trips', icon: <Calendar size={20} /> },
  { name: 'Maintenance', path: '/maintenance', icon: <Wrench size={20} /> },
  { name: 'Fuel & Expenses', path: '/fuel-expenses', icon: <Fuel size={20} /> },
  { name: 'Reports & Analytics', path: '/reports', icon: <BarChart3 size={20} /> },
  { name: 'Notifications', path: '/notifications', icon: <Bell size={20} /> },
];

const Sidebar = () => {
  return (
    <div className="w-64 bg-slate-800 text-white h-full flex flex-col">
      <div className="p-4 text-2xl font-bold border-b border-slate-700">
        TransitOps
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
