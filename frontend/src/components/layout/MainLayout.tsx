// src/components/layout/MainLayout.tsx
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar'; // File Sidebar của bạn
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';

export function MainLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isWideRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/order');

  return (
    <div className="flex h-screen bg-gray-100">
      <Toaster position="top-center" />

      {/* Sidebar: pass open state for mobile off-canvas */}
      <Sidebar isOpen={open} onClose={() => setOpen(false)} />

      {/* Main area with top bar for mobile */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="md:hidden bg-white border-b p-2 flex items-center">
          <button onClick={() => setOpen((s) => !s)} className="p-2 rounded-md text-gray-700">
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="ml-3 font-semibold">Drink POS</div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {isWideRoute ? (
            <div className="w-full">
              <Outlet />
            </div>
          ) : (
            <div className="max-w-7xl mx-auto w-full">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}