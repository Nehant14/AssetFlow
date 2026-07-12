import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold text-gray-800">
        Transport Operations Platform
      </h2>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          Role: <span className="font-bold">{user?.role || 'Fleet Manager'}</span>
        </span>
        <button 
          onClick={logout}
          className="text-sm bg-red-50 text-red-600 px-4 py-2 rounded-md hover:bg-red-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;