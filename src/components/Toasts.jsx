import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const TYPE_STYLES = {
  success: { icon: CheckCircle, className: 'border-green-500/50 text-green-100', iconClass: 'text-green-400' },
  error: { icon: AlertCircle, className: 'border-red-500/50 text-red-100', iconClass: 'text-red-400' },
  info: { icon: Info, className: 'border-gray-600 text-gray-100', iconClass: 'text-blue-400' },
};

/**
 * Contenedor de notificaciones flotantes (abajo al centro)
 */
const Toasts = ({ toasts, onDismiss }) => {
  return (
    <div
      className="fixed bottom-4 inset-x-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none"
      role="status"
      aria-live="polite"
    >
      {toasts.map(toast => {
        const { icon: Icon, className, iconClass } = TYPE_STYLES[toast.type] || TYPE_STYLES.info;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto w-full max-w-md flex items-center gap-3 px-4 py-3 rounded-lg border
              bg-gray-900/95 backdrop-blur shadow-2xl animate-toast-in ${className}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 ${iconClass}`} />
            <p className="flex-1 text-sm">{toast.message}</p>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action.onClick();
                  onDismiss(toast.id);
                }}
                className="text-sm font-semibold text-blue-300 hover:text-blue-200 px-2 py-1 rounded
                  hover:bg-blue-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                {toast.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded text-gray-400 hover:text-gray-200 hover:bg-gray-700/50
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toasts;
