import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/endpoints/dashboard';
import { DashboardStats, Child, Transfer } from '../../types';
import { ChildAvatar } from '../../components/shared/ChildAvatar';
import { ChildStatusBadge } from '../../components/shared/ChildStatusBadge';
import { formatDate } from '../../utils/labels';
import { Users, AlertCircle, CheckCircle, Heart, Building2, MapPin, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function StatCard({ label, value, icon: Icon, color, sub }: { label: string; value: number; icon: any; color: string; sub?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value.toLocaleString()}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('-600', '-100').replace('-700', '-100').replace('-800', '-100')}`}>
          <Icon size={22} className={color} />
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();

  const { data: stats } = useQuery<DashboardStats>({ queryKey: ['dashboard-stats'], queryFn: dashboardApi.stats, refetchInterval: 30000 });
  const { data: byHospital } = useQuery<{ hospital: string; count: number }[]>({ queryKey: ['by-hospital'], queryFn: dashboardApi.byHospital });
  const { data: recent } = useQuery<Child[]>({ queryKey: ['recent-children'], queryFn: dashboardApi.recentChildren });
  const { data: recentTransfers } = useQuery<Transfer[]>({ queryKey: ['recent-transfers'], queryFn: dashboardApi.recentTransfers });

  if (!stats) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Estado en tiempo real — Emergencia Venezuela</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-white px-3 py-2 rounded-lg border">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Actualización automática
        </div>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Registrados" value={stats.total} icon={Users} color="text-blue-600" />
        <StatCard label="Sin Identificar" value={stats.unidentified} icon={AlertCircle} color="text-red-600" />
        <StatCard label="Identificados" value={stats.identified} icon={CheckCircle} color="text-green-600" />
        <StatCard label="Reunificados" value={stats.reunified} icon={Heart} color="text-emerald-600" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Hospitalizados" value={stats.hospitalized} icon={Building2} color="text-purple-600" />
        <StatCard label="En Observación" value={stats.inObservation} icon={Clock} color="text-orange-600" />
        <StatCard label="Con Familiares" value={stats.withFamily} icon={Users} color="text-teal-600" />
        <StatCard label="Sin Familiares" value={stats.withoutFamily} icon={AlertCircle} color="text-gray-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Por Hospital */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><Building2 size={16} /> Por Hospital</h3>
          </div>
          <div className="p-5 space-y-3">
            {byHospital?.slice(0, 7).map((h, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{h.hospital}</p>
                  <div className="mt-1 bg-gray-100 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (h.count / (stats.total || 1)) * 100)}%` }} />
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900 w-6 text-right">{h.count}</span>
              </div>
            ))}
            {!byHospital?.length && <p className="text-sm text-gray-400 text-center py-4">Sin datos</p>}
          </div>
        </div>

        {/* Últimos registros */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Últimos Registros</h3>
            <button onClick={() => navigate('/expedientes')} className="text-xs text-blue-600 hover:underline">Ver todos</button>
          </div>
          <div className="divide-y divide-gray-50">
            {recent?.slice(0, 6).map(child => (
              <button key={child.id} onClick={() => navigate(`/expedientes/${child.id}`)} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left">
                <ChildAvatar photos={child.photos} sex={child.sex} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{child.code}</p>
                  <p className="text-xs text-gray-500">{child.sex === 'MALE' ? 'Masc.' : child.sex === 'FEMALE' ? 'Fem.' : 'N/D'} — ~{child.approximateAge ?? '?'} años</p>
                </div>
                <ChildStatusBadge status={child.caseStatus} />
              </button>
            ))}
            {!recent?.length && <p className="text-sm text-gray-400 text-center py-8">Sin registros</p>}
          </div>
        </div>

        {/* Últimos traslados */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><ArrowRight size={16} /> Últimos Traslados</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTransfers?.slice(0, 6).map((t: any) => (
              <div key={t.id} className="px-5 py-3">
                <p className="text-xs font-semibold text-blue-600">{(t as any).child?.code}</p>
                <p className="text-sm text-gray-700 mt-0.5 truncate">{t.origin}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  <ArrowRight size={10} />
                  <span className="truncate">{t.destination}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{formatDate(t.departedAt, true)}</p>
              </div>
            ))}
            {!recentTransfers?.length && <p className="text-sm text-gray-400 text-center py-8">Sin traslados</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
