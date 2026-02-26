import React from 'react';
import { BookOpen, CheckCircle, Target, Trophy, GraduationCap } from 'lucide-react';

/**
 * Componente para mostrar estadísticas generales y del título intermedio
 */
const Statistics = ({ progress, intermediateProgress, intermediateCompleted }) => {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
      {/* Título */}
      <h2 className="text-lg font-bold text-blue-400 flex items-center gap-2">
        <Target className="w-5 h-5" />
        Estadísticas
      </h2>

      {/* Progreso General */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Progreso General
        </h3>
        
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="bg-gray-700/50 rounded p-2 text-center">
            <div className="text-gray-400 text-xs">No Cursadas</div>
            <div className="text-gray-300 font-bold">{progress.noCursadas}</div>
          </div>
          <div className="bg-yellow-500/20 rounded p-2 text-center">
            <div className="text-yellow-300 text-xs">Regulares</div>
            <div className="text-yellow-100 font-bold">{progress.regulares}</div>
          </div>
          <div className="bg-green-500/20 rounded p-2 text-center">
            <div className="text-green-300 text-xs">Aprobadas</div>
            <div className="text-green-100 font-bold">{progress.aprobadas}</div>
          </div>
        </div>

        {/* Barra de progreso general */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Total: {progress.aprobadas}/{progress.total}</span>
            <span>{progress.porcentaje}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
              style={{ width: `${progress.porcentaje}%` }}
            />
          </div>
        </div>
      </div>

      {/* Progreso Título Intermedio */}
      <div className="space-y-2 border-t border-gray-700 pt-3">
        <h3 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
          <GraduationCap className="w-4 h-4" />
          Título Intermedio
          <span className="text-xs text-gray-400">(Analista Universitario)</span>
        </h3>

        {intermediateCompleted ? (
          <div className="bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-500 rounded-lg p-3 flex items-center gap-2 animate-pulse-slow">
            <Trophy className="w-6 h-6 text-green-400" />
            <div>
              <div className="text-green-100 font-bold text-sm">
                ¡Felicitaciones!
              </div>
              <div className="text-green-200 text-xs">
                Requisitos de Analista Universitario de Sistemas completados
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Progreso: {intermediateProgress.completed}/{intermediateProgress.total}</span>
                <span>{intermediateProgress.porcentaje}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${intermediateProgress.porcentaje}%` }}
                />
              </div>
            </div>

            <div className="text-xs text-gray-400 italic">
              Faltan {intermediateProgress.total - intermediateProgress.completed} materias para obtener el título
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Statistics;
