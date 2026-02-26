import subjects from '../data/subjects';

/** * Obtiene las materias completas a partir de un array de IDs
 * @param {Array<number>} ids - Array de IDs de materias
 * @returns {Array} - Array de objetos subject
 */
export const getSubjectsByIds = (ids) => {
  if (!ids || ids.length === 0) return [];
  return ids.map(id => subjects.find(s => s.id === id)).filter(Boolean);
};

/** * Verifica si una materia puede ser cursada según las correlativas de cursada y aprobación
 * @param {number} subjectId - ID de la materia
 * @param {Object} states - Objeto con estados de todas las materias {id: estado}
 * @returns {boolean} - true si cumple todas las correlativas (rc en estado 1 o 2, ra en estado 2)
 */
export const canEnroll = (subjectId, states) => {
  const subject = subjects.find(s => s.id === subjectId);
  if (!subject) return false;
  
  // Verificar correlativas de cursada (deben estar Regular o Aprobadas)
  const rcOk = !subject.rc || subject.rc.length === 0 || subject.rc.every(reqId => {
    const state = states[reqId] || 0;
    return state === 1 || state === 2;
  });
  
  // Verificar correlativas de aprobación (deben estar Aprobadas)
  const raOk = !subject.ra || subject.ra.length === 0 || subject.ra.every(reqId => {
    const state = states[reqId] || 0;
    return state === 2;
  });
  
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
  if (!subject.ra || subject.ra.length === 0) return true;
  
  // Todas las correlativas de aprobación deben estar en estado 2 (Aprobada)
  return subject.ra.every(reqId => {
    const state = states[reqId] || 0;
    return state === 2;
  });
};

/**
 * Obtiene las materias que dependen de una materia específica
 * @param {number} subjectId - ID de la materia
 * @param {Array} allSubjects - Array de todas las materias
 * @returns {Array} - Array de materias que tienen a subjectId como correlativa
 */
export const getAffectedSubjects = (subjectId, allSubjects = subjects) => {
  return allSubjects.filter(subject => {
    const hasInCursada = subject.rc && subject.rc.includes(subjectId);
    const hasInAprobacion = subject.ra && subject.ra.includes(subjectId);
    return hasInCursada || hasInAprobacion;
  });
};

/**
 * Calcula el progreso general de todas las materias
 * @param {Object} states - Objeto con estados de todas las materias
 * @returns {Object} - Estadísticas {total, noCursadas, regulares, aprobadas, porcentaje}
 */
export const calculateProgress = (states) => {
  const total = subjects.length;
  let noCursadas = 0;
  let regulares = 0;
  let aprobadas = 0;
  
  subjects.forEach(subject => {
    const state = states[subject.id] || 0;
    if (state === 0) noCursadas++;
    else if (state === 1) regulares++;
    else if (state === 2) aprobadas++;
  });
  
  const porcentaje = total > 0 ? Math.round((aprobadas / total) * 100) : 0;
  
  return {
    total,
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
