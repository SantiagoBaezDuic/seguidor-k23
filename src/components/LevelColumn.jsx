import React from 'react';
import SubjectCard from './SubjectCard';
import { getComparisonMatrix } from '../utils/compareProgress';

/**
 * Componente para mostrar una columna de nivel con sus materias
 */
const LevelColumn = ({ 
  level, 
  subjects, 
  states, 
  onSubjectClick, 
  highlightedIds = [],
  comparisonData = null // { userStates, classmates }
}) => {
  const levelNames = {
    1: '1° Año',
    2: '2° Año',
    3: '3° Año',
    4: '4° Año',
    5: '5° Año',
    6: 'Electivas (3°/4°)'
  };

  return (
    <div className="flex-shrink-0 w-96 p-6 relative z-10">
      {/* Header del nivel */}
      <h2 className="text-xl font-semibold text-center mb-6 text-blue-400/90">
        {levelNames[level]}
      </h2>

      {/* Materias del nivel */}
      <div className="flex flex-col gap-5">
        {subjects.length === 0 ? (
          <p className="text-gray-500 text-center text-sm italic">
            No hay materias para mostrar
          </p>
        ) : (
          subjects.map(subject => {
            const subjectState = states[subject.id] || 0;
            
            // Calcular info de comparación solo si:
            // 1. Hay compañeros cargados
            // 2. La materia está PENDIENTE para el usuario (estado 0)
            let comparisonInfo = null;
            if (comparisonData && comparisonData.classmates.length > 0 && subjectState === 0) {
              comparisonInfo = getComparisonMatrix(
                subject.id,
                comparisonData.userStates,
                comparisonData.classmates
              );
              
              // Si nadie puede cursarla (canEnrollCount === 0), no mostrar badge
              if (comparisonInfo.canEnrollCount === 0) {
                comparisonInfo = null;
              }
            }

            return (
              <SubjectCard
                key={subject.id}
                subject={subject}
                state={subjectState}
                canEnroll={subject.canEnroll}
                canTakeExam={subject.canTakeExam}
                isHighlighted={highlightedIds.includes(subject.id)}
                comparisonInfo={comparisonInfo}
                onClick={() => onSubjectClick(subject.id)}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default LevelColumn;
