import React from 'react';
import { CheckCircle2, BookOpen, Clock, Lock, CircleDot, Users, ShieldAlert } from 'lucide-react';
import { correlatesToText } from '../utils/correlations';

/**
 * Estilos visuales por estado. "Habilitada" y "Bloqueada" son variantes del
 * estado 0 (No cursada) según si se cumplen las correlativas.
 */
const STATUS_STYLES = {
  aprobada: {
    label: 'Aprobada',
    icon: CheckCircle2,
    card: 'bg-emerald-950/60 border-emerald-700/60',
    accent: 'bg-emerald-400',
    title: 'text-emerald-50',
    pill: 'bg-emerald-500/15 text-emerald-300'
  },
  regular: {
    label: 'Regular',
    icon: Clock,
    card: 'bg-amber-950/50 border-amber-700/60',
    accent: 'bg-amber-400',
    title: 'text-amber-50',
    pill: 'bg-amber-500/15 text-amber-300'
  },
  cursando: {
    label: 'Cursando',
    icon: BookOpen,
    card: 'bg-sky-950/60 border-sky-600/70',
    accent: 'bg-sky-400',
    title: 'text-sky-50',
    pill: 'bg-sky-500/15 text-sky-300'
  },
  habilitada: {
    label: 'Habilitada',
    icon: CircleDot,
    card: 'bg-gray-800/90 border-blue-500/60 shadow-[0_0_0_1px_rgba(59,130,246,0.15)]',
    accent: 'bg-blue-400',
    title: 'text-gray-100',
    pill: 'bg-blue-500/15 text-blue-300'
  },
  bloqueada: {
    label: 'Bloqueada',
    icon: Lock,
    card: 'bg-gray-900 border-gray-800',
    accent: 'bg-gray-700',
    title: 'text-gray-400',
    pill: 'bg-gray-700/40 text-gray-400'
  }
};

const getStatusKey = (state, canEnroll) => {
  if (state === 3) return 'aprobada';
  if (state === 2) return 'regular';
  if (state === 1) return 'cursando';
  return canEnroll ? 'habilitada' : 'bloqueada';
};

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
  isDimmed = false,
  isFocused = false,
  comparisonInfo, // { canEnrollCount, total, allCanEnroll }
  onClick,
  onStepBack, // retroceder al estado anterior (click derecho / Backspace)
  onFocusChange // (id | null) => void, para resaltar la red de correlativas
}) => {
  const status = STATUS_STYLES[getStatusKey(state, canEnroll)];
  const StatusIcon = status.icon;

  // Tooltip con información de correlativas
  const getTooltip = () => {
    const parts = [subject.n];

    const rcText = correlatesToText(subject.rc);
    if (rcText) parts.push(`Cursada: ${rcText}`);

    const raText = correlatesToText(subject.ra);
    if (raText) parts.push(`Aprobación: ${raText}`);

    if (hasException) {
      parts.push('Excepción de correlativas otorgada (el final sigue requiriendo las correlativas aprobadas)');
    }

    if (state !== 0 && onStepBack) {
      parts.push('Click: avanzar estado · Click derecho: retroceder');
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
    } else if ((e.key === 'Backspace' || e.key === 'Delete') && state !== 0) {
      e.preventDefault();
      onStepBack?.();
    }
  };

  const handleContextMenu = (e) => {
    if (!onStepBack || state === 0) return; // sin estado previo: menú nativo
    e.preventDefault();
    onStepBack();
  };

  // Solo el mouse dispara el foco por hover; en touch el tap ya cambia el estado
  const handlePointerEnter = (e) => {
    if (e.pointerType === 'mouse') onFocusChange?.(subject.id);
  };
  const handlePointerLeave = (e) => {
    if (e.pointerType === 'mouse') onFocusChange?.(null);
  };

  const pillBase = 'text-[11px] leading-none px-2 py-1 rounded-full inline-flex items-center gap-1 whitespace-nowrap';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onContextMenu={handleContextMenu}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={(e) => e.target === e.currentTarget && onFocusChange?.(subject.id)}
      onBlur={(e) => e.target === e.currentTarget && onFocusChange?.(null)}
      title={getTooltip()}
      aria-label={`${subject.n}: ${status.label}`}
      data-subject-id={subject.id}
      className={`
        group relative w-full pl-4 pr-3 py-2.5 rounded-lg border z-20 text-left
        cursor-pointer select-none overflow-visible
        transition-[opacity,box-shadow,filter] duration-150
        hover:brightness-125
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
        ${status.card}
        ${hasException ? 'border-dashed' : ''}
        ${isDimmed ? 'opacity-30' : 'opacity-100'}
        ${isFocused ? 'ring-2 ring-white/70 shadow-lg shadow-black/50' : ''}
        ${isHighlighted && !isFocused ? 'ring-2 ring-blue-400' : ''}
      `}
    >
      {/* Barra de acento por estado */}
      <span className={`absolute left-0 top-2 bottom-2 w-1 rounded-r ${status.accent}`} aria-hidden="true" />

      {/* Badge de Comparación con Compañeros */}
      {comparisonInfo && comparisonInfo.total > 1 && (
        <div
          className={`absolute -top-2 -right-2 text-[11px] px-1.5 py-0.5 rounded-full flex items-center gap-1 z-10 ${
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

      {/* Nombre */}
      <h3 className={`font-semibold text-[13px] leading-snug ${status.title}`}>
        {subject.n}
      </h3>

      {/* Fila de estado e indicadores */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        <span className={`${pillBase} ${status.pill}`}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>

        {state === 2 && (
          canTakeExam ? (
            <span className={`${pillBase} bg-orange-500/15 text-orange-300`}>Final habilitado</span>
          ) : (
            <span className={`${pillBase} bg-red-500/15 text-red-300`}>Final bloqueado</span>
          )
        )}

        {subject.it && (
          <span
            className="text-[10px] leading-none px-1.5 py-1 rounded font-semibold text-purple-300 border border-purple-500/40"
            title="Cuenta para el Título Intermedio (Analista de Sistemas)"
          >
            TI
          </span>
        )}

        {subject.code && (
          <span className="text-[10px] leading-none px-1.5 py-1 bg-indigo-500/15 text-indigo-300 rounded font-mono">
            {subject.code}
          </span>
        )}

        {comparisonInfo && comparisonInfo.allCanEnroll && (
          <span className={`${pillBase} bg-cyan-500/20 text-cyan-200`}>
            <Users className="w-3 h-3" />
            Grupo completo
          </span>
        )}

        {/* Excepción de correlativas */}
        {showExceptionControl && hasException && (
          <button
            type="button"
            onClick={handleExceptionClick}
            title="Cursada con excepción de correlativas. Click para quitarla."
            className={`${pillBase} bg-amber-500/25 text-amber-200 hover:bg-amber-500/40
              focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400`}
          >
            <ShieldAlert className="w-3 h-3" />
            Excepción
          </button>
        )}
        {showExceptionControl && !hasException && state === 0 && (
          // Visible solo al pasar el mouse / enfocar (en pantallas táctiles, siempre)
          <button
            type="button"
            onClick={handleExceptionClick}
            title="Marcar que te otorgaron excepción de correlativas para cursar esta materia"
            className={`${pillBase} border border-amber-500/40 text-amber-300 hover:bg-amber-500/15
              md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 md:focus:opacity-100
              transition-opacity focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400`}
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
            className={`${pillBase} bg-red-500/15 text-red-300 hover:bg-red-500/25
              focus:outline-none focus-visible:ring-1 focus-visible:ring-red-400`}
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
