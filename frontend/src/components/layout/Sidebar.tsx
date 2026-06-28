import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Search, FileText, Users, Settings, LogOut, AlertTriangle, X } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { roleLabel } from '../../utils/labels';

const navItems = [
  { to: '/panel/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/panel/registrar', icon: PlusCircle, label: 'Registrar Niño', highlight: true },
  { to: '/panel/buscar', icon: Search, label: 'Buscar' },
  { to: '/panel/expedientes', icon: FileText, label: 'Expedientes' },
];

const adminItems = [
  { to: '/panel/usuarios', icon: Users, label: 'Usuarios' },
  { to: '/panel/tokens', icon: Settings, label: 'Tokens Emergencia' },
];

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const { user, logout } = useAuthStore();

  return (
    <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-white flex flex-col z-40 transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">RESCATE</h1>
            <p className="text-xs text-slate-400">Venezuela</p>
          </div>
        </div>
        <button onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, highlight }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                highlight
                  ? isActive
                    ? 'bg-red-600 text-white'
                    : 'bg-red-600/20 text-red-300 hover:bg-red-600 hover:text-white'
                  : isActive
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        {user?.role === 'ADMIN' && (
          <>
            <div className="pt-4 pb-1">
              <p className="px-3 text-xs text-slate-500 uppercase tracking-wider font-medium">Administración</p>
            </div>
            {adminItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center text-sm font-semibold">
            {user?.fullName?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
            <p className="text-xs text-slate-400">{user?.role ? roleLabel[user.role] : ''}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
