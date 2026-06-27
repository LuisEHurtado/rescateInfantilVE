import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, hint, className = '', ...props }, ref) => (
  <div className="space-y-1">
    {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
    <input
      ref={ref}
      {...props}
      className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'} ${className}`}
    />
    {error && <p className="text-xs text-red-600">{error}</p>}
    {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
  </div>
));
Input.displayName = 'Input';
