import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import imageCompression from 'browser-image-compression';
import api from '../../api/client';
import { searchApi } from '../../api/endpoints/search';
import { childrenApi } from '../../api/endpoints/children';
import { VENEZUELA_MUNICIPALITIES, VENEZUELA_STATES } from '../../data/venezuela-municipalities';
import {
  Search, AlertTriangle, CheckCircle, Camera, Plus, Trash2,
  Phone, MapPin, User, Heart, ChevronDown, ChevronUp, Building2,
  ArrowLeft, UserCheck, Copy, Download, Share2, QrCode, Calendar, Info,
  LayoutGrid, LayoutList, SlidersHorizontal, MessageCircle
} from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import toast, { Toaster } from 'react-hot-toast';

// ─── Palette ──────────────────────────────────────────────────────
const D = {
  navy:    '#0a1628',
  navy2:   '#0d1f42',
  navy3:   '#1a3a6b',
  blue:    '#3b82f6',
  sky:     '#60a5fa',
  light:   '#f3f4f6',
};

// ─── Schema ───────────────────────────────────────────────────────
const schema = z.object({
  reporterType: z.string().default('RESCUER'),
  rescuerName: z.string().min(2, 'Nombre requerido'),
  rescuerCedula: z.string().min(5, 'Cédula requerida'),
  rescuerPhone: z.string().min(7, 'Celular requerido'),
  rescuerWhatsapp: z.string().min(7, 'WhatsApp requerido'),
  rescueOrg: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  cedula: z.string().optional(),
  sex: z.enum(['MALE', 'FEMALE', 'UNDETERMINED']),
  approximateAge: z.coerce.number().min(0).max(18),
  birthDate: z.string().optional(),
  caseStatus: z.string().optional(),
  state: z.string().min(1, 'Estado requerido'),
  municipality: z.string().min(1, 'Municipio requerido'),
  parish: z.string().optional(),
  foundAddress: z.string().min(3, 'Dirección requerida'),
  destinationHospital: z.string().optional(),
  observations: z.string().optional(),
});

interface ContactEntry {
  name: string; relationship: string; celular: string;
  whatsapp: string; phoneHome: string; cedula: string;
}
const emptyContact = (): ContactEntry => ({
  name: '', relationship: '', celular: '', whatsapp: '', phoneHome: '', cedula: '',
});

// ─── Status helpers ───────────────────────────────────────────────
const statusMap: Record<string, { label: string; cls: string }> = {
  UNIDENTIFIED:     { label: 'Sin identificar',   cls: 'bg-gray-100 text-gray-600' },
  PARTIAL_IDENTITY: { label: 'Identidad parcial', cls: 'bg-yellow-100 text-yellow-700' },
  IDENTIFIED:       { label: 'Identificado',      cls: 'bg-blue-100 text-blue-700' },
  HOSPITALIZED:     { label: 'Hospitalizado',     cls: 'bg-orange-100 text-orange-700' },
  IN_OBSERVATION:   { label: 'En observación',    cls: 'bg-purple-100 text-purple-700' },
  TRANSFERRED:      { label: 'Trasladado',        cls: 'bg-cyan-100 text-cyan-700' },
  REUNIFIED:        { label: 'Reunificado',       cls: 'bg-green-100 text-green-700' },
  MISSING:          { label: 'Desaparecido',      cls: 'bg-red-100 text-red-700' },
  DECEASED:         { label: 'Fallecido',         cls: 'bg-red-100 text-red-700' },
};
const sexLabel: Record<string, string> = {
  MALE: 'Masculino', FEMALE: 'Femenino', UNDETERMINED: 'No determinado',
};

const STATUS_DOT: Record<string, string> = {
  UNIDENTIFIED:     '#94a3b8',
  PARTIAL_IDENTITY: '#eab308',
  IDENTIFIED:       '#3b82f6',
  HOSPITALIZED:     '#f97316',
  IN_OBSERVATION:   '#a855f7',
  TRANSFERRED:      '#06b6d4',
  REUNIFIED:        '#22c55e',
  MISSING:          '#dc2626',
  DECEASED:         '#ef4444',
};

function Badge({ status }: { status: string }) {
  const s = statusMap[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600' };
  return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>;
}

function ChildPhoto({ photos, sex }: { photos?: any[]; sex?: string }) {
  const main = photos?.find((p: any) => p.isMain) ?? photos?.[0];
  if (main) return (
    <img
      src={main.thumbnailUrl ?? main.url}
      className="w-full h-full object-cover"
      alt=""
      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  );
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <User size={26} className={sex === 'MALE' ? 'text-blue-400' : sex === 'FEMALE' ? 'text-pink-400' : 'text-gray-400'} />
    </div>
  );
}

// ─── Physical filter options ──────────────────────────────────────
const SKIN_COLORS  = ['Blanca', 'Clara', 'Trigueña', 'Morena', 'Oscura'];
const HAIR_COLORS  = ['Negro', 'Castaño', 'Rubio', 'Rizado', 'Canoso', 'Pelirrojo'];
const EYE_COLORS   = ['Marrones', 'Negros', 'Verdes', 'Azules', 'Claros', 'Grises'];

// ─── Main component ───────────────────────────────────────────────
export function PublicHomePage() {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();

  const [mode, setMode] = useState<'search' | 'register' | 'success'>('search');
  const [query, setQuery] = useState(() => urlSearchParams.get('q') || '');
  const [searchState, setSearchState] = useState(() => urlSearchParams.get('state') || '');
  const [searchMunicipality, setSearchMunicipality] = useState(() => urlSearchParams.get('municipality') || '');
  const [statusFilter, setStatusFilter] = useState(() => urlSearchParams.get('status') || '');
  const [skinColor, setSkinColor] = useState(() => urlSearchParams.get('skin') || '');
  const [hairColor, setHairColor] = useState(() => urlSearchParams.get('hair') || '');
  const [eyeColor, setEyeColor] = useState(() => urlSearchParams.get('eye') || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const buildApiParams = useCallback((overrides: any = {}) => ({
    q: query || undefined,
    state: searchState || undefined,
    municipality: searchMunicipality || undefined,
    caseStatus: statusFilter || undefined,
    skinColor: skinColor || undefined,
    hairColor: hairColor || undefined,
    eyeColor: eyeColor || undefined,
    page: 1, limit: 20,
    ...overrides,
  }), [query, searchState, searchMunicipality, statusFilter, skinColor, hairColor, eyeColor]);

  const [searchParams, setSearchParams] = useState<any>(() => buildApiParams({
    q: urlSearchParams.get('q') || undefined,
    state: urlSearchParams.get('state') || undefined,
    municipality: urlSearchParams.get('municipality') || undefined,
    caseStatus: urlSearchParams.get('status') || undefined,
  }));
  const [allResults, setAllResults] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reportCaseType, setReportCaseType] = useState<'RESCUED' | 'LOST' | 'HOSPITAL' | 'UNIDENTIFIED'>('RESCUED');
  const [contacts, setContacts] = useState<ContactEntry[]>([emptyContact()]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [registered, setRegistered] = useState<{ code: string; id: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: searchData, isLoading: searching, isFetching } = useQuery({
    queryKey: ['public-search', searchParams],
    queryFn: () => searchApi.search(searchParams),
    enabled: true,
  });

  const { data: stats } = useQuery({
    queryKey: ['public-stats'],
    queryFn: () => searchApi.stats(),
    refetchInterval: 30000,
  });

  // Acumular resultados para "cargar más"
  useEffect(() => {
    if (!searchData?.data) return;
    if (searchParams.page === 1) {
      setAllResults(searchData.data);
    } else {
      setAllResults(prev => [...prev, ...searchData.data]);
    }
  }, [searchData]);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { sex: 'UNDETERMINED', approximateAge: 5, reporterType: 'RESCUER', state: 'Distrito Capital', municipality: 'Libertador' },
  });

  const selectedState = watch('state');
  const municipalities = VENEZUELA_MUNICIPALITIES[selectedState] ?? [];

  const syncUrl = useCallback((params: any) => {
    const p = new URLSearchParams();
    if (params.q)            p.set('q', params.q);
    if (params.state)        p.set('state', params.state);
    if (params.municipality) p.set('municipality', params.municipality);
    if (params.caseStatus)   p.set('status', params.caseStatus);
    if (params.skinColor)    p.set('skin', params.skinColor);
    if (params.hairColor)    p.set('hair', params.hairColor);
    if (params.eyeColor)     p.set('eye', params.eyeColor);
    setUrlSearchParams(p, { replace: true });
  }, [setUrlSearchParams]);

  const handleSearch = useCallback(() => {
    const params = {
      q: query || undefined,
      state: searchState || undefined,
      municipality: searchMunicipality || undefined,
      caseStatus: statusFilter || undefined,
      skinColor: skinColor || undefined,
      hairColor: hairColor || undefined,
      eyeColor: eyeColor || undefined,
      page: 1, limit: 20,
    };
    setSearchParams(params);
    syncUrl(params);
  }, [query, searchState, searchMunicipality, statusFilter, skinColor, hairColor, eyeColor, syncUrl]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = { ...buildApiParams(), q: val || undefined, page: 1 };
      setSearchParams(params);
      syncUrl(params);
    }, 600);
  };

  const handleStatusFilter = useCallback((status: string) => {
    setStatusFilter(status);
    const params = { ...buildApiParams(), caseStatus: status || undefined, page: 1 };
    setSearchParams(params);
    syncUrl(params);
  }, [buildApiParams, syncUrl]);

  const loadMore = () => {
    setSearchParams((prev: any) => ({ ...prev, page: (prev.page || 1) + 1 }));
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });
      setPhotoFile(compressed);
      const r = new FileReader();
      r.onload = ev => setPhotoPreview(ev.target?.result as string);
      r.readAsDataURL(compressed);
    } catch {
      setPhotoFile(file);
      const r = new FileReader();
      r.onload = ev => setPhotoPreview(ev.target?.result as string);
      r.readAsDataURL(file);
    } finally {
      setCompressing(false);
    }
  };

  const updateContact = (i: number, field: keyof ContactEntry, val: string) =>
    setContacts(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c));

  const onSubmit = async (data: any) => {
    try {
      const payload: any = { ...data };
      contacts.forEach((c, i) => {
        if (!c.name) return;
        const n = i + 1;
        payload[`contact${n}Name`] = c.name;
        payload[`contact${n}Relationship`] = c.relationship;
        payload[`contact${n}Phone`] = c.celular;
        payload[`contact${n}Whatsapp`] = c.whatsapp;
        payload[`contact${n}PhoneHome`] = c.phoneHome;
        payload[`contact${n}Cedula`] = c.cedula;
      });
      const child = await childrenApi.quickRegisterJson(payload);
      if (photoFile && child.id) {
        const fd = new window.FormData();
        fd.append('photo', photoFile);
        fd.append('description', 'Foto principal');
        const res = await fetch(`/api/children/${child.id}/photos`, { method: 'POST', body: fd });
        if (!res.ok) toast.error('El niño se registró pero la foto no se pudo subir. Puedes agregarla luego.');
      }
      setRegistered({ code: child.code, id: child.id });
      setMode('success');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Error al registrar. Verifique los datos.');
    }
  };

  // ── Success ───────────────────────────────────────────────────────
  if (mode === 'success' && registered) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: D.light }}>
        <Header />
        <Toaster position="top-right" />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center border border-gray-100">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={44} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Registrado exitosamente</h2>
            <p className="text-sm text-gray-500 mt-1.5">El niño/niña ha sido ingresado al sistema</p>

            <div className="mt-6 p-5 rounded-2xl border border-blue-100" style={{ background: '#eff6ff' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: D.blue }}>Código asignado</p>
              <p className="text-4xl font-bold font-mono mt-1" style={{ color: D.navy2 }}>{registered.code}</p>
              <p className="text-xs text-blue-400 mt-2">Anote este código — las autoridades pueden localizar el expediente con él.</p>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <button onClick={() => { setRegistered(null); setMode('register'); setPhotoPreview(null); setPhotoFile(null); setContacts([emptyContact()]); }}
                className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 text-sm"
                style={{ background: `linear-gradient(135deg, ${D.blue}, ${D.navy3})` }}>
                Registrar otro niño / niña
              </button>
              <button onClick={() => { setMode('search'); setQuery(registered.code); setSearchParams({ q: registered.code, page: 1, limit: 20 }); }}
                className="w-full py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all text-sm">
                Ver en el buscador
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Register form ─────────────────────────────────────────────────
  const caseTypeConfig = {
    RESCUED:     { label: 'Rescatado/a',    emoji: '🆘', status: 'UNIDENTIFIED',  locLabel: 'Lugar donde fue encontrado/a',  color: '#dc2626' },
    LOST:        { label: 'Perdido/a',      emoji: '🔍', status: 'UNIDENTIFIED',  locLabel: 'Último lugar donde fue visto/a', color: '#d97706' },
    HOSPITAL:    { label: 'En hospital',    emoji: '🏥', status: 'HOSPITALIZED',  locLabel: 'Ubicación del hospital',         color: '#7c3aed' },
    UNIDENTIFIED:{ label: 'Sin identificar',emoji: '❓', status: 'UNIDENTIFIED',  locLabel: 'Lugar donde fue encontrado/a',  color: '#475569' },
  } as const;
  const currentCase = caseTypeConfig[reportCaseType];

  if (mode === 'register') {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: D.light }}>
        <Header />
        <Toaster position="top-right" />
        <div className="max-w-2xl mx-auto w-full px-4 py-6 pb-20">

          <button onClick={() => setMode('search')}
            className="flex items-center gap-1.5 text-sm mb-5 transition-colors hover:opacity-70" style={{ color: D.blue }}>
            <ArrowLeft size={15} /> Volver
          </button>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-2xl font-black" style={{ color: D.navy }}>Registrar Niño / Niña</h2>
            <p className="text-sm text-gray-400 mt-0.5">Rescatado, perdido, sin identificar o en hospital</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* ── 1. Tipo de caso ── */}
            <FCard icon={<AlertTriangle size={17} style={{ color: '#f59e0b' }} />} title="Tipo de caso">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.entries(caseTypeConfig) as [typeof reportCaseType, typeof currentCase][]).map(([key, cfg]) => (
                  <button key={key} type="button"
                    onClick={() => { setReportCaseType(key); setValue('caseStatus', cfg.status); }}
                    className={`flex flex-col items-center gap-2 py-4 px-2 rounded-xl border-2 transition-all text-center ${
                      reportCaseType === key
                        ? 'bg-blue-50 border-blue-400 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                    <span className="text-2xl leading-none">{cfg.emoji}</span>
                    <span className="text-xs font-bold leading-tight" style={{ color: reportCaseType === key ? D.blue : '#6b7280' }}>
                      {cfg.label}
                    </span>
                  </button>
                ))}
              </div>
              {reportCaseType === 'LOST' && (
                <p className="mt-3 text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2 flex items-center gap-1.5">
                  <AlertTriangle size={12} /> Para niños reportados como desaparecidos — complete todos los datos disponibles.
                </p>
              )}
            </FCard>

            {/* ── 2. Quien reporta ── */}
            <FCard icon={<UserCheck size={17} style={{ color: D.blue }} />} title="¿Quién reporta? (datos obligatorios)">
              <div className="flex gap-1.5 mb-5 p-1 bg-gray-100 rounded-xl">
                {([['RESCUER','Rescatista'],['FAMILY','Familiar'],['VOLUNTEER','Voluntario'],['CITIZEN','Ciudadano']] as [string,string][]).map(([val, label]) => (
                  <button key={val} type="button"
                    onClick={() => setValue('reporterType', val)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                      watch('reporterType') === val ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <FInput {...register('rescuerName')} label="Nombre completo *" placeholder="Su nombre completo" error={errors.rescuerName?.message} />
                </div>
                <FInput {...register('rescuerCedula')} label="Cédula de identidad *" placeholder="V-12345678" error={errors.rescuerCedula?.message} />
                <FInput {...register('rescueOrg')} label="Organismo / Brigada" placeholder="Protección Civil, Cruz Roja..." />
                <FInput {...register('rescuerPhone')} label="Teléfono celular *" placeholder="04XX-XXXXXXX" type="tel" error={errors.rescuerPhone?.message} />
                <FInput {...register('rescuerWhatsapp')} label="WhatsApp *" placeholder="04XX-XXXXXXX" type="tel" error={errors.rescuerWhatsapp?.message} />
              </div>
            </FCard>

            {/* ── 3. Foto ── */}
            <FCard icon={<Camera size={17} style={{ color: '#0891b2' }} />} title="Fotografía del niño/a">
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              {compressing ? (
                <div className="w-full flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50">
                  <span className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-blue-500 font-medium">Optimizando imagen...</p>
                </div>
              ) : photoPreview ? (
                <div className="flex items-center gap-4">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-green-200">
                    <img src={photoPreview} className="w-full h-full object-cover" alt="preview" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-600 flex items-center gap-1.5 mb-2">
                      <CheckCircle size={15} /> Foto agregada
                    </p>
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="px-4 py-2 text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all flex items-center gap-2">
                      <Camera size={13} /> Cambiar foto
                    </button>
                    <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                      className="mt-1.5 px-4 py-2 text-sm text-red-400 hover:text-red-600 rounded-xl transition-all flex items-center gap-2">
                      <Trash2 size={13} /> Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => !compressing && fileRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-3 py-8 border-2 border-dashed border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all group">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-100 group-hover:bg-blue-100 transition-all">
                    <Camera size={26} className="text-gray-300 group-hover:text-blue-400 transition-all" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-600">Agregar fotografía</p>
                    <p className="text-xs text-gray-400 mt-0.5">Tomar con cámara o seleccionar de galería · Muy importante para identificación</p>
                  </div>
                </button>
              )}
            </FCard>

            {/* ── 4. Datos del niño/a ── */}
            <FCard icon={<Heart size={17} style={{ color: '#e11d48' }} />} title="Datos del niño / niña">
              <div className="grid grid-cols-2 gap-3">
                <FInput {...register('firstName')} label="Nombre (si se conoce)" placeholder="Nombre" />
                <FInput {...register('lastName')} label="Apellido (si se conoce)" placeholder="Apellido" />
                <FInput {...register('cedula')} label="Cédula del niño/a" placeholder="V-28XXXXXXX" />
                <FInput {...register('birthDate')} label="Fecha de nacimiento" type="date" />
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Sexo *</label>
                  <select {...register('sex')} className={fSelect}>
                    <option value="UNDETERMINED">No determinado</option>
                    <option value="MALE">Masculino</option>
                    <option value="FEMALE">Femenino</option>
                  </select>
                </div>
                <FInput {...register('approximateAge')} label="Edad aproximada *" type="number" min="0" max="18" error={errors.approximateAge?.message} />
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Estado actual</label>
                  <select {...register('caseStatus')} className={fSelect}>
                    <option value="UNIDENTIFIED">Sin identificar</option>
                    <option value="MISSING">Desaparecido/a</option>
                    <option value="PARTIAL_IDENTITY">Identidad parcial</option>
                    <option value="IDENTIFIED">Identificado/a</option>
                    <option value="HOSPITALIZED">Hospitalizado/a</option>
                    <option value="IN_OBSERVATION">En observación</option>
                    <option value="TRANSFERRED">Trasladado/a</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Descripción física y señas particulares</label>
                  <textarea {...register('observations')} rows={3}
                    placeholder="Tez, estatura, color y largo de cabello, ropa que llevaba, lunares, cicatrices, condición médica, idioma..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none text-gray-700 placeholder:text-gray-300" />
                </div>
              </div>
            </FCard>

            {/* ── 5. Ubicación ── */}
            <FCard icon={<MapPin size={17} style={{ color: '#16a34a' }} />} title={currentCase.locLabel}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Estado *</label>
                  <select {...register('state')} onChange={e => { setValue('state', e.target.value); setValue('municipality', ''); }} className={fSelect}>
                    {VENEZUELA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Municipio *</label>
                  <select {...register('municipality')} className={fSelect}>
                    <option value="">Seleccione...</option>
                    {municipalities.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  {errors.municipality && <p className="text-xs text-red-500 mt-1">{errors.municipality.message}</p>}
                </div>
                <FInput {...register('parish')} label="Parroquia / Sector" placeholder="Opcional" />
                <div className="col-span-2">
                  <FInput {...register('foundAddress')} label="Dirección o punto de referencia *"
                    placeholder={reportCaseType === 'LOST' ? 'Calle, sector, edificio o punto de referencia donde fue visto por última vez...' : 'Calle, sector, edificio, punto de referencia...'}
                    error={errors.foundAddress?.message} />
                </div>
              </div>
            </FCard>

            {/* ── 6. Hospital / refugio (siempre visible) ── */}
            <FCard icon={<Building2 size={17} style={{ color: '#7c3aed' }} />}
              title={reportCaseType === 'HOSPITAL' ? 'Hospital o centro médico *' : 'Hospital o refugio de destino'}>
              <FInput {...register('destinationHospital')}
                label={reportCaseType === 'HOSPITAL' ? 'Nombre del hospital / clínica *' : 'Hospital, clínica o refugio (si aplica)'}
                placeholder="Ej: Hospital Universitario de Caracas, Centro de Acopio..."
                error={errors.destinationHospital?.message} />
            </FCard>

            {/* ── 7. Contactos familiares ── */}
            <FCard icon={<Phone size={17} style={{ color: '#0891b2' }} />} title="Contactos familiares o de referencia">
              <p className="text-xs text-gray-400 mb-4">Personas que pueden dar información o ser notificadas sobre el niño/a</p>
              {contacts.map((contact, i) => (
                <div key={i} className={i > 0 ? 'mt-5 pt-5 border-t border-gray-100' : ''}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">Contacto {i + 1}</span>
                    {i > 0 && (
                      <button type="button" onClick={() => setContacts(p => p.filter((_, j) => j !== i))}
                        className="text-red-400 hover:text-red-600 transition-colors flex items-center gap-1 text-xs">
                        <Trash2 size={13} /> Eliminar
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      ['name', 'Nombre completo', 'Nombre del contacto', 'text'],
                      ['relationship', 'Parentesco / Relación', 'madre, padre, abuelo, vecino...', 'text'],
                      ['cedula', 'Cédula', 'V-12345678', 'text'],
                      ['celular', 'Teléfono celular', '04XX-XXXXXXX', 'tel'],
                      ['whatsapp', 'WhatsApp', '04XX-XXXXXXX', 'tel'],
                      ['phoneHome', 'Teléfono fijo / casa', '0212-XXXXXXX', 'tel'],
                    ] as [keyof ContactEntry, string, string, string][]).map(([field, label, ph, type]) => (
                      <PInput key={field} label={label} value={contact[field]} onChange={v => updateContact(i, field, v)} placeholder={ph} type={type} />
                    ))}
                  </div>
                </div>
              ))}
              {contacts.length < 3 && (
                <button type="button" onClick={() => setContacts(p => [...p, emptyContact()])}
                  className="mt-4 flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70" style={{ color: D.blue }}>
                  <Plus size={15} /> Agregar otro contacto
                </button>
              )}
            </FCard>

            <button type="submit" disabled={isSubmitting}
              className="w-full py-4 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-3 shadow-lg transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${currentCase.color}, ${D.navy})` }}>
              {isSubmitting
                ? <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Registrando...</>
                : <>{currentCase.emoji} REGISTRAR — {currentCase.label.toUpperCase()}</>
              }
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Search / Home ─────────────────────────────────────────────────
  const total        = stats?.total        ?? 0;
  const hospitalized = stats?.hospitalized ?? 0;
  const reunified    = stats?.reunified    ?? 0;
  const hasActiveSearch = !!(searchParams.q || searchParams.state || searchParams.caseStatus || searchParams.skinColor || searchParams.hairColor || searchParams.eyeColor);
  const hasMore = searchData ? allResults.length < searchData.total : false;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: D.light }}>
      <Toaster position="top-right" />
      <Header onRegister={() => setMode('register')} />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${D.navy} 0%, ${D.navy2} 60%, ${D.navy3} 100%)` }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 blur-3xl"
            style={{ background: D.sky, transform: 'translate(25%, -25%)' }} />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full opacity-8 blur-3xl"
            style={{ background: D.blue, transform: 'translate(-25%, 25%)' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-10">
          {/* Title + stats in one row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Sistema de Registro<br />
                <span style={{ color: D.sky }}>Niños Rescatados</span>
              </h1>
              <p className="text-sm mt-2" style={{ color: '#94b4d4' }}>
                Venezuela · Emergencia Nacional
              </p>
            </div>
            {/* Stats inline */}
            <div className="flex gap-6 sm:gap-8">
              {[
                { n: total,        label: 'Registrados',    color: D.sky },
                { n: hospitalized, label: 'Hospitalizados', color: '#fdba74' },
                { n: reunified,    label: 'Reunificados',   color: '#86efac' },
              ].map(({ n, label, color }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-black" style={{ color }}>{n}</p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: '#4a7ab5' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-1 flex flex-col gap-1">
            {/* Fila 1: input */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input type="text" placeholder="Buscar por código, nombre o cédula..."
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 bg-white/10 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:bg-white/20 transition-all"
              />
            </div>
            {/* Fila 2: selects + botón */}
            <div className="flex gap-1">
              <select value={searchState} onChange={e => { setSearchState(e.target.value); setSearchMunicipality(''); }}
                className="flex-1 min-w-0 px-3 py-2.5 bg-white/10 rounded-xl text-sm text-white/70 focus:outline-none focus:bg-white/20 transition-all">
                <option value="" className="text-gray-800">Estado</option>
                {VENEZUELA_STATES.map(s => <option key={s} value={s} className="text-gray-800">{s}</option>)}
              </select>
              <select value={searchMunicipality} onChange={e => setSearchMunicipality(e.target.value)} disabled={!searchState}
                className="flex-1 min-w-0 px-3 py-2.5 bg-white/10 rounded-xl text-sm text-white/70 focus:outline-none focus:bg-white/20 transition-all disabled:opacity-30">
                <option value="" className="text-gray-800">Municipio</option>
                {(VENEZUELA_MUNICIPALITIES[searchState] ?? []).map(m => <option key={m} value={m} className="text-gray-800">{m}</option>)}
              </select>
              <button onClick={handleSearch} disabled={isFetching}
                className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 flex-shrink-0"
                style={{ background: D.blue }}>
                {isFetching ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search size={14} />}
                <span className="hidden sm:inline">Buscar</span>
              </button>
              {(query || searchState || skinColor || hairColor || eyeColor) && (
                <button onClick={() => {
                  setQuery(''); setSearchState(''); setSearchMunicipality('');
                  setSkinColor(''); setHairColor(''); setEyeColor(''); setStatusFilter('');
                  const p = { page: 1, limit: 20 };
                  setSearchParams(p); setUrlSearchParams({}, { replace: true });
                }}
                  className="px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all flex-shrink-0">
                  ✕
                </button>
              )}
            </div>
          </div>
          {/* Filtros físicos */}
          <div className="mt-1">
            <button onClick={() => setShowAdvanced(v => !v)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all ${
                showAdvanced || skinColor || hairColor || eyeColor
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/10'
              }`}>
              <SlidersHorizontal size={12} />
              Filtros físicos
              {(skinColor || hairColor || eyeColor) && (
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
              )}
            </button>

            {showAdvanced && (
              <div className="mt-2 p-3 bg-white/10 rounded-xl grid grid-cols-3 gap-2">
                {([
                  { label: 'Tez / Piel', opts: SKIN_COLORS, val: skinColor, set: setSkinColor, key: 'skin' },
                  { label: 'Cabello', opts: HAIR_COLORS, val: hairColor, set: setHairColor, key: 'hair' },
                  { label: 'Ojos', opts: EYE_COLORS, val: eyeColor, set: setEyeColor, key: 'eye' },
                ] as const).map(({ label, opts, val, set }) => (
                  <div key={label}>
                    <p className="text-xs text-white/50 mb-1 font-medium">{label}</p>
                    <select value={val} onChange={e => { set(e.target.value); }}
                      className="w-full px-2 py-2 bg-white/10 rounded-lg text-xs text-white/80 focus:outline-none focus:bg-white/20">
                      <option value="" className="text-gray-800">Cualquiera</option>
                      {opts.map(o => <option key={o} value={o} className="text-gray-800">{o}</option>)}
                    </select>
                  </div>
                ))}
                <div className="col-span-3 flex justify-end mt-1">
                  <button onClick={handleSearch}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: D.blue }}>
                    Aplicar filtros físicos
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────── */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">

        {/* Toolbar: pills + register btn */}
        <div className="mb-5">
          {/* Pills con scroll horizontal en móvil */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { value: '',             label: 'Todos',           dot: '' },
              { value: 'UNIDENTIFIED', label: 'Sin identificar', dot: '#94a3b8' },
              { value: 'HOSPITALIZED', label: 'En hospital',     dot: '#f97316' },
              { value: 'IDENTIFIED',   label: 'Identificados',   dot: '#3b82f6' },
              { value: 'REUNIFIED',    label: 'Reunificados',    dot: '#22c55e' },
            ].map(({ value, label, dot }) => (
              <button key={value} onClick={() => handleStatusFilter(value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap flex-shrink-0 ${
                  statusFilter === value
                    ? 'border-transparent text-white shadow-sm'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
                style={statusFilter === value ? { background: D.navy } : {}}>
                {dot && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusFilter === value ? '#fff' : dot }} />}
                {label}
              </button>
            ))}
            <span className="text-xs text-gray-400 whitespace-nowrap ml-2 flex-shrink-0">
              {searchData?.total != null && <>{searchData.total} registro{searchData.total !== 1 ? 's' : ''}</>}
            </span>
          </div>
          {/* Fila 2: registrar + toggle vista */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1 bg-white rounded-xl p-0.5 border border-gray-200 shadow-sm">
              <button onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                title="Vista cuadrícula">
                <LayoutGrid size={15} />
              </button>
              <button onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                title="Vista lista">
                <LayoutList size={15} />
              </button>
            </div>
            <button onClick={() => setMode('register')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
              <Plus size={14} /> Registrar niño/niña
            </button>
          </div>
        </div>

        {/* Grid de resultados */}
        <div className="min-h-[420px]">
          {searching && searchParams.page === 1 ? (
            <div className="flex justify-center py-20">
              <span className="w-9 h-9 border-4 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: `${D.blue} transparent transparent transparent` }} />
            </div>
          ) : allResults.length > 0 ? (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {allResults.map((child: any) => (
                    <ChildGridCard key={child.id} child={child}
                      selected={expandedId === child.id}
                      onClick={() => setExpandedId(expandedId === child.id ? null : child.id)} />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {allResults.map((child: any) => (
                    <ChildListRow key={child.id} child={child}
                      onClick={() => setExpandedId(expandedId === child.id ? null : child.id)} />
                  ))}
                </div>
              )}
              {hasMore && (
                <div className="flex justify-center mt-6">
                  <button onClick={loadMore} disabled={isFetching}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border-2 border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-all disabled:opacity-50">
                    {isFetching
                      ? <><span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> Cargando...</>
                      : <>Cargar más <span className="text-gray-400">({allResults.length} de {searchData?.total})</span></>
                    }
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#eff6ff' }}>
                <Search size={28} style={{ color: D.blue }} />
              </div>
              <p className="font-semibold text-gray-700 text-lg">
                {hasActiveSearch ? 'Sin resultados' : 'Aún no hay registros'}
              </p>
              <p className="text-sm text-gray-400 mt-1 mb-6 max-w-xs">
                {hasActiveSearch
                  ? 'Prueba con otro nombre, código, estado o cambia el filtro de situación'
                  : 'Sé el primero en registrar un niño o niña rescatado, perdido o en hospital'}
              </p>
              <button onClick={() => setMode('register')}
                className="px-6 py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                + Registrar ahora
              </button>
            </div>
          )}
        </div>

        {/* Modal */}
        {expandedId && (() => {
          const selected = allResults.find((c: any) => c.id === expandedId);
          return selected ? <ChildModal child={selected} onClose={() => setExpandedId(null)} /> : null;
        })()}
      </div>

      {/* ── Footer strip ─────────────────────────────────────── */}
      <div style={{ background: D.navy }}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: D.sky }}>Personal autorizado</p>
              <p className="text-xs text-white/40">Si eres personal del sistema (hospital, rescatista registrado), accede al panel completo.</p>
              <a href="/login" className="text-xs font-semibold mt-2 block hover:opacity-70 transition-opacity" style={{ color: D.sky }}>
                Acceder al panel →
              </a>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: D.sky }}>Sobre el sistema</p>
              <p className="text-xs text-white/40">Registro y seguimiento de niños y niñas rescatados durante la emergencia nacional de Venezuela.</p>
            </div>
            <div className="sm:flex sm:justify-end">
              <ShareSection compact />
            </div>
          </div>
          {/* Disclaimer legal */}
          <div className="border-t mt-6 pt-5 text-center" style={{ borderColor: '#1e3a6b' }}>
            <p className="text-xs font-semibold mb-2 text-white">Aviso Legal</p>
            <p className="text-xs leading-relaxed text-white/60 max-w-2xl mx-auto">
              Esta plataforma es una iniciativa ciudadana, sin fines de lucro.
              La información registrada está a disposición de las autoridades competentes.
              Los administradores no se hacen responsables por daños o perjuicios ocasionados por el uso indebido de la misma.
              Verifica siempre la información antes de difundirla.
            </p>
            <p className="text-xs mt-3 text-white/40">
              ¿Tienes alguna duda o problema con el sitio?{' '}
              <a href="mailto:support@dinapos.cloud"
                className="text-white/70 hover:text-white transition-colors font-medium">
                support@dinapos.cloud
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────
function Header({ onRegister }: { onRegister?: () => void }) {
  return (
    <header className="sticky top-0 z-50 px-5 py-3 flex items-center justify-between shadow-lg"
      style={{ background: D.navy }}>
      <div className="flex items-center gap-3">
        <span className="text-xl">🇻🇪</span>
        <div>
          <p className="font-black text-base tracking-tight leading-tight">
            <span className="text-white">RESCATE</span>
            <span style={{ color: D.sky }}> VENEZUELA</span>
          </p>
          <p className="text-xs font-medium" style={{ color: '#4a7ab5' }}>Niños y Niñas Rescatados</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onRegister && (
          <button onClick={onRegister}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-white text-xs transition-all hover:opacity-90"
            style={{ background: '#dc2626' }}>
            <Plus size={13} /> Registrar
          </button>
        )}
      </div>
    </header>
  );
}

// ─── Child modal ──────────────────────────────────────────────────
function ChildModal({ child, onClose }: { child: any; onClose: () => void }) {
  const mainPhoto = child.photos?.find((p: any) => p.isMain) ?? child.photos?.[0];
  const name = [child.firstName, child.lastName].filter(Boolean).join(' ') || 'Sin nombre registrado';
  const status = statusMap[child.caseStatus] ?? { label: child.caseStatus, cls: 'bg-gray-100 text-gray-600' };
  const dotColor = STATUS_DOT[child.caseStatus] ?? '#94a3b8';
  const dateStr = child.createdAt
    ? new Date(child.createdAt).toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const [imgError, setImgError] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [confirmNotes, setConfirmNotes] = useState('');
  const [confirmSaving, setConfirmSaving] = useState(false);
  const [confirmDone, setConfirmDone] = useState(false);

  const handleConfirm = async () => {
    if (!newStatus) return;
    setConfirmSaving(true);
    try {
      await api.patch(`/children/${child.id}/status`, { caseStatus: newStatus, observations: confirmNotes || undefined });
      setConfirmDone(true);
      setTimeout(onClose, 2000);
    } catch {
      toast.error('No se pudo actualizar. Intente de nuevo.');
    } finally {
      setConfirmSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(10,22,40,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[92vh]"
        onClick={e => e.stopPropagation()}>

        {/* Drag handle — mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Photo header */}
        <div className="relative h-56 bg-gray-100">
          {mainPhoto && !imgError ? (
            <img src={mainPhoto.url ?? mainPhoto.thumbnailUrl} className="w-full h-full object-cover" alt=""
              onError={() => setImgError(true)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl font-bold"
              style={{ background: `linear-gradient(135deg, ${D.navy} 0%, ${D.navy3} 100%)`, color: D.sky }}>
              {([child.firstName?.[0], child.lastName?.[0]].filter(Boolean).join('').toUpperCase()) || '?'}
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,22,40,0.7) 0%, transparent 50%)' }} />
          {/* Close button */}
          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:bg-white transition-all shadow-sm">
            ✕
          </button>
          {/* Code */}
          <div className="absolute bottom-3 left-4">
            <span className="font-mono font-bold text-sm px-3 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', color: '#fff' }}>
              {child.code}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Name + status */}
          <div className="flex items-start justify-between gap-2 mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 leading-tight">{name}</h3>
              <p className="text-sm text-gray-400 mt-0.5">
                {sexLabel[child.sex] ?? child.sex}
                {child.approximateAge != null && ` · ~${child.approximateAge} años`}
              </p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 mt-1"
              style={{ background: `${dotColor}18`, color: dotColor }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor }} />
              {status.label}
            </span>
          </div>

          {/* Details grid */}
          <div className="space-y-3 text-sm">
            {child.findLocation && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#eff6ff' }}>
                  <MapPin size={13} style={{ color: D.blue }} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Encontrado en</p>
                  <p className="text-gray-700">{child.findLocation.address || `${child.findLocation.municipality}, ${child.findLocation.state}`}</p>
                </div>
              </div>
            )}
            {child.currentLocation?.hospital && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#f5f3ff' }}>
                  <Building2 size={13} style={{ color: '#7c3aed' }} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Ubicación actual</p>
                  <p className="text-gray-700">{child.currentLocation.hospital}</p>
                </div>
              </div>
            )}
            {child.rescuerName && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#f0fdf4' }}>
                  <User size={13} style={{ color: '#16a34a' }} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Registrado por</p>
                  <p className="text-gray-700">{child.rescuerName}{child.rescueOrg ? ` — ${child.rescueOrg}` : ''}</p>
                  {child.rescuerPhone && (
                    <a href={`tel:${child.rescuerPhone}`} className="text-xs flex items-center gap-1 mt-0.5 hover:opacity-70" style={{ color: D.blue }}>
                      <Phone size={10} /> {child.rescuerPhone}
                    </a>
                  )}
                </div>
              </div>
            )}
            {child.observations && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#fff7ed' }}>
                  <AlertTriangle size={13} style={{ color: '#f97316' }} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Observaciones</p>
                  <p className="text-gray-700">{child.observations}</p>
                </div>
              </div>
            )}
            {dateStr && (
              <div className="flex items-center gap-2.5 pt-1 border-t border-gray-100">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: D.light }}>
                  <Calendar size={13} className="text-gray-400" />
                </div>
                <p className="text-xs text-gray-400">Registrado el {dateStr}</p>
              </div>
            )}
          </div>

          {/* ── Compartir ── */}
          <div className="mt-4 flex gap-2">
            <button onClick={() => {
              const nameStr = [child.firstName, child.lastName].filter(Boolean).join(' ') || 'Sin nombre registrado';
              const loc = child.findLocation ? `${child.findLocation.municipality}, ${child.findLocation.state}` : '';
              const url = `${window.location.origin}/?q=${child.code}`;
              const text = `🆘 Niño/a encontrado — ${nameStr}\nCódigo: *${child.code}*\nEstado: ${statusMap[child.caseStatus]?.label ?? child.caseStatus}${loc ? `\nUbicación: ${loc}` : ''}\nVer ficha completa: ${url}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: '#25d366' }}>
              <MessageCircle size={15} /> WhatsApp
            </button>
            <button onClick={() => {
              const url = `${window.location.origin}/?q=${child.code}`;
              navigator.clipboard.writeText(url);
              toast.success('Enlace copiado');
            }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all">
              <Copy size={14} /> Copiar enlace
            </button>
          </div>

          {/* ── Confirmar situación ── */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            {confirmDone ? (
              <div className="flex items-center gap-2 py-3 px-4 bg-green-50 rounded-xl">
                <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                <p className="text-sm font-semibold text-green-700">Situación actualizada correctamente</p>
              </div>
            ) : !confirmOpen ? (
              <button onClick={() => setConfirmOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 border-dashed border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all">
                <CheckCircle size={15} /> Tengo información — actualizar situación
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-600">¿Cuál es la nueva situación del niño/a?</p>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-700">
                  <option value="">Seleccionar nueva situación...</option>
                  <option value="IDENTIFIED">✅ Identificado/a — se conoce su identidad</option>
                  <option value="REUNIFIED">🏠 Reunificado/a — con su familia</option>
                  <option value="HOSPITALIZED">🏥 Hospitalizado/a — en centro médico</option>
                  <option value="IN_OBSERVATION">👁️ En observación médica</option>
                  <option value="TRANSFERRED">🚑 Trasladado/a a otro centro</option>
                  <option value="PARTIAL_IDENTITY">🔎 Identidad parcial confirmada</option>
                  <option value="MISSING">🔴 Desaparecido/a — sin ubicación conocida</option>
                </select>
                <textarea value={confirmNotes} onChange={e => setConfirmNotes(e.target.value)} rows={2}
                  placeholder="Información adicional (opcional): hospital, nombre confirmado, familiar que lo reclamó..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none text-gray-700 placeholder:text-gray-300" />
                <div className="flex gap-2">
                  <button onClick={() => setConfirmOpen(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all">
                    Cancelar
                  </button>
                  <button onClick={handleConfirm} disabled={!newStatus || confirmSaving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{ background: `linear-gradient(135deg, ${D.blue}, ${D.navy3})` }}>
                    {confirmSaving
                      ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Guardando...</>
                      : <><CheckCircle size={14} /> Confirmar</>
                    }
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Avatar colors ────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: '#dbeafe', text: '#1e40af' },
  { bg: '#fef9c3', text: '#92400e' },
  { bg: '#fce7f3', text: '#9d174d' },
  { bg: '#d1fae5', text: '#065f46' },
  { bg: '#ede9fe', text: '#4c1d95' },
  { bg: '#ffedd5', text: '#c2410c' },
  { bg: '#e0f2fe', text: '#0369a1' },
  { bg: '#fef3c7', text: '#b45309' },
];

// ─── Grid card ────────────────────────────────────────────────────
function ChildGridCard({ child, selected, onClick }: { child: any; selected: boolean; onClick: () => void }) {
  const first = child.firstName?.[0] ?? '';
  const last  = child.lastName?.[0]  ?? '';
  const initials = ((first + last).toUpperCase() || child.code?.slice(4, 6)) ?? '?';
  const colorIdx = child.code ? child.code.charCodeAt(4) % AVATAR_COLORS.length : 0;
  const colors = AVATAR_COLORS[colorIdx];
  const [imgError, setImgError] = useState(false);
  const mainPhoto = child.photos?.find((p: any) => p.isMain) ?? child.photos?.[0];
  const name = [child.firstName, child.lastName].filter(Boolean).join(' ') || null;
  const status = statusMap[child.caseStatus] ?? { label: child.caseStatus, cls: 'bg-gray-100 text-gray-600' };
  const dotColor = STATUS_DOT[child.caseStatus] ?? '#94a3b8';
  const location = child.findLocation?.municipality ?? null;
  const dateStr = child.createdAt
    ? new Date(child.createdAt).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <div onClick={onClick}
      className={`bg-white rounded-2xl border overflow-hidden cursor-pointer transition-all hover:shadow-md ${
        selected ? 'border-blue-400 shadow-md ring-2 ring-blue-100' : 'border-gray-100 shadow-sm'
      }`}>
      {/* Photo / Avatar */}
      <div className="relative" style={{ aspectRatio: '1 / 1' }}>
        {mainPhoto && !imgError ? (
          <img src={mainPhoto.thumbnailUrl ?? mainPhoto.url}
            className="w-full h-full object-cover" alt=""
            onError={() => setImgError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl font-bold"
            style={{ background: colors.bg, color: colors.text }}>
            {initials}
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <span className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm"
            style={{ color: dotColor }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dotColor }} />
            {status.label}
          </span>
        </div>
        {/* Info */}
        <div className="absolute top-2 right-2 w-6 h-6 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
          <Info size={11} className="text-gray-400" />
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-bold text-gray-900 text-sm leading-tight truncate">
          {name ?? <span className="italic text-gray-300 text-xs font-normal">Sin nombre</span>}
        </p>
        {child.approximateAge != null
          ? <p className="text-xs text-gray-500 mt-0.5">{child.approximateAge} años</p>
          : <p className="text-xs text-gray-300 mt-0.5">Edad no indicada</p>
        }
        {location && (
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1 truncate">
            <MapPin size={9} className="flex-shrink-0" /> {location}
          </p>
        )}
        {/* Código con botón copiar */}
        <button
          onClick={e => {
            e.stopPropagation();
            navigator.clipboard.writeText(child.code);
            toast.success('Código copiado');
          }}
          className="mt-1.5 flex items-center gap-1 text-xs font-mono text-gray-400 hover:text-blue-500 transition-colors group w-full">
          <span className="truncate">{child.code}</span>
          <Copy size={9} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );
}

// ─── Result card ──────────────────────────────────────────────────
function ResultCard({ child, expanded, onToggle }: { child: any; expanded: boolean; onToggle: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left">
        <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-blue-50">
          <ChildPhoto photos={child.photos} sex={child.sex} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-bold font-mono text-sm" style={{ color: D.blue }}>{child.code}</span>
            <Badge status={child.caseStatus} />
          </div>
          <p className="text-sm font-semibold text-gray-800 truncate">
            {[child.firstName, child.lastName].filter(Boolean).join(' ') || <span className="italic text-gray-300 font-normal">Sin nombre registrado</span>}
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 flex-wrap">
            <span>{sexLabel[child.sex] ?? child.sex}</span>
            {child.approximateAge != null && <span>~{child.approximateAge} años</span>}
            {child.findLocation && (
              <span className="flex items-center gap-1">
                <MapPin size={9} /> {child.findLocation.municipality}, {child.findLocation.state}
              </span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 text-gray-300">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4" style={{ background: D.light }}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {child.currentLocation?.hospital && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Ubicación actual</p>
                <p className="text-gray-700 flex items-center gap-1.5"><Building2 size={12} style={{ color: '#7c3aed' }} />{child.currentLocation.hospital}</p>
              </div>
            )}
            {child.findLocation && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Encontrado en</p>
                <p className="text-gray-700">{child.findLocation.address || `${child.findLocation.municipality}, ${child.findLocation.state}`}</p>
              </div>
            )}
            {child.rescuerName && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Registrado por</p>
                <p className="text-gray-700">{child.rescuerName}{child.rescueOrg ? ` — ${child.rescueOrg}` : ''}</p>
              </div>
            )}
            {child.observations && (
              <div className="col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Observaciones</p>
                <p className="text-gray-700">{child.observations}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── List row ─────────────────────────────────────────────────────
function ChildListRow({ child, onClick }: { child: any; onClick: () => void }) {
  const mainPhoto = child.photos?.find((p: any) => p.isMain) ?? child.photos?.[0];
  const [imgError, setImgError] = useState(false);
  const name = [child.firstName, child.lastName].filter(Boolean).join(' ') || null;
  const dotColor = STATUS_DOT[child.caseStatus] ?? '#94a3b8';
  const statusLabel = statusMap[child.caseStatus]?.label ?? child.caseStatus;

  return (
    <div onClick={onClick}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex items-center gap-3 p-3">
      {/* Foto */}
      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-blue-50">
        {mainPhoto && !imgError ? (
          <img src={mainPhoto.thumbnailUrl ?? mainPhoto.url} className="w-full h-full object-cover" alt=""
            onError={() => setImgError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User size={18} className={child.sex === 'MALE' ? 'text-blue-300' : child.sex === 'FEMALE' ? 'text-pink-300' : 'text-gray-300'} />
          </div>
        )}
      </div>

      {/* Info principal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs font-bold" style={{ color: D.blue }}>{child.code}</span>
          <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: `${dotColor}18`, color: dotColor }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor }} />
            {statusLabel}
          </span>
        </div>
        <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">
          {name ?? <span className="italic text-gray-400 font-normal text-xs">Sin nombre registrado</span>}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5 flex-wrap">
          {child.sex !== 'UNDETERMINED' && <span>{child.sex === 'MALE' ? 'Masc.' : 'Fem.'}</span>}
          {child.approximateAge != null && <span>~{child.approximateAge} años</span>}
          {child.findLocation && (
            <span className="flex items-center gap-0.5 truncate">
              <MapPin size={9} className="flex-shrink-0" />
              {child.findLocation.municipality}, {child.findLocation.state}
            </span>
          )}
          {child.currentLocation?.hospital && (
            <span className="flex items-center gap-0.5 truncate">
              <Building2 size={9} className="flex-shrink-0" /> {child.currentLocation.hospital}
            </span>
          )}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={e => {
          e.stopPropagation();
          navigator.clipboard.writeText(child.code);
          toast.success('Código copiado');
        }} className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all" title="Copiar código">
          <Copy size={13} />
        </button>
        <button onClick={e => {
          e.stopPropagation();
          const name2 = [child.firstName, child.lastName].filter(Boolean).join(' ') || 'Sin nombre';
          const url = `${window.location.origin}/?q=${child.code}`;
          const text = `🆘 Niño/a encontrado — ${name2}\nCódigo: *${child.code}*\nEstado: ${statusMap[child.caseStatus]?.label ?? child.caseStatus}\nVer: ${url}`;
          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        }} className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all" title="Compartir por WhatsApp">
          <MessageCircle size={13} />
        </button>
        <ChevronDown size={14} className="text-gray-300 ml-1" />
      </div>
    </div>
  );
}

// ─── Share section ────────────────────────────────────────────────
function ShareSection({ compact }: { compact?: boolean }) {
  const url = window.location.origin;
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadQR = () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = 'rescate-venezuela-qr.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  const shareQR = async () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    if (!navigator.share) { downloadQR(); return; }
    canvas.toBlob(async blob => {
      if (!blob) return;
      try { await navigator.share({ files: [new File([blob], 'qr.png', { type: 'image/png' })], title: 'QR Rescate Venezuela' }); }
      catch (_) { downloadQR(); }
    });
  };

  const shareLink = async () => {
    if (navigator.share) await navigator.share({ title: 'Rescate Venezuela', url });
    else copyLink();
  };

  if (compact) return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: D.sky }}>Comparte el sistema</p>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-xl">
          <QRCodeSVG value={url} size={64} level="M" fgColor={D.navy} />
          <div className="hidden"><QRCodeCanvas id="qr-canvas" value={url} size={400} level="M" fgColor={D.navy} /></div>
        </div>
        <div className="flex flex-col gap-1.5">
          <button onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: copied ? '#22c55e' : 'rgba(96,165,250,0.15)', color: copied ? '#fff' : D.sky }}>
            {copied ? <CheckCircle size={11} /> : <Copy size={11} />}
            {copied ? '¡Copiado!' : 'Copiar enlace'}
          </button>
          <a href={`https://wa.me/?text=${encodeURIComponent(`🆘 Registra y busca niños rescatados.\n${url}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
            style={{ background: 'rgba(37,211,102,0.15)', color: '#86efac' }}>
            <Share2 size={11} /> WhatsApp
          </a>
          <button onClick={downloadQR}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#4a7ab5' }}>
            <Download size={11} /> Descargar QR
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 flex items-center gap-3"
        style={{ background: `linear-gradient(135deg, ${D.navy} 0%, ${D.navy3} 100%)` }}>
        <QrCode size={18} style={{ color: D.sky }} />
        <h3 className="font-bold text-white text-sm">Comparte el formulario</h3>
      </div>
      <div className="p-6 flex flex-col sm:flex-row gap-8">
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
            <QRCodeSVG value={url} size={110} level="M" fgColor={D.navy} />
            <div className="hidden"><QRCodeCanvas id="qr-canvas" value={url} size={400} level="M" fgColor={D.navy} /></div>
          </div>
          <p className="text-xs text-gray-400">Escanea · Ideal para voluntarios</p>
          <div className="flex gap-1.5 w-full">
            <button onClick={downloadQR} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-gray-600">
              <Download size={11} /> Descargar
            </button>
            <button onClick={shareQR} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold rounded-lg text-white transition-all hover:opacity-90" style={{ background: D.navy }}>
              <Share2 size={11} /> Compartir QR
            </button>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl">
              <span className="text-sm text-gray-400 truncate">{url}</span>
            </div>
            <button onClick={copyLink}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${copied ? 'bg-green-500 text-white' : 'text-white'}`}
              style={!copied ? { background: `linear-gradient(135deg, ${D.blue}, ${D.navy3})` } : {}}>
              {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              {copied ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>
          <a href={`https://wa.me/?text=${encodeURIComponent(`🆘 Registra y busca niños rescatados en Venezuela.\n\n${url}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
            style={{ background: '#25D366' }}>
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Enviar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Form primitives ──────────────────────────────────────────────
const fSelect = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white';

interface FCardProps { icon: React.ReactNode; title: string; children: React.ReactNode; }
function FCard({ icon, title, children }: FCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-50">
          {icon}
        </div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">{title}</h3>
      </div>
      {children}
    </div>
  );
}

interface FInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string;
}
const FInput = ({ label, error, className = '', ...props }: FInputProps) => (
  <div>
    {label && <label className="text-xs font-medium text-gray-500 block mb-1.5">{label}</label>}
    <input {...props}
      className={`w-full border ${error ? 'border-red-400 bg-red-50' : 'border-gray-200'} rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder:text-gray-300 ${className}`}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

interface PInputProps { label?: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; }
function PInput({ label, value, onChange, placeholder, type = 'text' }: PInputProps) {
  return (
    <div>
      {label && <label className="text-xs font-medium text-gray-500 block mb-1.5">{label}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder:text-gray-300" />
    </div>
  );
}
