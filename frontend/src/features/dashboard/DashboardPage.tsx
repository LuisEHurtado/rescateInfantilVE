import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/endpoints/dashboard';
import { visitsApi } from '../../api/endpoints/visits';
import { familySearchApi } from '../../api/endpoints/familySearch';
import { DashboardStats, Child, Transfer } from '../../types';
import { ChildAvatar } from '../../components/shared/ChildAvatar';
import { ChildStatusBadge } from '../../components/shared/ChildStatusBadge';
import { formatDate } from '../../utils/labels';
import { Users, AlertCircle, CheckCircle, Heart, Building2, ArrowRight, Clock, Eye, Search, Smartphone, Monitor, TrendingUp, Phone } from 'lucide-react';
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
  const { data: visitStats } = useQuery({ queryKey: ['visit-stats'], queryFn: visitsApi.stats, refetchInterval: 60000 });
  const { data: recentVisits } = useQuery({ queryKey: ['recent-visits'], queryFn: () => visitsApi.recent(30), refetchInterval: 60000 });
  const { data: familySearchStats } = useQuery({ queryKey: ['family-search-stats'], queryFn: familySearchApi.stats, refetchInterval: 60000 });
  const { data: activeFamilySearches } = useQuery({ queryKey: ['active-family-searches'], queryFn: () => familySearchApi.list('ACTIVE'), refetchInterval: 60000 });

  if (!stats) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Estado en tiempo real — Emergencia Venezuela</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-white px-3 py-2 rounded-lg border flex-shrink-0">
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
            <button onClick={() => navigate('/panel/expedientes')} className="text-xs text-blue-600 hover:underline">Ver todos</button>
          </div>
          <div className="divide-y divide-gray-50">
            {recent?.slice(0, 6).map(child => (
              <button key={child.id} onClick={() => navigate(`/panel/expedientes/${child.id}`)} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left">
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

      {/* ── Sección de visitas ── */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Eye size={16} /> Tráfico de visitas públicas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <StatCard label="Visitas hoy"       value={visitStats?.today      ?? 0} icon={TrendingUp} color="text-blue-600" />
          <StatCard label="IPs únicas hoy"    value={visitStats?.uniqueIpsToday ?? 0} icon={Eye}    color="text-indigo-600" />
          <StatCard label="Esta semana"        value={visitStats?.thisWeek   ?? 0} icon={Clock}     color="text-orange-600" />
          <StatCard label="Total acumulado"    value={visitStats?.total      ?? 0} icon={Users}     color="text-gray-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dispositivos */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Dispositivos (hoy)</h3>
            {visitStats ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Smartphone size={16} className="text-blue-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Móvil</span>
                      <span className="font-semibold">{visitStats.mobileToday}</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${visitStats.today ? (visitStats.mobileToday / visitStats.today) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Monitor size={16} className="text-gray-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Escritorio</span>
                      <span className="font-semibold">{visitStats.desktopToday}</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-1.5">
                      <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: `${visitStats.today ? (visitStats.desktopToday / visitStats.today) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ) : <p className="text-sm text-gray-400 text-center py-4">Sin datos</p>}

            {/* Top búsquedas */}
            {visitStats?.topSearches?.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-gray-900 mt-5 mb-3 flex items-center gap-1.5"><Search size={13} /> Búsquedas frecuentes (7 días)</h3>
                <div className="space-y-1.5">
                  {visitStats.topSearches.slice(0, 6).map((s: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 truncate max-w-[140px]">"{s.term}"</span>
                      <span className="font-semibold text-gray-800 ml-2 flex-shrink-0">{s.count}x</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Visitas por hora */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Actividad por hora (24h)</h3>
            {visitStats?.visitsByHour ? (
              <div className="flex items-end gap-0.5 h-20">
                {visitStats.visitsByHour.map((h: any) => {
                  const max = Math.max(...visitStats.visitsByHour.map((x: any) => x.count), 1);
                  return (
                    <div key={h.hour} className="flex-1 flex flex-col items-center gap-0.5" title={`${h.hour}:00 — ${h.count} visitas`}>
                      <div className="w-full bg-blue-500 rounded-sm transition-all" style={{ height: `${Math.max(2, (h.count / max) * 64)}px`, opacity: h.count ? 1 : 0.15 }} />
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-sm text-gray-400 text-center py-8">Sin datos</p>}
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span>
            </div>
          </div>

          {/* Visitas recientes */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><Eye size={14} /> Visitas recientes</h3>
            </div>
            <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
              {recentVisits?.map((v: any) => (
                <div key={v.id} className="px-4 py-2.5 flex items-center gap-3">
                  <div className="flex-shrink-0 text-gray-400">
                    {v.isMobile ? <Smartphone size={13} /> : <Monitor size={13} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-gray-700">{v.ip}</p>
                    {v.searchQuery && (
                      <p className="text-xs text-blue-600 truncate">"{v.searchQuery}"</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(v.createdAt).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
              {!recentVisits?.length && <p className="text-sm text-gray-400 text-center py-8">Sin visitas aún</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Búsquedas de familiares ── */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Heart size={16} /> Familias buscando a sus hijos
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <StatCard label="Búsquedas activas"   value={familySearchStats?.active    ?? 0} icon={Heart}       color="text-purple-600" />
          <StatCard label="En revisión"          value={familySearchStats?.reviewing ?? 0} icon={Clock}       color="text-orange-600" />
          <StatCard label="Coincidencia hallada" value={familySearchStats?.matched   ?? 0} icon={CheckCircle} color="text-green-600" />
          <StatCard label="Cerradas"             value={familySearchStats?.closed    ?? 0} icon={Users}       color="text-gray-600" />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><Phone size={14} /> Búsquedas activas recientes</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {activeFamilySearches?.slice(0, 8).map((s: any) => (
              <div key={s.id} className="px-5 py-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Heart size={14} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{s.contactName}</p>
                  <p className="text-xs text-gray-500">
                    {s.relationship} · {s.contactPhone}
                    {s.childName ? ` · busca a "${s.childName}"` : ''}
                    {s.childSex && s.childSex !== 'UNDETERMINED' ? ` · ${s.childSex === 'MALE' ? 'Masc.' : 'Fem.'}` : ''}
                    {s.childAgeMin != null ? ` · ~${s.childAgeMin}${s.childAgeMax && s.childAgeMax !== s.childAgeMin ? `-${s.childAgeMax}` : ''}a` : ''}
                    {s.childState ? ` · ${s.childState}` : ''}
                  </p>
                </div>
                <p className="text-xs text-gray-400 flex-shrink-0">{formatDate(s.createdAt, true)}</p>
              </div>
            ))}
            {!activeFamilySearches?.length && (
              <p className="text-sm text-gray-400 text-center py-8">Sin búsquedas activas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
