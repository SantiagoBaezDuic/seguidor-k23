import React from 'react';
import SubjectCard from './SubjectCard';

/**
 * Componente para mostrar una columna de nivel con sus materias
 */
const LevelColumn = ({ 
  level, 
  subjects, 
  states, 
  onSubjectClick, 
  highlightedIds = [] 
}) => {
  const levelNames = {
    1: '1° Año',
    2: '2° Año',
    3: '3° Año',
    4: '4° Año',
    5: '5° Año'
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
          subjects.map(subject => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              state={states[subject.id] || 0}
              canEnroll={subject.canEnroll}
              canTakeExam={subject.canTakeExam}
              isHighlighted={highlightedIds.includes(subject.id)}
              onClick={() => onSubjectClick(subject.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default LevelColumn;
