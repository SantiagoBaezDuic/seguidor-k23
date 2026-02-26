import subjects from '../data/subjects';
import { canEnroll } from './correlations';

/**
 * Encuentra materias que todos los participantes pueden cursar Y tienen pendientes
 * @param {Object} userStates - Estados del usuario actual
 * @param {Array} classmates - Array de objetos {id, name, states, timestamp}
 * @returns {Array} - Array de IDs de materias que todos pueden cursar y ninguno cursó
 */
export const findCommonEnrollableSubjects = (userStates, classmates) => {
  if (!classmates || classmates.length === 0) {
    return [];
  }

  return subjects
    .filter(subject => {
      // Usuario debe tenerla pendiente (estado 0)
      if ((userStates[subject.id] || 0) !== 0) return false;
      
      // Usuario puede cursarla
      if (!canEnroll(subject.id, userStates)) return false;
      
      // TODOS los compañeros deben tenerla pendiente Y poder cursarla
      const allClassmatesCanEnroll = classmates.every(classmate => {
        const classmateState = classmate.states[subject.id] || 0;
        // Debe estar en estado 0 (no cursada)
        if (classmateState !== 0) return false;
        // Y debe poder cursarla
        return canEnroll(subject.id, classmate.states);
      });
      
      return allClassmatesCanEnroll;
    })
    .map(subject => subject.id);
};

/**
 * Encuentra materias pendientes que el usuario y UN compañero específico pueden cursar
 * Excluye materias que ya están en la lista de comunes a todos
 * @param {Object} userStates - Estados del usuario actual
 * @param {Object} classmate - Objeto {id, name, states, timestamp} de un compañero
 * @param {Array} excludeIds - IDs de materias a excluir (las comunes a todos)
 * @returns {Array} - Array de IDs de materias que ambos pueden cursar (excluye las comunes a todos)
 */
export const findPairwiseCommonSubjects = (userStates, classmate, excludeIds = []) => {
  return subjects
    .filter(subject => {
      // Excluir si ya está en la lista de comunes a todos
      if (excludeIds.includes(subject.id)) return false;
      
      // Usuario debe tenerla pendiente (estado 0)
      const userState = userStates[subject.id] || 0;
      if (userState !== 0) return false;
      
      // Compañero debe tenerla pendiente (estado 0)
      const classmateState = classmate.states[subject.id] || 0;
      if (classmateState !== 0) return false;
      
      // Usuario puede cursarla
      if (!canEnroll(subject.id, userStates)) return false;
      
      // Compañero puede cursarla
      if (!canEnroll(subject.id, classmate.states)) return false;
      
      return true;
    })
    .map(subject => subject.id);
};

/**
 * Obtiene matriz de comparación para una materia específica
 * Solo cuenta personas que tienen la materia PENDIENTE (estado 0) y pueden cursarla
 * @param {number} subjectId - ID de la materia
 * @param {Object} userStates - Estados del usuario
 * @param {Array} classmates - Array de compañeros
 * @returns {Object} - {canEnrollCount, total, participants: [{name, canEnroll, state, isPending}]}
 */
export const getComparisonMatrix = (subjectId, userStates, classmates) => {
  const participants = [
    {
      name: 'Tú',
      canEnroll: canEnroll(subjectId, userStates),
      state: userStates[subjectId] || 0,
      isPending: (userStates[subjectId] || 0) === 0
    },
    ...classmates.map(classmate => ({
      name: classmate.name,
      canEnroll: canEnroll(subjectId, classmate.states),
      state: classmate.states[subjectId] || 0,
      isPending: (classmate.states[subjectId] || 0) === 0
    }))
  ];

  // Solo contar personas que tienen la materia pendiente Y pueden cursarla
  const canEnrollCount = participants.filter(p => p.isPending && p.canEnroll).length;
  const total = participants.length;

  return {
    canEnrollCount,
    total,
    participants,
    allCanEnroll: canEnrollCount === total
  };
};

/**
 * Calcula porcentaje de compatibilidad general del grupo
 * @param {Object} userStates - Estados del usuario
 * @param {Array} classmates - Array de compañeros
 * @returns {Object} - {percentage, commonSubjects, totalAvailable}
 */
export const calculateGroupCompatibility = (userStates, classmates) => {
  if (!classmates || classmates.length === 0) {
    return { percentage: 0, commonSubjects: 0, totalAvailable: 0 };
  }

  // Materias PENDIENTES que el usuario puede cursar (estado 0)
  const userAvailable = subjects.filter(s => {
    const state = userStates[s.id] || 0;
    return state === 0 && canEnroll(s.id, userStates);
  }).length;

  // Materias comunes a todos (pendientes y disponibles para todos)
  const commonSubjects = findCommonEnrollableSubjects(userStates, classmates).length;

  const percentage = userAvailable > 0 
    ? Math.round((commonSubjects / userAvailable) * 100)
    : 0;

  return {
    percentage,
    commonSubjects,
    totalAvailable: userAvailable
  };
};

/**
 * Valida que un JSON importado tenga el formato correcto
 * @param {Object} data - Objeto JSON parseado
 * @returns {Object} - {valid: boolean, error: string|null}
 */
export const validateComparisonJSON = (data) => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Archivo inválido' };
  }

  if (!data.states || typeof data.states !== 'object') {
    return { valid: false, error: 'Falta el campo "states"' };
  }

  // Verificar que los IDs sean válidos
  const validIds = subjects.map(s => s.id);
  const importedIds = Object.keys(data.states).map(Number);
  const invalidIds = importedIds.filter(id => !validIds.includes(id));

  if (invalidIds.length > importedIds.length / 2) {
    return { 
      valid: false, 
      error: 'Muchos IDs inválidos. ¿Es del mismo plan?' 
    };
  }

  // Verificar que los valores sean válidos (0, 1, 2)
  const hasInvalidStates = Object.values(data.states).some(
    state => ![0, 1, 2].includes(state)
  );

  if (hasInvalidStates) {
    return { valid: false, error: 'Estados inválidos en el archivo' };
  }

  return { valid: true, error: null };
};
