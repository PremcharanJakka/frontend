import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-muted tracking-wide uppercase">{label}</label>
      )}
      <input
        className={`w-full px-4 py-2.5 rounded-xl bg-surface border border-base text-base-color text-sm placeholder:text-muted/50 transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 ${error ? 'border-base-color' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-base-color font-medium">{error}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: React.ReactNode;
}

export function Select({ label, children, className = '', ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-muted tracking-wide uppercase">{label}</label>
      )}
      <select
        className={`w-full px-4 py-2.5 rounded-xl bg-surface border border-base text-base-color text-sm transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className = '', ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-muted tracking-wide uppercase">{label}</label>
      )}
      <textarea
        className={`w-full px-4 py-2.5 rounded-xl bg-surface border border-base text-base-color text-sm placeholder:text-muted/50 transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none ${className}`}
        {...props}
      />
    </div>
  );
}
