import { useState, useEffect } from 'react';

/**
 * Hook personalizado para sincronizar estado con localStorage
 * @param {string} key - Clave en localStorage
 * @param {*} initialValue - Valor inicial si no existe en localStorage
 * @returns {Array} - [value, setValue] similar a useState
 */
export const useLocalStorage = (key, initialValue) => {
  // Inicializar el estado desde localStorage o con el valor inicial
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // Actualizar localStorage cuando el estado cambie
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};

export default useLocalStorage;
