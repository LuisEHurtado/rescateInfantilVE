import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/endpoints/users';
import { authApi } from '../../api/endpoints/auth';
import { User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { roleLabel, formatDate } from '../../utils/labels';
import { PlusCircle, ToggleLeft, ToggleRight, Key, QrCode } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export function UsersPage() {
  const qc = useQueryClient();
  const [createModal, setCreateModal] = useState(false);
  const [tokenModal, setTokenModal] = useState(false);
  const [tokenDesc, setTokenDesc] = useState('');

  const { data: users = [] } = useQuery<User[]>({ queryKey: ['users'], queryFn: usersApi.list });
  const { data: tokens = [] } = useQuery<any[]>({ queryKey: ['tokens'], queryFn: authApi.listEmergencyTokens });

  const toggleMutation = useMutation({
    mutationFn: usersApi.toggleActive,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Estado actualizado'); },
  });

  const createTokenMutation = useMutation({
    mutationFn: () => authApi.createEmergencyToken({ description: tokenDesc }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tokens'] }); setTokenModal(false); setTokenDesc(''); toast.success('Token creado'); },
  });

  const revokeTokenMutation = useMutation({
    mutationFn: authApi.revokeEmergencyToken,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tokens'] }); toast.success('Token revocado'); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setTokenModal(true)}>
            <QrCode size={16} /> Nuevo Token Emergencia
          </Button>
          <Button onClick={() => setCreateModal(true)}>
            <PlusCircle size={16} /> Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Usuarios */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Usuarios del sistema</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nombre completo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rol</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Organismo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono text-gray-700">{u.username}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{u.fullName}</td>
                <td className="px-4 py-3"><Badge className={u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : u.role === 'RESCUER' ? 'bg-blue-100 text-blue-700' : u.role === 'HOSPITAL' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}>{roleLabel[u.role]}</Badge></td>
                <td className="px-4 py-3 text-sm text-gray-600">{u.organization || '—'}</td>
                <td className="px-4 py-3"><Badge className={u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>{u.isActive ? 'Activo' : 'Inactivo'}</Badge></td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleMutation.mutate(u.id)} className="text-gray-400 hover:text-gray-700 transition-colors" title={u.isActive ? 'Desactivar' : 'Activar'}>
                    {u.isActive ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tokens de emergencia */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Tokens de Emergencia</h2>
          <p className="text-sm text-gray-500 mt-0.5">Permiten registrar niños sin cuenta de usuario</p>
        </div>
        <div className="divide-y divide-gray-100">
          {(tokens as any[]).map((t: any) => (
            <div key={t.id} className="px-5 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono text-gray-700 truncate">{t.token}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.description} — Usos: {t.usageCount}</p>
              </div>
              <Badge className={t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>{t.isActive ? 'Activo' : 'Revocado'}</Badge>
              {t.isActive && (
                <Button variant="danger" size="sm" onClick={() => revokeTokenMutation.mutate(t.id)}>Revocar</Button>
              )}
            </div>
          ))}
          {!(tokens as any[]).length && <p className="text-sm text-gray-400 text-center py-8">Sin tokens creados</p>}
        </div>
      </div>

      {/* Modal crear usuario */}
      <CreateUserModal open={createModal} onClose={() => setCreateModal(false)} onSuccess={() => { qc.invalidateQueries({ queryKey: ['users'] }); setCreateModal(false); }} />

      {/* Modal crear token */}
      <Modal open={tokenModal} onClose={() => setTokenModal(false)} title="Crear Token de Emergencia" size="sm">
        <div className="space-y-4">
          <Input label="Descripción" value={tokenDesc} onChange={e => setTokenDesc(e.target.value)} placeholder="Ej: Equipo Protección Civil Caracas" />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setTokenModal(false)}>Cancelar</Button>
            <Button onClick={() => createTokenMutation.mutate()} loading={createTokenMutation.isPending}>Crear Token</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function CreateUserModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<any>();

  const onSubmit = async (data: any) => {
    try {
      await usersApi.create(data);
      toast.success('Usuario creado exitosamente');
      reset();
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al crear usuario');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Crear nuevo usuario" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input {...register('username', { required: 'Requerido' })} label="Nombre de usuario *" placeholder="jperez" error={errors.username?.message as string} />
          <Input {...register('password', { required: 'Requerido', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })} type="password" label="Contraseña *" placeholder="••••••••" error={errors.password?.message as string} />
          <div className="col-span-2">
            <Input {...register('fullName', { required: 'Requerido' })} label="Nombre completo *" placeholder="Juan Pérez" error={errors.fullName?.message as string} />
          </div>
          <Select {...register('role', { required: 'Requerido' })} label="Rol *"
            options={[{ value: 'ADMIN', label: 'Administrador' }, { value: 'RESCUER', label: 'Rescatista' }, { value: 'HOSPITAL', label: 'Hospital' }, { value: 'VIEWER', label: 'Solo lectura' }]}
            placeholder="Seleccionar rol" error={errors.role?.message as string} />
          <Input {...register('organization')} label="Organismo / Institución" placeholder="Protección Civil" />
          <div className="col-span-2">
            <Input {...register('email')} type="email" label="Correo electrónico" placeholder="correo@ejemplo.com" />
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={isSubmitting}>Crear Usuario</Button>
        </div>
      </form>
    </Modal>
  );
}
