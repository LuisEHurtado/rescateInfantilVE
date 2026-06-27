import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '../../api/endpoints/search';
import { ChildAvatar } from '../../components/shared/ChildAvatar';
import { ChildStatusBadge } from '../../components/shared/ChildStatusBadge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { formatDate, sexLabel } from '../../utils/labels';
import { Search, Filter, X } from 'lucide-react';

const VENEZUELAN_STATES = ['','Amazonas','Anzoátegui','Apure','Aragua','Barinas','Bolívar','Carabobo','Cojedes','Delta Amacuro','Distrito Capital','Falcón','Guárico','Lara','Mérida','Miranda','Monagas','Nueva Esparta','Portuguesa','Sucre','Táchira','Trujillo','Vargas','Yaracuy','Zulia'];

export function SearchPage() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [params, setParams] = useState<any>({ page: 1, limit: 20 });
  const [draft, setDraft] = useState<any>({});

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', params],
    queryFn: () => searchApi.search(params),
    enabled: true,
  });

  const handleSearch = () => setParams({ ...draft, page: 1, limit: 20 });
  const handleClear = () => { setDraft({}); setParams({ page: 1, limit: 20 }); };
  const set = (key: string, val: string) => setDraft((p: any) => ({ ...p, [key]: val || undefined }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Búsqueda</h1>
        <p className="text-sm text-gray-500 mt-0.5">Localice un expediente en segundos</p>
      </div>

      {/* Barra de búsqueda principal */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por código, nombre, hospital..."
              value={draft.q || ''}
              onChange={e => set('q', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button onClick={handleSearch} loading={isFetching} size="lg">
            <Search size={16} /> Buscar
          </Button>
          <Button variant="secondary" size="lg" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} /> Filtros
          </Button>
        </div>

        {/* Filtros expandibles */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <Select label="Sexo" value={draft.sex || ''} onChange={e => set('sex', e.target.value)}
              options={[{ value: 'MALE', label: 'Masculino' }, { value: 'FEMALE', label: 'Femenino' }, { value: 'UNDETERMINED', label: 'No determinado' }]}
              placeholder="Todos" />
            <Select label="Estado del caso" value={draft.caseStatus || ''} onChange={e => set('caseStatus', e.target.value)}
              options={[{ value: 'UNIDENTIFIED', label: 'Sin identificar' }, { value: 'HOSPITALIZED', label: 'Hospitalizado' }, { value: 'REUNIFIED', label: 'Reunificado' }, { value: 'DECEASED', label: 'Fallecido' }]}
              placeholder="Todos" />
            <Select label="Estado Venezuela" value={draft.state || ''} onChange={e => set('state', e.target.value)}
              options={VENEZUELAN_STATES.filter(Boolean).map(s => ({ value: s, label: s }))}
              placeholder="Todos" />
            <Input label="Municipio" value={draft.municipality || ''} onChange={e => set('municipality', e.target.value)} placeholder="Ej: Sucre" />
            <Input label="Hospital" value={draft.hospital || ''} onChange={e => set('hospital', e.target.value)} placeholder="Nombre del hospital" />
            <Input label="Organismo de rescate" value={draft.rescueOrg || ''} onChange={e => set('rescueOrg', e.target.value)} placeholder="Ej: Protección Civil" />
            <Input label="Nombre familiar" value={draft.familyName || ''} onChange={e => set('familyName', e.target.value)} placeholder="Buscar por familiar" />
            <Input label="Documento familiar" value={draft.familyDocument || ''} onChange={e => set('familyDocument', e.target.value)} placeholder="CI del familiar" />
            <div className="col-span-2 sm:col-span-3 lg:col-span-4 flex justify-end">
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <X size={14} /> Limpiar filtros
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Resultados */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {isLoading ? 'Buscando...' : `${data?.total ?? 0} resultado(s) encontrado(s)`}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
        ) : data?.data?.length ? (
          <div className="divide-y divide-gray-100">
            {data.data.map((child: any) => (
              <button key={child.id} onClick={() => navigate(`/expedientes/${child.id}`)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-blue-50 transition-colors text-left">
                <ChildAvatar photos={child.photos} sex={child.sex} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-blue-700">{child.code}</span>
                    <ChildStatusBadge status={child.caseStatus} />
                  </div>
                  <p className="text-sm text-gray-900 mt-0.5">{[child.firstName, child.lastName].filter(Boolean).join(' ') || <span className="italic text-gray-400">Sin nombre</span>}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                    <span>{sexLabel[child.sex as keyof typeof sexLabel] || child.sex}</span>
                    {child.approximateAge && <span>~{child.approximateAge} años</span>}
                    {child.findLocation && <span>{child.findLocation.municipality}, {child.findLocation.state}</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-gray-700 truncate max-w-40">{child.currentLocation?.hospital || '—'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(child.rescuedAt || child.createdAt)}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No se encontraron resultados</p>
            <p className="text-sm text-gray-400 mt-1">Intente con otros criterios de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
}
