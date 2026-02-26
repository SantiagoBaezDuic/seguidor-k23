import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import subjects from '../data/subjects';
import { 
  canEnroll, 
  canTakeExam, 
  calculateProgress,
  calculateIntermediateProgress,
  checkIntermediateTitle 
} from '../utils/correlations';

/**
 * Hook personalizado para gestionar el estado de las materias
 * Maneja la lógica de estados cíclicos, persistencia y cálculos
 */
export const useSubjectsState = () => {
  // Inicializar todos los estados en 0
  const initialStates = useMemo(() => {
    const states = {};
    subjects.forEach(subject => {
      states[subject.id] = 0;
    });
    return states;
  }, []);

  const [states, setStates] = useLocalStorage('isi-tracker-states', initialStates);

  /**
   * Alterna el estado de una materia (0 → 1 → 2 → 0)
   */
  const toggleSubjectState = (subjectId) => {
    setStates(prevStates => {
      const currentState = prevStates[subjectId] || 0;
      const newState = (currentState + 1) % 3; // Ciclo 0 → 1 → 2 → 0
      
      return {
        ...prevStates,
        [subjectId]: newState
      };
    });
  };

  /**
   * Importa estados desde un objeto
   */
  const importStates = (newStates) => {
    // Validar que los IDs sean válidos
    const validatedStates = {};
    const validIds = subjects.map(s => s.id);
    
    Object.keys(newStates).forEach(key => {
      const id = parseInt(key);
      if (validIds.includes(id)) {
        const state = newStates[key];
        if (state >= 0 && state <= 2) {
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
    const subjectsWithStatus = subjects.map(subject => ({
      ...subject,
      state: states[subject.id] || 0,
      canEnroll: canEnroll(subject.id, states),
      canTakeExam: canTakeExam(subject.id, states)
    }));
    
    return {
      progress,
      intermediateProgress,
      intermediateCompleted,
      subjectsWithStatus
    };
  }, [states]);

  return {
    states,
    toggleSubjectState,
    importStates,
    resetStates,
    ...derivedData
  };
};

export default useSubjectsState;
