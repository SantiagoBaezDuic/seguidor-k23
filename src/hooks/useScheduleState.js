import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

/**
 * Hook para gestionar horarios de materias
 * Formato: { materiaId: [{ day, startSlot, endSlot }] }
 */
export const useScheduleState = () => {
  const [schedule, setSchedule] = useLocalStorage('isi-tracker-schedule', {});

  /**
   * Agrega un bloque horario a una materia
   */
  const addSlot = (subjectId, day, startSlot, endSlot) => {
    // Validar límites
    if (day < 0 || day > 6) {
      console.error('Día inválido (0-6)');
      return false;
    }
    
    if (startSlot < 0 || startSlot > 19 || endSlot < 0 || endSlot > 19) {
      console.error('Franja inválida (0-19)');
      return false;
    }
    
    if (startSlot >= endSlot) {
      console.error('La franja de inicio debe ser menor que la de fin');
      return false;
    }

    // Verificar conflictos antes de agregar
    const conflicts = getConflicts(subjectId, day, startSlot, endSlot);
    if (conflicts.length > 0) {
      console.warn('Conflicto detectado con:', conflicts);
      // Permitir agregar de todos modos, el componente mostrará el warning
    }

    const newSlot = { day, startSlot, endSlot };
    
    setSchedule(prev => ({
      ...prev,
      [subjectId]: [...(prev[subjectId] || []), newSlot]
    }));

    return true;
  };

  /**
   * Elimina un bloque horario específico de una materia
   */
  const removeSlot = (subjectId, slotIndex) => {
    setSchedule(prev => {
      const subjectSlots = prev[subjectId] || [];
      const newSlots = subjectSlots.filter((_, idx) => idx !== slotIndex);
      
      if (newSlots.length === 0) {
        // Si no quedan slots, eliminar la materia del schedule
        const { [subjectId]: removed, ...rest } = prev;
        return rest;
      }
      
      return {
        ...prev,
        [subjectId]: newSlots
      };
    });
  };

  /**
   * Elimina todos los horarios de una materia
   */
  const clearSubjectSchedule = (subjectId) => {
    setSchedule(prev => {
      const { [subjectId]: removed, ...rest } = prev;
      return rest;
    });
  };

  /**
   * Elimina todas las materias que no están en la lista de IDs proporcionada
   * Útil cuando se deselecciona una materia en CoursePlanner
   */
  const syncWithSelectedSubjects = (selectedSubjectIds) => {
    setSchedule(prev => {
      const filtered = {};
      selectedSubjectIds.forEach(id => {
        if (prev[id]) {
          filtered[id] = prev[id];
        }
      });
      return filtered;
    });
  };

  /**
   * Detecta conflictos para un nuevo slot (sin agregarlo)
   * Retorna array de { subjectId, slotIndex } que tienen conflicto
   */
  const getConflicts = (newSubjectId, day, startSlot, endSlot) => {
    const conflicts = [];

    Object.entries(schedule).forEach(([subjectId, slots]) => {
      // No verificar conflictos con la misma materia
      if (parseInt(subjectId) === newSubjectId) return;

      slots.forEach((slot, slotIndex) => {
        if (slot.day === day) {
          // Verificar superposición de franjas
          const overlaps = (
            (startSlot >= slot.startSlot && startSlot < slot.endSlot) ||
            (endSlot > slot.startSlot && endSlot <= slot.endSlot) ||
            (startSlot <= slot.startSlot && endSlot >= slot.endSlot)
          );

          if (overlaps) {
            conflicts.push({
              subjectId: parseInt(subjectId),
              slotIndex,
              day,
              startSlot: slot.startSlot,
              endSlot: slot.endSlot
            });
          }
        }
      });
    });

    return conflicts;
  };

  /**
   * Verifica si una celda específica tiene un conflicto
   * Retorna true si hay 2 o más materias en esa celda
   */
  const hasConflictInCell = (day, slot) => {
    let count = 0;

    Object.values(schedule).forEach(slots => {
      slots.forEach(s => {
        if (s.day === day && slot >= s.startSlot && slot < s.endSlot) {
          count++;
        }
      });
    });

    return count > 1;
  };

  /**
   * Obtiene todas las materias asignadas a una celda específica
   */
  const getSubjectsInCell = (day, slot) => {
    const subjects = [];

    Object.entries(schedule).forEach(([subjectId, slots]) => {
      slots.forEach(s => {
        if (s.day === day && slot >= s.startSlot && slot < s.endSlot) {
          subjects.push(parseInt(subjectId));
        }
      });
    });

    return subjects;
  };

  /**
   * Limpia todo el schedule
   */
  const clearAll = () => {
    setSchedule({});
  };

  return {
    schedule,
    setSchedule,
    addSlot,
    removeSlot,
    clearSubjectSchedule,
    syncWithSelectedSubjects,
    getConflicts,
    hasConflictInCell,
    getSubjectsInCell,
    clearAll
  };
};
