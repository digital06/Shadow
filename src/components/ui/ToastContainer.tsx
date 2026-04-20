import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToast, type Toast, type ToastType } from '../../lib/toast';

const ICON_MAP: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const STYLE_MAP: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
  success: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    border: 'border-emerald-500/25',
    icon: 'text-emerald-500',
    text: 'text-emerald-800 dark:text-emerald-300',
  },
  error: {
    bg: 'bg-red-500/10 dark:bg-red-500/15',
    border: 'border-red-500/25',
    icon: 'text-red-500',
    text: 'text-red-800 dark:text-red-300',
  },
  info: {
    bg: 'bg-ark-500/10 dark:bg-ark-500/15',
    border: 'border-ark-500/25',
    icon: 'text-ark-500',
    text: 'text-ark-800 dark:text-ark-300',
  },
  warning: {
    bg: 'bg-sand-500/10 dark:bg-sand-500/15',
    border: 'border-sand-500/25',
    icon: 'text-sand-500',
    text: 'text-sand-800 dark:text-sand-300',
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [state, setState] = useState<'entering' | 'visible' | 'exiting'>('entering');
  const style = STYLE_MAP[toast.type];
  const Icon = ICON_MAP[toast.type];

  useEffect(() => {
    const enterTimer = setTimeout(() => setState('visible'), 20);
    return () => clearTimeout(enterTimer);
  }, []);

  useEffect(() => {
    const exitDelay = toast.duration - 400;
    if (exitDelay <= 0) return;
    const timer = setTimeout(() => setState('exiting'), exitDelay);
    return () => clearTimeout(timer);
  }, [toast.duration]);

  function handleDismiss() {
    setState('exiting');
    setTimeout(onDismiss, 300);
  }

  const translateClass =
    state === 'entering'
      ? 'translate-x-[120%] opacity-0 scale-95'
      : state === 'exiting'
      ? 'translate-x-[120%] opacity-0 scale-95'
      : 'translate-x-0 opacity-100 scale-100';

  return (
    <div
      className={`
        flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)] px-4 py-3.5 rounded-xl border backdrop-blur-xl shadow-xl shadow-black/20
        transition-all duration-300 ease-out cursor-pointer
        ${style.bg} ${style.border} ${translateClass}
      `}
      onClick={handleDismiss}
      role="alert"
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${style.icon}`} />
      <p className={`flex-1 text-sm font-medium leading-snug ${style.text}`}>
        {toast.message}
      </p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        className="shrink-0 p-0.5 rounded-md text-volcanic-400 hover:text-heading transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[60] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={() => removeToast(toast.id)} />
        </div>
      ))}
    </div>
  );
}
