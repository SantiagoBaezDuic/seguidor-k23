import React from 'react';
import { Circle, BookOpen, Clock, CheckCircle, GraduationCap, Users, ShieldAlert } from 'lucide-react';
import { correlatesToText } from '../utils/correlations';

/**
 * Componente para mostrar una materia individual
 */
const SubjectCard = ({ 
  subject, 
  state, 
  canEnroll, 
  canTakeExam, 
  meetsCorrelatives = true,
  hasException = false,
  onToggleException,
  isHighlighted,
  comparisonInfo, // { canEnrollCount, total, allCanEnroll }
  onClick 
}) => {
  // Determinar el estilo según el estado
  const getStateStyles = () => {
    switch (state) {
      case 0: // No cursada
        return 'bg-gray-700 border-gray-600 text-gray-300';
      case 1: // Cursando
        return 'bg-sky-900 border-sky-500 text-sky-100';
      case 2: // Regular
        return 'bg-yellow-900 border-yellow-500 text-yellow-100';
      case 3: // Aprobada
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
        return <BookOpen className="w-4 h-4" />;
      case 2:
        return <Clock className="w-4 h-4" />;
      case 3:
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  // Tooltip con información de correlativas
  const getTooltip = () => {
    const parts = [subject.n];
    
    const rcText = correlatesToText(subject.rc);
    if (rcText) {
      parts.push(`Cursada: ${rcText}`);
    }
    
    const raText = correlatesToText(subject.ra);
    if (raText) {
      parts.push(`Aprobación: ${raText}`);
    }
    
    if (hasException) {
      parts.push('Excepción de correlativas otorgada (el final sigue requiriendo las correlativas aprobadas)');
    }

    return parts.join(' | ');
  };

  // El chip de excepción solo tiene sentido si faltan correlativas
  const showExceptionControl = !meetsCorrelatives && typeof onToggleException === 'function';

  const handleExceptionClick = (e) => {
    e.stopPropagation(); // no ciclar el estado de la materia
    onToggleException();
  };

  const handleKeyDown = (e) => {
    if (e.target !== e.currentTarget) return; // teclas sobre el chip interno
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      title={getTooltip()}
      data-subject-id={subject.id}
      className={`
        relative w-full p-3 rounded-lg border-2 z-20
        ${getStateStyles()}
        ${isHighlighted ? 'ring-2 ring-blue-400 animate-pulse' : ''}
        transition-all duration-300 
        cursor-pointer select-none
        ${hasException ? 'border-dashed' : ''}
        hover:scale-105 hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-blue-500
        text-left
      `}
    >
      {/* Badge de Título Intermedio */}
      {subject.it && (
        <div className="absolute -top-2 -left-2 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1 z-10">
          <GraduationCap className="w-3 h-3" />
          <span className="font-semibold">TI</span>
        </div>
      )}

      {/* Badge de Comparación con Compañeros */}
      {comparisonInfo && comparisonInfo.total > 1 && (
        <div 
          className={`absolute -top-2 -right-2 text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1 z-10 ${
            comparisonInfo.allCanEnroll 
              ? 'bg-cyan-600 text-white' 
              : 'bg-gray-600 text-gray-200'
          }`}
          title={`${comparisonInfo.canEnrollCount} de ${comparisonInfo.total} pueden cursarla`}
        >
          <Users className="w-3 h-3" />
          <span className="font-semibold">{comparisonInfo.canEnrollCount}/{comparisonInfo.total}</span>
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex items-start gap-2 mb-2">
        {getStateIcon()}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-tight">{subject.n}</h3>
          {subject.code && (
            <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30 font-mono">
              {subject.code}
            </span>
          )}
        </div>
      </div>

      {/* Badges de habilitación */}
      <div className="flex flex-wrap gap-1 mt-2">
        {comparisonInfo && comparisonInfo.allCanEnroll && (
          <span className="text-xs px-2 py-0.5 bg-cyan-500/30 text-cyan-200 rounded-full flex items-center gap-1">
            <Users className="w-3 h-3" />
            Grupo completo
          </span>
        )}
        {state === 0 && canEnroll && (
          <span className="text-xs px-2 py-0.5 bg-blue-500/30 text-blue-200 rounded-full">
            ✓ Habilitada cursar
          </span>
        )}
        {state === 1 && (
          <span className="text-xs px-2 py-0.5 bg-sky-500/30 text-sky-200 rounded-full">
            ● Cursando
          </span>
        )}
        {state === 2 && canTakeExam && (
          <span className="text-xs px-2 py-0.5 bg-orange-500/30 text-orange-200 rounded-full">
            ✓ Habilitada final
          </span>
        )}
        {state === 2 && !canTakeExam && (
          <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 rounded-full">
            ✗ Final bloqueado
          </span>
        )}
        {state === 0 && !canEnroll && (
          <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 rounded-full">
            ✗ Bloqueada
          </span>
        )}

        {/* Excepción de correlativas */}
        {showExceptionControl && hasException && (
          <button
            type="button"
            onClick={handleExceptionClick}
            title="Cursada con excepción de correlativas. Click para quitarla."
            className="text-xs px-2 py-0.5 bg-amber-500/30 text-amber-200 rounded-full flex items-center gap-1
              hover:bg-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-400"
          >
            <ShieldAlert className="w-3 h-3" />
            Excepción
          </button>
        )}
        {showExceptionControl && !hasException && state === 0 && (
          <button
            type="button"
            onClick={handleExceptionClick}
            title="Marcar que te otorgaron excepción de correlativas para cursar esta materia"
            className="text-xs px-2 py-0.5 border border-amber-500/50 text-amber-300 rounded-full flex items-center gap-1
              hover:bg-amber-500/20 focus:outline-none focus:ring-1 focus:ring-amber-400"
          >
            <ShieldAlert className="w-3 h-3" />
            Pedir excepción
          </button>
        )}
        {showExceptionControl && !hasException && state !== 0 && (
          <button
            type="button"
            onClick={handleExceptionClick}
            title="Esta materia figura cursada pero le faltan correlativas. Click para marcarla como excepción."
            className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 rounded-full flex items-center gap-1
              hover:bg-red-500/30 focus:outline-none focus:ring-1 focus:ring-red-400"
          >
            <ShieldAlert className="w-3 h-3" />
            Sin correlativas · ¿excepción?
          </button>
        )}
      </div>
    </div>
  );
};

export default SubjectCard;
