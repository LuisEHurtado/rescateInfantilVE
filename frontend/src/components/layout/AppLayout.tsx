import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../../stores/auth.store';
import { Toaster } from 'react-hot-toast';

export function AppLayout() {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Outlet />
        </div>
      </main>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </div>
  );
}
