import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import Navbar from './components/layout/Navbar'
import Sidebar from './components/layout/Sidebar'
import { useAuth } from './context/AuthContext'

function App() {
  // React to real auth state so the Sidebar/Navbar appear and disappear
  // immediately on login/logout, instead of only after a page refresh.
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // Sidebar is a fixed 256px column. On phone/tablet widths that ate over
  // half the viewport with no way to hide it, so below the `md` breakpoint
  // it now renders as an off-canvas drawer toggled from the Navbar, with a
  // backdrop to close it.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Auto-close the drawer on navigation so it doesn't stay open over the
  // next page on mobile.
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-base-900 overflow-hidden">
      {isAuthenticated && (
        <>
          {/* Desktop/tablet: sidebar sits inline in the flex row */}
          <div className="hidden md:block shrink-0">
            <Sidebar />
          </div>

          {/* Mobile: sidebar slides in as an overlay drawer */}
          <div
            className={`md:hidden fixed inset-0 z-40 transition-opacity ${
              sidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <div
              className={`absolute inset-y-0 left-0 w-64 max-w-[80vw] transform transition-transform duration-200 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <Sidebar />
            </div>
          </div>
        </>
      )}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {isAuthenticated && <Navbar onMenuClick={() => setSidebarOpen((v) => !v)} />}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-base-900">
          <AppRoutes />
        </main>
      </div>
    </div>
  )
}

export default App