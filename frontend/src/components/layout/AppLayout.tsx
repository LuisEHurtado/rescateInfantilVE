import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../../stores/auth.store';
import { Toaster } from 'react-hot-toast';
import { Menu, AlertTriangle } from 'lucide-react';

export function AppLayout() {
  const { token } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      <main className="flex-1 lg:ml-64 min-h-screen">
        {/* Mobile topbar */}
        <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
          <button onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
              <AlertTriangle size={14} className="text-white" />
            </div>
            <span className="font-bold text-sm text-slate-900">
              RESCATE <span className="text-red-600">Venezuela</span>
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <Outlet />
        </div>
      </main>

      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </div>
  );
}
