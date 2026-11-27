import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Diálogo modal de confirmación (reemplaza a window.confirm)
 * Se cierra con Escape o haciendo click fuera.
 */
const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  onConfirm,
  onCancel
}) => {
  const cancelRef = useRef(null);
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  useEffect(() => {
    if (!open) return undefined;
    cancelRef.current?.focus();
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancelRef.current?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-6 animate-toast-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full flex-shrink-0 ${danger ? 'bg-red-500/15' : 'bg-blue-500/15'}`}>
            <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-400' : 'text-blue-400'}`} />
          </div>
          <div className="flex-1">
            <h2 id="confirm-title" className="text-lg font-semibold text-gray-100">{title}</h2>
            <p id="confirm-message" className="mt-1 text-sm text-gray-400">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg text-gray-200 bg-gray-800 hover:bg-gray-700
              focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg text-white focus:outline-none focus-visible:ring-2
              ${danger
                ? 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-400'
                : 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-400'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
