import subjects from '../data/subjects';

/** * Obtiene las materias completas a partir de un array de IDs
 * @param {Array<number>} ids - Array de IDs de materias
 * @returns {Array} - Array de objetos subject
 */
export const getSubjectsByIds = (ids) => {
  if (!ids || ids.length === 0) return [];
  return ids.map(id => subjects.find(s => s.id === id)).filter(Boolean);
};

/**
 * Convierte estructura de correlativas en texto legible para tooltips
 * @param {Array|Object} correlatives - Correlativas en formato legacy o nuevo
 * @returns {string} - Texto formateado (ej: "A, B, C" o "A Y (B O C)")
 */
export const correlatesToText = (correlatives) => {
  if (!correlatives) return '';
  
  // Formato legacy: array simple
  if (Array.isArray(correlatives)) {
    if (correlatives.length === 0) return '';
    const names = getSubjectsByIds(correlatives).map(s => s.n);
    return names.join(', ');
  }
  
  // Formato nuevo: objeto con all/any
  if (typeof correlatives === 'object') {
    const parts = [];
    
    // Parte "all" (AND)
    if (correlatives.all && correlatives.all.length > 0) {
      const allNames = getSubjectsByIds(correlatives.all).map(s => s.n);
      parts.push(allNames.join(', '));
    }
    
    // Parte "any" (OR)  
    if (correlatives.any && correlatives.any.length > 0) {
      const anyNames = getSubjectsByIds(correlatives.any).map(s => s.n);
      parts.push(`(${anyNames.join(' O ')})`);
    }
    
    return parts.join(' Y ');
  }
  
  return '';
};

/**
 * Evalúa correlativas con soporte para lógica AND/OR
 * @param {Array|Object} correlatives - Array simple [1,2] (AND) u objeto {all: [1], any: [2,3]} (AND + OR)
 * @param {Object} states - Estados de materias
 * @param {number} requiredState - Estado mínimo requerido (1 o 2)
 * @returns {boolean}
 */
const evaluateCorrelatives = (correlatives, states, requiredState) => {
  if (!correlatives) return true;
  
  // Formato legacy: array simple (todos deben cumplir - AND)
  if (Array.isArray(correlatives)) {
    if (correlatives.length === 0) return true;
    return correlatives.every(reqId => {
      const state = states[reqId] || 0;
      return state >= requiredState;
    });
  }
  
  // Formato nuevo: objeto con all/any (lógica AND + OR)
  if (typeof correlatives === 'object') {
    // all: todos deben cumplir (AND)
    const allOk = !correlatives.all || correlatives.all.length === 0 || correlatives.all.every(reqId => {
      const state = states[reqId] || 0;
      return state >= requiredState;
    });
    
    // any: al menos uno debe cumplir (OR)
    const anyOk = !correlatives.any || correlatives.any.length === 0 || correlatives.any.some(reqId => {
      const state = states[reqId] || 0;
      return state >= requiredState;
    });
    
    return allOk && anyOk;
  }
  
  return true;
};

/** * Verifica si una materia puede ser cursada según las correlativas de cursada y aprobación
 * @param {number} subjectId - ID de la materia
 * @param {Object} states - Objeto con estados de todas las materias {id: estado}
 * @returns {boolean} - true si cumple todas las correlativas (rc en estado 1 o 2, ra en estado 2)
 */
export const canEnroll = (subjectId, states) => {
  const subject = subjects.find(s => s.id === subjectId);
  if (!subject) return false;
  
  // Verificar correlativas de cursada (deben estar Regular o Aprobadas - estado >= 1)
  const rcOk = evaluateCorrelatives(subject.rc, states, 1);
  
  // Verificar correlativas de aprobación (deben estar Aprobadas - estado >= 2)
  const raOk = evaluateCorrelatives(subject.ra, states, 2);
  
  return rcOk && raOk;
};

/**
 * Verifica si una materia puede rendir el final según las correlativas de aprobación
 * @param {number} subjectId - ID de la materia
 * @param {Object} states - Objeto con estados de todas las materias
 * @returns {boolean} - true si cumple las correlativas de aprobación
 */
export const canTakeExam = (subjectId, states) => {
  const subject = subjects.find(s => s.id === subjectId);
  if (!subject) return false;
  
  // Si no tiene correlativas de aprobación, puede rendir cuando quiera
  if (!subject.ra) return true;
  if (Array.isArray(subject.ra) && subject.ra.length === 0) return true;
  if (typeof subject.ra === 'object' && !subject.ra.all && !subject.ra.any) return true;
  
  // Verificar correlativas de aprobación usando evaluateCorrelatives
  return evaluateCorrelatives(subject.ra, states, 2);
};

/**
 * Verifica si un subjectId está incluido en estructura de correlativas (array u objeto)
 * @param {Array|Object} correlatives - Correlativas en formato legacy o nuevo
 * @param {number} targetId - ID a buscar
 * @returns {boolean}
 */
const includesInCorrelatives = (correlatives, targetId) => {
  if (!correlatives) return false;
  
  if (Array.isArray(correlatives)) {
    return correlatives.includes(targetId);
  }
  
  if (typeof correlatives === 'object') {
    const inAll = correlatives.all && correlatives.all.includes(targetId);
    const inAny = correlatives.any && correlatives.any.includes(targetId);
    return inAll || inAny;
  }
  
  return false;
};

/**
 * Obtiene las materias que dependen de una materia específica
 * @param {number} subjectId - ID de la materia
 * @param {Array} allSubjects - Array de todas las materias
 * @returns {Array} - Array de materias que tienen a subjectId como correlativa
 */
export const getAffectedSubjects = (subjectId, allSubjects = subjects) => {
  return allSubjects.filter(subject => {
    const hasInCursada = includesInCorrelatives(subject.rc, subjectId);
    const hasInAprobacion = includesInCorrelatives(subject.ra, subjectId);
    return hasInCursada || hasInAprobacion;
  });
};

/**
 * Calcula el progreso general de todas las materias
 * @param {Object} states - Objeto con estados de todas las materias
 * @returns {Object} - Estadísticas {total, noCursadas, regulares, aprobadas, porcentaje}
 */
export const calculateProgress = (states) => {
  // Separar materias obligatorias y electivas
  const obligatorias = subjects.filter(s => !s.isElective);
  const electivas = subjects.filter(s => s.isElective);
  
  // Total requerido: 37 obligatorias + 7 electivas = 44 materias
  const ELECTIVAS_REQUERIDAS = 7;
  const totalRequerido = obligatorias.length + ELECTIVAS_REQUERIDAS;
  
  let noCursadas = 0;
  let regulares = 0;
  let aprobadas = 0;
  
  // Contar obligatorias
  obligatorias.forEach(subject => {
    const state = states[subject.id] || 0;
    if (state === 0) noCursadas++;
    else if (state === 1) regulares++;
    else if (state === 2) aprobadas++;
  });
  
  // Contar electivas (máximo 7 cuentan para el progreso)
  let electivasNoCursadas = 0;
  let electivasRegulares = 0;
  let electivasAprobadas = 0;
  
  electivas.forEach(subject => {
    const state = states[subject.id] || 0;
    if (state === 0) electivasNoCursadas++;
    else if (state === 1) electivasRegulares++;
    else if (state === 2) electivasAprobadas++;
  });
  
  // Sumar electivas al total (limitando a 7)
  noCursadas += Math.max(0, ELECTIVAS_REQUERIDAS - electivasRegulares - electivasAprobadas);
  regulares += Math.min(electivasRegulares, ELECTIVAS_REQUERIDAS - electivasAprobadas);
  aprobadas += Math.min(electivasAprobadas, ELECTIVAS_REQUERIDAS);
  
  const porcentaje = totalRequerido > 0 ? Math.round((aprobadas / totalRequerido) * 100) : 0;
  
  return {
    total: totalRequerido,
    noCursadas,
    regulares,
    aprobadas,
    porcentaje
  };
};

/**
 * Verifica si se han completado todos los requisitos del Título Intermedio
 * @param {Object} states - Objeto con estados de todas las materias
 * @returns {boolean} - true si todas las materias con it:true están aprobadas
 */
export const checkIntermediateTitle = (states) => {
  const intermediateSubjects = subjects.filter(s => s.it === true);
  
  return intermediateSubjects.every(subject => {
    const state = states[subject.id] || 0;
    return state === 2; // Debe estar aprobada
  });
};

/**
 * Calcula el progreso del Título Intermedio
 * @param {Object} states - Objeto con estados de todas las materias
 * @returns {Object} - {completed, total, porcentaje, isComplete}
 */
export const calculateIntermediateProgress = (states) => {
  const intermediateSubjects = subjects.filter(s => s.it === true);
  const total = intermediateSubjects.length;
  
  const completed = intermediateSubjects.filter(subject => {
    const state = states[subject.id] || 0;
    return state === 2; // Solo cuentan las aprobadas
  }).length;
  
  const porcentaje = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = checkIntermediateTitle(states);
  
  return {
    completed,
    total,
    porcentaje,
    isComplete
  };
};

/**
 * Obtiene las materias del Título Intermedio
 * @returns {Array} - Array de materias con it:true
 */
export const getIntermediateSubjects = () => {
  return subjects.filter(s => s.it === true);
};
