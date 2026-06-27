import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { childrenApi } from '../../api/endpoints/children';
import { Child } from '../../types';
import { ChildAvatar } from '../../components/shared/ChildAvatar';
import { ChildStatusBadge } from '../../components/shared/ChildStatusBadge';
import { Timeline } from '../../components/shared/Timeline';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { formatDate, caseStatusLabel, sexLabel, identityStatusLabel, familyVerifyLabel } from '../../utils/labels';
import { ArrowLeft, MapPin, Building2, ArrowRight, Stethoscope, Users, Camera, Clock, Edit2, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import toast from 'react-hot-toast';
import { CaseStatus } from '../../types';

type TabType = 'timeline' | 'identificacion' | 'fisico' | 'medico' | 'traslados' | 'familiares' | 'fotos';

export function ExpedientePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { canWrite } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<CaseStatus>('HOSPITALIZED');

  const { data: child, isLoading } = useQuery<Child>({
    queryKey: ['child', id],
    queryFn: () => childrenApi.get(id!),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (status: CaseStatus) => childrenApi.updateStatus(id!, { caseStatus: status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['child', id] });
      setStatusModal(false);
      toast.success('Estado actualizado');
    },
    onError: () => toast.error('Error al actualizar estado'),
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
  if (!child) return <div className="text-center py-16 text-gray-500">Expediente no encontrado</div>;

  const tabs: { key: TabType; label: string; icon: any }[] = [
    { key: 'timeline', label: 'Línea de tiempo', icon: Clock },
    { key: 'identificacion', label: 'Identificación', icon: Edit2 },
    { key: 'fisico', label: 'Descripción física', icon: Edit2 },
    { key: 'medico', label: 'Médico', icon: Stethoscope },
    { key: 'traslados', label: 'Traslados', icon: ArrowRight },
    { key: 'familiares', label: 'Familiares', icon: Users },
    { key: 'fotos', label: 'Fotos', icon: Camera },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{child.code}</h1>
            <ChildStatusBadge status={child.caseStatus} />
            <Badge className="bg-gray-100 text-gray-700">{identityStatusLabel[child.identityStatus]}</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">Registrado: {formatDate(child.createdAt, true)}</p>
        </div>
        {canWrite() && (
          <Button variant="secondary" size="sm" onClick={() => setStatusModal(true)}>
            <RefreshCw size={14} /> Cambiar estado
          </Button>
        )}
      </div>

      {/* Ficha principal */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex gap-6">
          <ChildAvatar photos={child.photos} sex={child.sex} size="xl" className="flex-shrink-0" />
          <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500">Nombre</p>
              <p className="text-sm font-medium text-gray-900">{[child.firstName, child.secondName, child.lastName].filter(Boolean).join(' ') || 'Sin nombre'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Sexo</p>
              <p className="text-sm font-medium text-gray-900">{sexLabel[child.sex]}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Edad aproximada</p>
              <p className="text-sm font-medium text-gray-900">{child.approximateAge ? `~${child.approximateAge} años` : 'No registrada'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Organismo</p>
              <p className="text-sm font-medium text-gray-900">{child.rescueOrg || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Rescatista</p>
              <p className="text-sm font-medium text-gray-900">{child.rescuerName || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Familiares</p>
              <p className="text-sm font-medium text-gray-900">
                {!child.familyMembers?.length ? (
                  <span className="text-red-500">Sin familiares</span>
                ) : (
                  <span className="text-green-600">{child.familyMembers.length} registrado(s)</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Ubicación actual destacada */}
        {child.currentLocation && (
          <div className="mt-5 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <Building2 className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide">Ubicación actual</p>
              <p className="text-base font-bold text-blue-900 mt-0.5">{child.currentLocation.hospital}</p>
              <div className="flex flex-wrap gap-4 mt-1 text-sm text-blue-700">
                {child.currentLocation.area && <span>Área: {child.currentLocation.area}</span>}
                {child.currentLocation.bedNumber && <span>Cama: {child.currentLocation.bedNumber}</span>}
                <span>Desde: {formatDate(child.currentLocation.since)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Lugar de hallazgo */}
        {child.findLocation && (
          <div className="mt-3 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
            <MapPin className="text-orange-600 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-xs text-orange-500 font-semibold uppercase tracking-wide">Encontrado en</p>
              <p className="text-sm font-medium text-orange-900 mt-0.5">
                {[child.findLocation.address, child.findLocation.parish, child.findLocation.municipality, child.findLocation.state].filter(Boolean).join(', ')}
              </p>
              <p className="text-xs text-orange-600 mt-0.5">{formatDate(child.findLocation.foundAt, true)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === key ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'timeline' && <Timeline events={child.timeline || []} />}
          {activeTab === 'identificacion' && <IdentificacionTab child={child} />}
          {activeTab === 'fisico' && <FisicoTab child={child} />}
          {activeTab === 'medico' && <MedicoTab records={child.medicalRecords || []} />}
          {activeTab === 'traslados' && <TrasladosTab transfers={child.transfers || []} />}
          {activeTab === 'familiares' && <FamiliaresTab members={child.familyMembers || []} />}
          {activeTab === 'fotos' && <FotosTab photos={child.photos || []} />}
        </div>
      </div>

      {/* Modal cambio de estado */}
      <Modal open={statusModal} onClose={() => setStatusModal(false)} title="Cambiar estado del expediente" size="sm">
        <div className="space-y-4">
          <Select
            label="Nuevo estado"
            value={newStatus}
            onChange={e => setNewStatus(e.target.value as CaseStatus)}
            options={Object.entries(caseStatusLabel).map(([v, l]) => ({ value: v, label: l }))}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setStatusModal(false)}>Cancelar</Button>
            <Button onClick={() => statusMutation.mutate(newStatus)} loading={statusMutation.isPending}>Guardar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function IdentificacionTab({ child }: { child: Child }) {
  const fields = [
    ['Primer nombre', child.firstName], ['Segundo nombre', child.secondName], ['Apellidos', child.lastName],
    ['Apodo', child.nickname], ['Sexo', sexLabel[child.sex]], ['Edad aprox.', child.approximateAge ? `${child.approximateAge} años` : null],
    ['Fecha de nac. est.', child.birthDateEst ? formatDate(child.birthDateEst) : null],
    ['Nacionalidad', child.nationality], ['Estado ID', identityStatusLabel[child.identityStatus]],
  ];
  return (
    <div className="grid grid-cols-2 gap-4">
      {fields.map(([label, value]) => (
        <div key={label as string}>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5">{value || <span className="text-gray-400">—</span>}</p>
        </div>
      ))}
    </div>
  );
}

function FisicoTab({ child }: { child: Child }) {
  const fields = [
    ['Color de piel', child.skinColor], ['Color de ojos', child.eyeColor], ['Color de cabello', child.hairColor],
    ['Estatura', child.heightCm ? `${child.heightCm} cm` : null], ['Peso', child.weightKg ? `${child.weightKg} kg` : null],
    ['Contextura', child.build], ['Señas particulares', child.specialMarks], ['Cicatrices', child.scars], ['Marcas de nacimiento', child.birthmarks],
    ['Observaciones físicas', child.physicalObs],
  ];
  return (
    <div className="grid grid-cols-2 gap-4">
      {fields.map(([label, value]) => (
        <div key={label as string}>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5">{value || <span className="text-gray-400">—</span>}</p>
        </div>
      ))}
    </div>
  );
}

function MedicoTab({ records }: { records: any[] }) {
  if (!records.length) return <p className="text-gray-500 text-sm text-center py-8">Sin registros médicos.</p>;
  return (
    <div className="space-y-4">
      {records.map(r => (
        <div key={r.id} className="border border-gray-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-900">{r.hospital}</p>
            {r.dischargedAt ? <Badge className="bg-green-100 text-green-700">Alta: {formatDate(r.dischargedAt)}</Badge> : <Badge className="bg-purple-100 text-purple-700">Activo</Badge>}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-gray-500">Ingreso</p><p className="font-medium">{formatDate(r.admittedAt)}</p></div>
            <div><p className="text-xs text-gray-500">Diagnóstico</p><p className="font-medium">{r.diagnosis || '—'}</p></div>
            <div><p className="text-xs text-gray-500">Estado de salud</p><p className="font-medium">{r.healthStatus || '—'}</p></div>
            <div><p className="text-xs text-gray-500">Médico</p><p className="font-medium">{r.doctor ? `Dr. ${r.doctor}` : '—'}</p></div>
          </div>
          {r.treatment && <p className="text-sm"><span className="text-gray-500">Tratamiento: </span>{r.treatment}</p>}
        </div>
      ))}
    </div>
  );
}

function TrasladosTab({ transfers }: { transfers: any[] }) {
  if (!transfers.length) return <p className="text-gray-500 text-sm text-center py-8">Sin traslados registrados.</p>;
  return (
    <div className="space-y-3">
      {transfers.map(t => (
        <div key={t.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
            <span className="text-gray-600 truncate">{t.origin}</span>
            <ArrowRight size={14} className="text-blue-500 flex-shrink-0" />
            <span className="text-blue-700 truncate">{t.destination}</span>
          </div>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            <span>Salida: {formatDate(t.departedAt, true)}</span>
            {t.transport && <span>Transporte: {t.transport}</span>}
            {t.responsible && <span>Responsable: {t.responsible}</span>}
          </div>
          {t.reason && <p className="text-xs text-gray-500 mt-1">Motivo: {t.reason}</p>}
        </div>
      ))}
    </div>
  );
}

function FamiliaresTab({ members }: { members: any[] }) {
  if (!members.length) return <p className="text-gray-500 text-sm text-center py-8">Sin familiares registrados.</p>;
  const verifyColors: Record<string, string> = { UNVERIFIED: 'bg-gray-100 text-gray-700', IN_PROCESS: 'bg-yellow-100 text-yellow-700', CONFIRMED: 'bg-green-100 text-green-700' };
  return (
    <div className="space-y-3">
      {members.map(m => (
        <div key={m.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-gray-900">{m.fullName}</p>
              <p className="text-sm text-gray-500">{m.relationship}</p>
            </div>
            <Badge className={verifyColors[m.verifyStatus as string] || ''}>{familyVerifyLabel[m.verifyStatus as keyof typeof familyVerifyLabel]}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
            {m.document && <span className="text-gray-600">CI: {m.document}</span>}
            {m.phone && <span className="text-gray-600">Tel: {m.phone}</span>}
            {m.address && <span className="text-gray-600 col-span-2">Dir: {m.address}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function FotosTab({ photos }: { photos: any[] }) {
  if (!photos.length) return <p className="text-gray-500 text-sm text-center py-8">Sin fotografías.</p>;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {photos.map(p => (
        <div key={p.id} className="relative group">
          <img src={p.url} alt={p.description || 'Foto'} className="w-full h-32 object-cover rounded-lg border border-gray-200" />
          {p.isMain && <Badge className="absolute top-2 left-2 bg-blue-600 text-white text-xs">Principal</Badge>}
          {p.description && <p className="text-xs text-gray-500 mt-1 truncate">{p.description}</p>}
        </div>
      ))}
    </div>
  );
}
