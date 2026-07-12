import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin } from '../api/auth.api';

export const AuthContext = createContext();

// Convenience hook so components can do `const { user, login, logout } = useAuth()`
// instead of importing useContext + AuthContext everywhere.
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password); // Secure login using email and password
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  // DEMO ONLY: logs in with a fake user and no backend call at all, so the
  // UI can be explored before a real backend exists. Data-driven pages
  // (Vehicles, Drivers, Trips, etc.) will just show empty lists since there's
  // no API to fetch from. Remove this once a real backend is connected.
  const loginDemo = (role = 'Fleet Manager') => {
    const fakeUser = { id: 'demo-user', name: 'Demo User', email: 'demo@transitops.local', role };
    setUser(fakeUser);
    localStorage.setItem('token', 'demo-token');
    localStorage.setItem('user', JSON.stringify(fakeUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, loginDemo, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};