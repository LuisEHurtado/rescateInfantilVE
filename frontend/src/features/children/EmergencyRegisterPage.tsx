import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, AlertTriangle, CheckCircle, Key } from 'lucide-react';
import { childrenApi } from '../../api/endpoints/children';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

const VENEZUELAN_STATES = ['Amazonas','Anzoátegui','Apure','Aragua','Barinas','Bolívar','Carabobo','Cojedes','Delta Amacuro','Distrito Capital','Falcón','Guárico','Lara','Mérida','Miranda','Monagas','Nueva Esparta','Portuguesa','Sucre','Táchira','Trujillo','Vargas','Yaracuy','Zulia'];

const schema = z.object({
  emergencyToken: z.string().min(5, 'Token requerido'),
  rescuerName: z.string().min(2, 'Requerido'),
  rescueOrg: z.string().optional(),
  firstName: z.string().optional(),
  sex: z.enum(['MALE', 'FEMALE', 'UNDETERMINED']),
  approximateAge: z.coerce.number().min(0).max(18),
  state: z.string().min(1, 'Requerido'),
  municipality: z.string().min(1, 'Requerido'),
  parish: z.string().optional(),
  foundAddress: z.string().min(3, 'Requerido'),
  destinationHospital: z.string().min(3, 'Requerido'),
  observations: z.string().optional(),
});

type RegisterForm = z.infer<typeof schema>;

export function EmergencyRegisterPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [registered, setRegistered] = useState<{ code: string; id: string } | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { sex: 'UNDETERMINED', approximateAge: 5, state: 'Distrito Capital' },
  });

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: RegisterForm) => {
    try {
      const child = await childrenApi.quickRegisterJson(data);

      if (photoFile && child.id) {
        const fd = new window.FormData();
        fd.append('photo', photoFile);
        fd.append('description', 'Foto principal - registro emergencia');
        try {
          await fetch(`/api/children/${child.id}/photos`, {
            method: 'POST',
            body: fd,
          });
        } catch (_) {}
      }

      setRegistered({ code: child.code, id: child.id });
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (msg?.includes('Token')) {
        toast.error('Token de emergencia inválido o expirado.');
      } else {
        toast.error('Error al registrar. Verifique los datos e intente nuevamente.');
      }
    }
  };

  // Pantalla de éxito
  if (registered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-red-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Registrado exitosamente</h2>
          <div className="mt-4 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-600">Código asignado</p>
            <p className="text-3xl font-bold text-blue-800 mt-1">{registered.code}</p>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Anote este código. Las autoridades podrán localizar el expediente con él.
          </p>
          <Button
            className="mt-6 w-full"
            onClick={() => { setRegistered(null); setPhotoPreview(null); setPhotoFile(null); }}
          >
            Registrar otro niño/niña
          </Button>
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-red-900 py-8 px-4">
      <Toaster />
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl shadow-lg mb-3">
            <AlertTriangle size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">REGISTRO DE EMERGENCIA</h1>
          <p className="text-red-200 text-sm mt-1">Sistema Rescate Venezuela — Acceso con token</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Token de acceso */}
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Key size={18} className="text-amber-600" />
              <h2 className="text-sm font-bold text-amber-800 uppercase tracking-wide">Token de Acceso</h2>
            </div>
            <Input
              {...register('emergencyToken')}
              placeholder="Ingrese el token de emergencia"
              error={errors.emergencyToken?.message as string}
              className="font-mono"
            />
            <p className="text-xs text-amber-600 mt-2">Proporcionado por el administrador del sistema</p>
          </div>

          {/* Rescatista */}
          <div className="bg-white rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Rescatista</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input {...register('rescuerName')} label="Nombre del rescatista *" placeholder="Su nombre completo" error={errors.rescuerName?.message as string} />
              <Input {...register('rescueOrg')} label="Organismo" placeholder="Ej: Protección Civil" />
            </div>
          </div>

          {/* Foto */}
          <div className="bg-white rounded-xl p-5">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Fotografía</h2>
            <div className="flex items-center gap-4">
              <div
                onClick={() => fileRef.current?.click()}
                className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 flex flex-col items-center justify-center cursor-pointer bg-gray-50 overflow-hidden flex-shrink-0"
              >
                {photoPreview
                  ? <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                  : <><Camera size={28} className="text-gray-400" /><p className="text-xs text-gray-400 mt-1">Foto</p></>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
              <div>
                <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                  <Camera size={14} /> {photoPreview ? 'Cambiar' : 'Tomar foto'}
                </Button>
                {photoPreview && <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><CheckCircle size={12} /> Foto lista</p>}
              </div>
            </div>
          </div>

          {/* Datos básicos */}
          <div className="bg-white rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Datos del Niño/Niña</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input {...register('firstName')} label="Nombre (si se conoce)" placeholder="Nombre" />
              <Select
                {...register('sex')}
                label="Sexo *"
                options={[{ value: 'MALE', label: 'Masculino' }, { value: 'FEMALE', label: 'Femenino' }, { value: 'UNDETERMINED', label: 'No determinado' }]}
                error={errors.sex?.message as string}
              />
              <Input {...register('approximateAge')} label="Edad aproximada *" type="number" min="0" max="18" error={errors.approximateAge?.message as string} />
            </div>
          </div>

          {/* Lugar */}
          <div className="bg-white rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Lugar de Hallazgo</h2>
            <div className="grid grid-cols-2 gap-4">
              <Select
                {...register('state')}
                label="Estado *"
                options={VENEZUELAN_STATES.map(s => ({ value: s, label: s }))}
                error={errors.state?.message as string}
              />
              <Input {...register('municipality')} label="Municipio *" placeholder="Ej: Sucre" error={errors.municipality?.message as string} />
              <Input {...register('parish')} label="Parroquia" placeholder="Opcional" />
              <div className="col-span-2">
                <Input {...register('foundAddress')} label="Dirección o referencia *" placeholder="Sector, calle, punto de referencia..." error={errors.foundAddress?.message as string} />
              </div>
            </div>
          </div>

          {/* Destino */}
          <div className="bg-white rounded-xl p-5">
            <Input {...register('destinationHospital')} label="Hospital o refugio de destino *" placeholder="Ej: Hospital Central de Caracas" error={errors.destinationHospital?.message as string} />
          </div>

          {/* Observaciones */}
          <div className="bg-white rounded-xl p-5">
            <Textarea {...register('observations')} label="Observaciones" placeholder="Estado general, ropa, señas particulares..." rows={3} />
          </div>

          <Button type="submit" size="xl" loading={isSubmitting} className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg">
            <AlertTriangle size={20} />
            REGISTRAR NIÑO/NIÑA
          </Button>
        </form>
      </div>
    </div>
  );
}
