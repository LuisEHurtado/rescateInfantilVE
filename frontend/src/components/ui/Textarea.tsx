import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, className = '', ...props }, ref) => (
  <div className="space-y-1">
    {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
    <textarea
      ref={ref}
      {...props}
      className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'} ${className}`}
    />
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
));
Textarea.displayName = 'Textarea';
