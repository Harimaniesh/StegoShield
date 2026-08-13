import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons: Record<ToastType, any> = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: CheckCircle2,
  };

  const styles: Record<ToastType, string> = {
    success: 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    error: 'bg-rose-950/90 border-rose-500/40 text-rose-300 shadow-[0_0_20px_rgba(239,68,68,0.2)]',
    warning: 'bg-amber-950/90 border-amber-500/40 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)]',
    info: 'bg-cyan-950/90 border-cyan-500/40 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)]',
  };

  const Icon = icons[type];

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md transition-all duration-300 font-sans text-sm ${styles[type]}`}>
      <Icon className="w-5 h-5 shrink-0" />
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-white/10 transition-colors ml-2"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
