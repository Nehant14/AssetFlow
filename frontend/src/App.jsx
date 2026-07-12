import React from 'react'
import AppRoutes from './routes/AppRoutes'
import Navbar from './components/layout/Navbar'
import Sidebar from './components/layout/Sidebar'
import { useAuth } from './context/AuthContext'

function App() {
  // React to real auth state so the Sidebar/Navbar appear and disappear
  // immediately on login/logout, instead of only after a page refresh.
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return (
    <div className="flex h-screen bg-base-900">
      {isAuthenticated && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isAuthenticated && <Navbar />}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-base-900">
          <AppRoutes />
        </main>
      </div>
    </div>
  )
}

export default App