import { useState, useMemo } from 'react';
import {
  findCommonEnrollableSubjects,
  calculateGroupCompatibility,
  validateComparisonJSON
} from '../utils/compareProgress';
import { isLegacyStatesPayload, migrateLegacyStates } from '../utils/stateMigration';

/**
 * Hook para gestionar comparación de progreso con compañeros
 */
export const useComparisonState = (userStates, showElectives = true) => {
  const [classmates, setClassmates] = useState([]);
  const [error, setError] = useState(null);

  /**
   * Agrega un compañero desde un archivo JSON
   * @param {Object} jsonData - Datos parseados del JSON
   * @param {string} fileName - Nombre del archivo original
   * @returns {boolean} - true si se agregó exitosamente
   */
  const addClassmate = (jsonData, fileName) => {
    // Validar formato
    const validation = validateComparisonJSON(jsonData);
    if (!validation.valid) {
      setError(validation.error);
      return false;
    }

    // Límite de 10 compañeros
    if (classmates.length >= 10) {
      setError('Máximo 10 compañeros permitidos');
      return false;
    }

    // Preferir el nombre incluido en el archivo (versión >= 1.2); si no viene, derivarlo del nombre de archivo
    const baseName = (jsonData.name && jsonData.name.trim())
      || fileName.replace(/\.json$/i, '').replace(/plan-k23-backup-/i, '');
    let name = baseName || `Compañero ${classmates.length + 1}`;

    // Evitar nombres duplicados
    let counter = 1;
    const originalName = name;
    while (classmates.some(c => c.name === name)) {
      name = `${originalName} (${counter})`;
      counter++;
    }

    // Migrar estados si el archivo viene del esquema viejo (0=No cursada, 1=Regular, 2=Aprobada)
    const states = isLegacyStatesPayload(jsonData.version)
      ? migrateLegacyStates(jsonData.states)
      : jsonData.states;

    // Crear nuevo compañero
    const newClassmate = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      states,
      timestamp: jsonData.timestamp || new Date().toISOString()
    };

    setClassmates(prev => [...prev, newClassmate]);
    setError(null);
    return true;
  };

  /**
   * Actualiza el nombre de un compañero
   * @param {string} id - ID del compañero
   * @param {string} newName - Nuevo nombre
   */
  const updateClassmateName = (id, newName) => {
    setClassmates(prev =>
      prev.map(c => c.id === id ? { ...c, name: newName } : c)
    );
  };

  /**
   * Elimina un compañero
   * @param {string} id - ID del compañero
   */
  const removeClassmate = (id) => {
    setClassmates(prev => prev.filter(c => c.id !== id));
    setError(null);
  };

  /**
   * Elimina todos los compañeros
   */
  const clearAll = () => {
    setClassmates([]);
    setError(null);
  };

  /**
   * Calcula materias comunes (memoizado)
   */
  const commonSubjects = useMemo(() => {
    if (classmates.length === 0) return [];
    return findCommonEnrollableSubjects(userStates, classmates, showElectives);
  }, [userStates, classmates, showElectives]);

  /**
   * Calcula compatibilidad del grupo (memoizado)
   */
  const compatibility = useMemo(() => {
    return calculateGroupCompatibility(userStates, classmates, showElectives);
  }, [userStates, classmates, showElectives]);

  return {
    classmates,
    commonSubjects,
    compatibility,
    error,
    addClassmate,
    updateClassmateName,
    removeClassmate,
    clearAll,
    hasClassmates: classmates.length > 0
  };
};
