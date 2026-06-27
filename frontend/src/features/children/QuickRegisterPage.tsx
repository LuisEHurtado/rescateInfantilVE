import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, AlertTriangle, CheckCircle } from 'lucide-react';
import { childrenApi } from '../../api/endpoints/children';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import toast from 'react-hot-toast';

const VENEZUELAN_STATES = ['Amazonas','Anzoátegui','Apure','Aragua','Barinas','Bolívar','Carabobo','Cojedes','Delta Amacuro','Distrito Capital','Falcón','Guárico','Lara','Mérida','Miranda','Monagas','Nueva Esparta','Portuguesa','Sucre','Táchira','Trujillo','Vargas','Yaracuy','Zulia'];

const schema = z.object({
  firstName: z.string().optional(),
  sex: z.enum(['MALE', 'FEMALE', 'UNDETERMINED']),
  approximateAge: z.coerce.number().min(0).max(18),
  state: z.string().min(1, 'Requerido'),
  municipality: z.string().min(1, 'Requerido'),
  parish: z.string().optional(),
  foundAddress: z.string().min(3, 'Requerido'),
  destinationHospital: z.string().min(3, 'Requerido'),
  rescueOrg: z.string().optional(),
  rescuerName: z.string().optional(),
  observations: z.string().optional(),
});

type RegisterForm = z.infer<typeof schema>;

export function QuickRegisterPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

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

      // Si hay foto, subirla después
      if (photoFile && child.id) {
        const fd = new FormData();
        fd.append('photo', photoFile);
        fd.append('description', 'Foto principal - registro inicial');
        try {
          await fetch(`/api/children/${child.id}/photos`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            body: fd,
          });
        } catch (_) {}
      }

      toast.success(`Niño registrado: ${child.code}`);
      navigate(`/expedientes/${child.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al registrar. Intente nuevamente.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header urgente */}
      <div className="flex items-center gap-3 mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
        <AlertTriangle className="text-red-600 flex-shrink-0" size={24} />
        <div>
          <h1 className="text-xl font-bold text-red-800">REGISTRO RÁPIDO</h1>
          <p className="text-sm text-red-600">Complete los campos mínimos. Puede editar el expediente completo después.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Foto principal */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Fotografía <span className="text-red-500">*</span></h2>
          <div className="flex items-start gap-6">
            <div
              onClick={() => fileRef.current?.click()}
              className="w-40 h-40 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-blue-50 transition-colors flex-shrink-0 overflow-hidden"
            >
              {photoPreview
                ? <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                : <><Camera size={36} className="text-gray-400 mb-2" /><p className="text-xs text-gray-400 text-center">Toca para agregar foto</p></>
              }
            </div>
            <div className="flex-1">
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
              <p className="text-sm text-gray-600 mb-3">La fotografía ayuda a identificar al niño. Puede ser tomada desde la cámara del dispositivo.</p>
              <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                <Camera size={16} />
                {photoPreview ? 'Cambiar foto' : 'Seleccionar foto'}
              </Button>
              {photoPreview && <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><CheckCircle size={12} /> Foto lista</p>}
            </div>
          </div>
        </div>

        {/* Datos básicos */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Datos Básicos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input {...register('firstName')} label="Nombre (si se conoce)" placeholder="Nombre del niño/a" />
            <Select
              {...register('sex')}
              label="Sexo *"
              options={[{ value: 'MALE', label: 'Masculino' }, { value: 'FEMALE', label: 'Femenino' }, { value: 'UNDETERMINED', label: 'No determinado' }]}
              error={errors.sex?.message}
            />
            <Input
              {...register('approximateAge')}
              label="Edad aproximada (años) *"
              type="number"
              min="0"
              max="18"
              placeholder="Ej: 7"
              error={errors.approximateAge?.message}
            />
          </div>
        </div>

        {/* Lugar de hallazgo */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Lugar de Hallazgo <span className="text-red-500">*</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              {...register('state')}
              label="Estado *"
              options={VENEZUELAN_STATES.map(s => ({ value: s, label: s }))}
              error={errors.state?.message}
            />
            <Input {...register('municipality')} label="Municipio *" placeholder="Ej: Sucre" error={errors.municipality?.message} />
            <Input {...register('parish')} label="Parroquia" placeholder="Ej: Petare" />
            <div className="sm:col-span-2">
              <Input
                {...register('foundAddress')}
                label="Dirección o referencia del lugar *"
                placeholder="Ej: Sector La Esperanza, calle principal, frente a la escuela"
                error={errors.foundAddress?.message}
              />
            </div>
          </div>
        </div>

        {/* Destino */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Destino y Rescatistas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              {...register('destinationHospital')}
              label="Hospital o refugio de destino *"
              placeholder="Ej: Hospital Central de Caracas"
              error={errors.destinationHospital?.message}
            />
            <Input {...register('rescueOrg')} label="Organismo de rescate" placeholder="Ej: Protección Civil" />
            <Input {...register('rescuerName')} label="Nombre del rescatista" placeholder="Nombre completo" />
          </div>
        </div>

        {/* Observaciones */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <Textarea {...register('observations')} label="Observaciones" placeholder="Estado general, ropa, particularidades observadas..." rows={3} />
        </div>

        {/* Botón grande */}
        <Button type="submit" size="xl" loading={isSubmitting} className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg">
          <AlertTriangle size={22} />
          REGISTRAR NIÑO/NIÑA
        </Button>
      </form>
    </div>
  );
}
