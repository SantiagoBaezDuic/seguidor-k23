import React, { useState } from 'react';
import { GraduationCap, ChevronDown, ChevronUp, Lock } from 'lucide-react';

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
    <div className="container mx-auto px-4 py-4">
      <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <GraduationCap className="w-6 h-6 text-orange-400" />
          <h2 className="text-xl font-bold text-gray-200">Finales Pendientes</h2>
          {pendingFinals.length > 0 && (
            <span className="px-2 py-1 bg-orange-600/20 text-orange-400 rounded-full text-sm font-medium">
              {pendingFinals.length} {pendingFinals.length === 1 ? 'final' : 'finales'}
            </span>
          )}
        </div>

        {sortedPendingFinals.length === 0 ? (
          <p className="text-gray-400">No tenés finales pendientes.</p>
        ) : (
          <div className="space-y-3">
            {sortedPendingFinals.map(({ subject, blocking }) => {
              const isExpanded = expandedIds.has(subject.id);

              return (
                <div key={subject.id} className="bg-gray-700/30 rounded-lg border border-gray-600">
                  <button
                    onClick={() => blocking.length > 0 && toggleExpansion(subject.id)}
                    className={`w-full p-4 flex items-center justify-between transition-colors ${
                      blocking.length > 0 ? 'hover:bg-gray-700/50 cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-medium text-gray-200">{subject.n}</p>
                      <p className="text-xs text-gray-400">Nivel {subject.l}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {blocking.length > 0 ? (
                        <>
                          <span className="px-2 py-1 bg-red-600/20 text-red-300 text-xs rounded font-medium flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Bloquea a {blocking.length}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </>
                      ) : (
                        <span className="px-2 py-1 bg-gray-600/30 text-gray-400 text-xs rounded font-medium">
                          No bloquea materias
                        </span>
                      )}
                    </div>
                  </button>

                  {isExpanded && blocking.length > 0 && (
                    <div className="px-4 pb-4 border-t border-gray-600">
                      <p className="text-xs text-gray-400 mt-3 mb-2">
                        Necesitan que apruebes este final:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {blocking.map(blockedSubject => (
                          <div
                            key={blockedSubject.id}
                            className="bg-red-900/20 border border-red-700/50 p-2 rounded text-sm"
                          >
                            <p className="text-gray-200">{blockedSubject.n}</p>
                            <p className="text-xs text-gray-400">Nivel {blockedSubject.l}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingFinals;
