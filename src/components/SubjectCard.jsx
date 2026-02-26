import React from 'react';
import { Circle, Clock, CheckCircle, GraduationCap } from 'lucide-react';
import { getSubjectsByIds } from '../utils/correlations';

/**
 * Componente para mostrar una materia individual
 */
const SubjectCard = ({ 
  subject, 
  state, 
  canEnroll, 
  canTakeExam, 
  isHighlighted, 
  onClick 
}) => {
  // Determinar el estilo según el estado
  const getStateStyles = () => {
    switch (state) {
      case 0: // No cursada
        return 'bg-gray-700 border-gray-600 text-gray-300';
      case 1: // Regular
        return 'bg-yellow-900 border-yellow-500 text-yellow-100';
      case 2: // Aprobada
        return 'bg-green-900 border-green-500 text-green-100';
      default:
        return 'bg-gray-700 border-gray-600 text-gray-300';
    }
  };

  // Determinar el icono según el estado
  const getStateIcon = () => {
    switch (state) {
      case 0:
        return <Circle className="w-4 h-4" />;
      case 1:
        return <Clock className="w-4 h-4" />;
      case 2:
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  // Tooltip con información de correlativas
  const getTooltip = () => {
    const parts = [subject.n];
    
    if (subject.rc && subject.rc.length > 0) {
      const rcNames = getSubjectsByIds(subject.rc).map(s => s.n).join(', ');
      parts.push(`Cursada: ${rcNames}`);
    }
    if (subject.ra && subject.ra.length > 0) {
      const raNames = getSubjectsByIds(subject.ra).map(s => s.n).join(', ');
      parts.push(`Aprobación: ${raNames}`);
    }
    
    return parts.join(' | ');
  };

  return (
    <button
      onClick={onClick}
      title={getTooltip()}
      data-subject-id={subject.id}
      className={`
        relative w-full p-3 rounded-lg border-2 z-20
        ${getStateStyles()}
        ${isHighlighted ? 'ring-2 ring-blue-400 animate-pulse' : ''}
        transition-all duration-300 
        hover:scale-105 hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-blue-500
        text-left
      `}
    >
      {/* Badge de Título Intermedio */}
      {subject.it && (
        <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1">
          <GraduationCap className="w-3 h-3" />
          <span className="font-semibold">TI</span>
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex items-start gap-2 mb-2">
        {getStateIcon()}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-tight">{subject.n}</h3>
        </div>
      </div>

      {/* Badges de habilitación */}
      <div className="flex flex-wrap gap-1 mt-2">
        {state === 0 && canEnroll && (
          <span className="text-xs px-2 py-0.5 bg-blue-500/30 text-blue-200 rounded-full">
            ✓ Habilitada cursar
          </span>
        )}
        {state === 1 && canTakeExam && (
          <span className="text-xs px-2 py-0.5 bg-orange-500/30 text-orange-200 rounded-full">
            ✓ Habilitada final
          </span>
        )}
        {state === 0 && !canEnroll && (
          <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 rounded-full">
            ✗ Bloqueada
          </span>
        )}
      </div>
    </button>
  );
};

export default SubjectCard;
