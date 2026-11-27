import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import subjects from '../data/subjects';
import {
  canEnroll,
  meetsCorrelatives,
  canTakeExam,
  sanitizeExceptions,
  calculateProgress,
  calculateIntermediateProgress,
  checkIntermediateTitle,
  getPendingFinals
} from '../utils/correlations';
import {
  CURRENT_STATES_SCHEMA_VERSION,
  isLegacyStatesPayload,
  migrateLegacyStates
} from '../utils/stateMigration';

/**
 * Hook personalizado para gestionar el estado de las materias
 * Maneja la lógica de estados cíclicos, persistencia y cálculos
 * @param {boolean} showElectives - Si es false, las electivas se excluyen de "Finales Pendientes"
 */
export const useSubjectsState = (showElectives = true) => {
  // Inicializar todos los estados en 0
  const initialStates = useMemo(() => {
    const states = {};
    subjects.forEach(subject => {
      states[subject.id] = 0;
    });
    return states;
  }, []);

  const [states, setStates] = useLocalStorage('isi-tracker-states', initialStates);
  const [statesSchemaVersion, setStatesSchemaVersion] = useLocalStorage('isi-tracker-states-schema-version', null);
  // Excepciones de correlativas: IDs de materias que se pueden cursar aunque falten correlativas
  const [storedExceptions, setExceptions] = useLocalStorage('isi-tracker-exceptions', []);
  const exceptions = useMemo(() => sanitizeExceptions(storedExceptions), [storedExceptions]);

  // Migración única: los estados persistidos antes del esquema de 4 estados
  // (0=No cursada, 1=Regular, 2=Aprobada) deben remaparse a (0,1=Cursando,2=Regular,3=Aprobada)
  if (statesSchemaVersion !== CURRENT_STATES_SCHEMA_VERSION) {
    setStates(prevStates => migrateLegacyStates(prevStates));
    setStatesSchemaVersion(CURRENT_STATES_SCHEMA_VERSION);
  }

  /**
   * Alterna el estado de una materia (0 → 1 → 2 → 3 → 0)
   */
  const toggleSubjectState = (subjectId) => {
    setStates(prevStates => {
      const currentState = prevStates[subjectId] || 0;
      const newState = (currentState + 1) % 4; // Ciclo 0 → 1 → 2 → 3 → 0

      return {
        ...prevStates,
        [subjectId]: newState
      };
    });
  };

  /**
   * Fija el estado de una materia a un valor concreto (0-3)
   * Usado para retroceder un estado o deshacer un cambio
   */
  const setSubjectState = (subjectId, newState) => {
    if (newState < 0 || newState > 3) return;
    setStates(prevStates => ({
      ...prevStates,
      [subjectId]: newState
    }));
  };

  /**
   * Otorga o quita la excepción de correlativas de una materia
   */
  const toggleException = (subjectId) => {
    setExceptions(prev => {
      const current = sanitizeExceptions(prev);
      return current.includes(subjectId)
        ? current.filter(id => id !== subjectId)
        : [...current, subjectId];
    });
  };

  /**
   * Reemplaza la lista de excepciones (ej. al importar un backup)
   * @param {Array<number>} newExceptions
   */
  const importExceptions = (newExceptions) => {
    setExceptions(sanitizeExceptions(newExceptions));
  };

  /**
   * Importa estados desde un objeto
   * @param {Object} newStates - Mapa {id: estado}
   * @param {string} [version] - Versión del payload exportado, para migrar esquemas viejos
   */
  const importStates = (newStates, version) => {
    const sourceStates = isLegacyStatesPayload(version)
      ? migrateLegacyStates(newStates)
      : newStates;

    // Validar que los IDs sean válidos
    const validatedStates = {};
    const validIds = subjects.map(s => s.id);

    Object.keys(sourceStates).forEach(key => {
      const id = parseInt(key);
      if (validIds.includes(id)) {
        const state = sourceStates[key];
        if (state >= 0 && state <= 3) {
          validatedStates[id] = state;
        }
      }
    });

    // Merge con estados existentes (preservar materias no importadas)
    setStates(prevStates => ({
      ...prevStates,
      ...validatedStates
    }));
  };

  /**
   * Resetea todos los estados a 0
   */
  const resetStates = () => {
    setStates(initialStates);
    setExceptions([]);
  };

  /**
   * Calcula información derivada de los estados
   */
  const derivedData = useMemo(() => {
    // Progreso general
    const progress = calculateProgress(states);
    
    // Progreso título intermedio
    const intermediateProgress = calculateIntermediateProgress(states);
    
    // Verificar si está completo el título intermedio
    const intermediateCompleted = checkIntermediateTitle(states);
    
    // Calcular habilitaciones para cada materia
    const subjectsWithStatus = subjects.map(subject => {
      const meets = meetsCorrelatives(subject.id, states);
      return {
        ...subject,
        state: states[subject.id] || 0,
        meetsCorrelatives: meets,
        // La excepción solo es relevante mientras falten correlativas
        hasException: !meets && exceptions.includes(subject.id),
        canEnroll: canEnroll(subject.id, states, exceptions),
        canTakeExam: canTakeExam(subject.id, states)
      };
    });

    // Finales pendientes (respeta el toggle de electivas)
    const subjectsForPendingFinals = subjects.filter(s => showElectives || s.l !== 6);
    const pendingFinals = getPendingFinals(states, subjectsForPendingFinals);

    return {
      progress,
      intermediateProgress,
      intermediateCompleted,
      subjectsWithStatus,
      pendingFinals
    };
  }, [states, exceptions, showElectives]);

  return {
    states,
    exceptions,
    toggleSubjectState,
    setSubjectState,
    toggleException,
    importExceptions,
    importStates,
    resetStates,
    ...derivedData
  };
};

export default useSubjectsState;
