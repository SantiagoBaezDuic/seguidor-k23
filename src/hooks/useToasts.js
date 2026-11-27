import { useState, useCallback, useRef, useEffect } from 'react';

let nextId = 1;

/**
 * Hook para manejar notificaciones efímeras (toasts) en memoria.
 * Reemplaza a los `alert()` nativos, que bloquean la página.
 * @returns {{ toasts: Array, notify: Function, dismiss: Function }}
 */
export const useToasts = () => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  /**
   * Muestra una notificación
   * @param {string} message - Texto principal
   * @param {Object} [options]
   * @param {'info'|'success'|'error'} [options.type='info']
   * @param {{label: string, onClick: Function}} [options.action] - Botón opcional (ej. "Deshacer")
   * @param {string} [options.key] - Si se repite, reemplaza al toast anterior con la misma key
   * @param {number} [options.duration=4000] - Milisegundos antes de ocultarse
   */
  const notify = useCallback((message, options = {}) => {
    const { type = 'info', action, key, duration = 4000 } = options;
    const id = nextId++;

    setToasts(prev => {
      const replaced = key ? prev.filter(t => t.key === key) : [];
      replaced.forEach(t => {
        const timer = timersRef.current.get(t.id);
        if (timer) clearTimeout(timer);
        timersRef.current.delete(t.id);
      });
      const kept = key ? prev.filter(t => t.key !== key) : prev;
      // Limitar a 3 toasts visibles
      return [...kept, { id, key, message, type, action }].slice(-3);
    });

    timersRef.current.set(id, setTimeout(() => dismiss(id), duration));
    return id;
  }, [dismiss]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  return { toasts, notify, dismiss };
};

export default useToasts;
