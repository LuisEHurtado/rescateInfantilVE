import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/endpoints/auth';
import { useAuthStore } from '../../stores/auth.store';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

const schema = z.object({
  username: z.string().min(1, 'Requerido'),
  password: z.string().min(1, 'Requerido'),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data);
      setAuth(res.user, res.access_token);
      navigate('/panel/dashboard');
    } catch {
      toast.error('Credenciales inválidas. Verifique usuario y contraseña.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-2xl shadow-lg mb-4">
            <AlertTriangle size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">RESCATE</h1>
          <p className="text-red-200 mt-1">Sistema de Emergencia Venezuela</p>
          <p className="text-slate-400 text-sm mt-2">Registro y seguimiento de niños rescatados</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Acceso al sistema</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              {...register('username')}
              label="Usuario"
              placeholder="Ingrese su usuario"
              error={errors.username?.message}
              autoComplete="username"
              autoFocus
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Ingrese su contraseña"
                  autoComplete="current-password"
                  className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <Button type="submit" size="lg" loading={isSubmitting} className="w-full mt-2">
              INGRESAR AL SISTEMA
            </Button>
          </form>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700 font-medium">Acceso restringido</p>
            <p className="text-xs text-amber-600 mt-1">Solo personal autorizado. Las cuentas son creadas por el administrador del sistema.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
