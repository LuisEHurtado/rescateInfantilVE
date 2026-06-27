import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { childrenApi } from '../../api/endpoints/children';
import { PaginatedResponse, Child } from '../../types';
import { ChildAvatar } from '../../components/shared/ChildAvatar';
import { ChildStatusBadge } from '../../components/shared/ChildStatusBadge';
import { formatDate, sexLabel } from '../../utils/labels';
import { Button } from '../../components/ui/Button';
import { PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export function ExpedientesListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedResponse<Child>>({
    queryKey: ['children', page],
    queryFn: () => childrenApi.list({ page, limit: 20 }),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expedientes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.total ?? 0} registros totales</p>
        </div>
        <Button onClick={() => navigate('/panel/registrar')} size="lg">
          <PlusCircle size={18} /> Registrar Niño
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Foto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Código</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sexo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Edad</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Hospital</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.data.map(child => (
                <tr key={child.id} onClick={() => navigate(`/panel/expedientes/${child.id}`)} className="hover:bg-blue-50 cursor-pointer transition-colors">
                  <td className="px-4 py-3">
                    <ChildAvatar photos={child.photos} sex={child.sex} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-blue-700">{child.code}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">{[child.firstName, child.lastName].filter(Boolean).join(' ') || <span className="text-gray-400 italic">Sin nombre</span>}</span>
                  </td>
                  <td className="px-4 py-3"><span className="text-sm text-gray-600">{sexLabel[child.sex]}</span></td>
                  <td className="px-4 py-3"><span className="text-sm text-gray-600">{child.approximateAge ? `~${child.approximateAge}a` : '—'}</span></td>
                  <td className="px-4 py-3"><span className="text-sm text-gray-600 max-w-32 truncate block">{(child as any).currentLocation?.hospital || '—'}</span></td>
                  <td className="px-4 py-3"><ChildStatusBadge status={child.caseStatus} /></td>
                  <td className="px-4 py-3"><span className="text-xs text-gray-400">{formatDate(child.createdAt)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Página {data.page} de {data.totalPages}</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={16} />
              </Button>
              <Button variant="secondary" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
