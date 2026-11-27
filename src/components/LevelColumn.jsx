import React from 'react';
import SubjectCard from './SubjectCard';
import { getComparisonMatrix } from '../utils/compareProgress';

const LEVEL_NAMES = {
  1: '1° Año',
  2: '2° Año',
  3: '3° Año',
  4: '4° Año',
  5: '5° Año',
  6: 'Electivas (3°/4°)'
};

/**
 * Componente para mostrar una columna de nivel con sus materias
 */
const LevelColumn = ({
  level,
  subjects,
  states,
  onSubjectClick,
  onSubjectStepBack,
  highlightedIds = [],
  focusId = null,
  relatedIds = null, // Set de IDs relacionados con la materia enfocada (null = sin foco)
  onFocusChange,
  levelStats = null, // { aprobadas, total }
  comparisonData = null, // { userStates, userExceptions, classmates }
  onToggleException,
  layout = 'column' // 'column' (una tira vertical dentro del grid horizontal) o 'grid' (grilla compacta multi-columna, para secciones independientes como Electivas)
}) => {
  const isGrid = layout === 'grid';

  const wrapperClass = isGrid
    ? 'w-full relative z-10'
    : 'flex-shrink-0 w-72 relative z-10';

  const listClass = isGrid
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'
    : 'flex flex-col gap-4';

  const percentage = levelStats && levelStats.total > 0
    ? Math.round((levelStats.aprobadas / levelStats.total) * 100)
    : 0;

  return (
    <div className={wrapperClass}>
      {/* Header del nivel (fijo al scrollear verticalmente el plan) */}
      <div
        className={`mb-4 pb-2 ${isGrid ? '' : 'sticky -top-8 z-30 pt-8 -mt-8 bg-[#0b111f]/95 backdrop-blur-sm'}`}
      >
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-gray-100">
            {LEVEL_NAMES[level]}
          </h2>
          {levelStats && (
            <span className="text-xs text-gray-400 tabular-nums">
              {levelStats.aprobadas}/{levelStats.total} aprobadas
            </span>
          )}
        </div>
        {levelStats && (
          <div className="mt-2 h-1 rounded-full bg-gray-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
      </div>

      {/* Materias del nivel */}
      <div className={listClass}>
        {subjects.length === 0 ? (
          <p className="text-gray-500 text-center text-sm italic col-span-full py-4">
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
                comparisonData.classmates,
                comparisonData.userExceptions
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
                meetsCorrelatives={subject.meetsCorrelatives}
                hasException={subject.hasException}
                onToggleException={onToggleException ? () => onToggleException(subject.id) : undefined}
                isHighlighted={highlightedIds.includes(subject.id)}
                isFocused={focusId === subject.id}
                isDimmed={relatedIds !== null && !relatedIds.has(subject.id)}
                comparisonInfo={comparisonInfo}
                onClick={() => onSubjectClick(subject.id)}
                onStepBack={onSubjectStepBack ? () => onSubjectStepBack(subject.id) : undefined}
                onFocusChange={onFocusChange}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default LevelColumn;
