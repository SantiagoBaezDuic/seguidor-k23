import React, { useState } from 'react';
import { GraduationCap, ChevronDown, Lock, PartyPopper } from 'lucide-react';
import SectionHeader from './SectionHeader';

/**
 * Componente que muestra las materias Regulares (final no rendido) junto con
 * cuántas y cuáles materias dependen de que se apruebe ese final para poder cursarse.
 */
const PendingFinals = ({ pendingFinals = [] }) => {
  const [expandedIds, setExpandedIds] = useState(new Set());

  const toggleExpansion = (subjectId) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(subjectId)) {
        next.delete(subjectId);
      } else {
        next.add(subjectId);
      }
      return next;
    });
  };

  // Ordenar: primero los finales que bloquean más materias (mayor impacto)
  const sortedPendingFinals = [...pendingFinals].sort(
    (a, b) => b.blocking.length - a.blocking.length
  );

  return (
    <div className="panel p-5 space-y-4">
      <SectionHeader
        icon={GraduationCap}
        title="Finales pendientes"
        badge={pendingFinals.length > 0 && (
          <span className="pill bg-amber-500/15 text-amber-300">{pendingFinals.length}</span>
        )}
        description={pendingFinals.length > 0
          ? 'Materias regulares con el final sin rendir, ordenadas por cuántas materias te destraba cada una.'
          : undefined}
      />

      {sortedPendingFinals.length === 0 ? (
        <div className="panel-inset p-6 flex flex-col items-center text-center gap-2">
          <PartyPopper className="w-6 h-6 text-gray-500" />
          <p className="text-sm text-gray-300">No tenés finales pendientes</p>
          <p className="text-xs text-gray-500">Cuando regularices una materia, aparece acá hasta que apruebes el final.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          {sortedPendingFinals.map(({ subject, blocking }) => {
            const isExpanded = expandedIds.has(subject.id);
            const isBlocking = blocking.length > 0;

            return (
              <div key={subject.id} className="panel-inset relative overflow-hidden">
                <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r bg-amber-400" aria-hidden="true" />
                <button
                  onClick={() => isBlocking && toggleExpansion(subject.id)}
                  aria-expanded={isBlocking ? isExpanded : undefined}
                  className={`w-full pl-5 pr-4 py-3 flex items-center justify-between gap-3 text-left transition-colors
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400 ${
                    isBlocking ? 'hover:bg-gray-800/40 cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-100">{subject.n}</p>
                    <p className="text-xs text-gray-500">{subject.l}° año</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isBlocking ? (
                      <>
                        <span className="pill bg-red-500/15 text-red-300">
                          <Lock className="w-3 h-3" />
                          Bloquea a {blocking.length}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </>
                    ) : (
                      <span className="pill bg-gray-700/40 text-gray-400">No bloquea materias</span>
                    )}
                  </div>
                </button>

                {isExpanded && isBlocking && (
                  <div className="pl-5 pr-4 pb-4 pt-3 border-t border-gray-800">
                    <p className="text-xs text-gray-500 mb-2">Necesitan que apruebes este final:</p>
                    <ul className="flex flex-wrap gap-1.5">
                      {blocking.map(blockedSubject => (
                        <li
                          key={blockedSubject.id}
                          className="pill bg-gray-800 text-gray-300 border border-gray-700"
                        >
                          <Lock className="w-3 h-3 text-gray-500" />
                          {blockedSubject.n}
                          <span className="text-gray-500">· {blockedSubject.l}°</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PendingFinals;
