import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, Calendar, AlertTriangle } from 'lucide-react';

/**
 * Componente para planificar qué materias cursar
 * Muestra materias disponibles y calcula carga horaria total
 */
const CoursePlanner = ({ availableSubjects, selectedSubjects, onSelectionChange }) => {
  // Calcular carga horaria total
  const totalHours = selectedSubjects.reduce((sum, subjectId) => {
    const subject = availableSubjects.find(s => s.id === subjectId);
    return sum + (subject?.h || 0);
  }, 0);

  const isOverloaded = totalHours > 30;
  const isHeavy = totalHours > 24 && totalHours <= 30;

  /**
   * Maneja el toggle de selección de una materia
   */
  const handleToggle = (subjectId) => {
    if (selectedSubjects.includes(subjectId)) {
      onSelectionChange(selectedSubjects.filter(id => id !== subjectId));
    } else {
      onSelectionChange([...selectedSubjects, subjectId]);
    }
  };

  /**
   * Obtiene el label de modalidad
   */
  const getModalityLabel = (modality) => {
    return modality === 'A' ? 'Anual' : 'Cuatrimestral';
  };

  /**
   * Obtiene el color del badge de nivel
   */
  const getLevelColor = (level) => {
    const colors = {
      1: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
      2: 'bg-green-500/20 text-green-300 border-green-500/50',
      3: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
      4: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
      5: 'bg-red-500/20 text-red-300 border-red-500/50',
    };
    return colors[level] || colors[1];
  };

  if (availableSubjects.length === 0) {
    return (
      <div className="bg-gray-800/30 rounded-lg p-8 text-center">
        <BookOpen className="w-12 h-12 mx-auto text-gray-600 mb-4" />
        <p className="text-gray-400 text-lg mb-2">No hay materias disponibles para cursar</p>
        <p className="text-gray-500 text-sm">
          Completa las correlativas necesarias para habilitar nuevas materias
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Resumen de carga horaria */}
      <div className={`rounded-lg p-4 border-2 transition-colors ${
        isOverloaded 
          ? 'bg-red-900/20 border-red-500 text-red-200' 
          : isHeavy
          ? 'bg-yellow-900/20 border-yellow-500 text-yellow-200'
          : 'bg-blue-900/20 border-blue-500 text-blue-200'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6" />
            <div>
              <p className="font-semibold text-lg">
                Carga horaria total: {totalHours} horas semanales
              </p>
              <p className="text-sm opacity-80">
                {selectedSubjects.length} {selectedSubjects.length === 1 ? 'materia seleccionada' : 'materias seleccionadas'}
              </p>
            </div>
          </div>
          
          {isOverloaded && (
            <div className="flex items-center gap-2 text-red-300">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm font-medium">¡Carga muy alta! (recomendado: {'<'} 30hs)</span>
            </div>
          )}
          
          {isHeavy && !isOverloaded && (
            <div className="text-sm font-medium text-yellow-300">
              Carga considerable (recomendado: {'<'} 24hs)
            </div>
          )}

          {totalHours <= 24 && selectedSubjects.length > 0 && (
            <div className="text-sm font-medium text-blue-300">
              Carga balanceada ✓
            </div>
          )}
        </div>
      </div>

      {/* Lista de materias disponibles */}
      <div className="bg-gray-800/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Materias disponibles ({availableSubjects.length})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableSubjects.map(subject => {
            const isSelected = selectedSubjects.includes(subject.id);
            
            return (
              <label
                key={subject.id}
                className={`
                  flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer
                  transition-all duration-200
                  ${isSelected 
                    ? 'bg-blue-900/30 border-blue-500 shadow-lg' 
                    : 'bg-gray-700/30 border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
                  }
                `}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggle(subject.id)}
                  className="mt-1 w-4 h-4 rounded border-gray-500 bg-gray-700 
                    text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0
                    cursor-pointer"
                />
                
                {/* Información de la materia */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-200 mb-2 leading-tight">
                    {subject.n}
                  </h4>
                  
                  <div className="flex flex-wrap gap-2 text-xs">
                    {/* Badge de nivel */}
                    <span className={`px-2 py-0.5 rounded-full border ${getLevelColor(subject.l)}`}>
                      Nivel {subject.l}
                    </span>
                    
                    {/* Horas */}
                    <span className="px-2 py-0.5 rounded-full bg-gray-600/50 text-gray-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {subject.h}hs/sem
                    </span>
                    
                    {/* Modalidad */}
                    <span className="px-2 py-0.5 rounded-full bg-gray-600/50 text-gray-300 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {getModalityLabel(subject.m)}
                    </span>
                    
                    {/* Badge TI */}
                    {subject.it && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-semibold">
                        TI
                      </span>
                    )}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CoursePlanner;
